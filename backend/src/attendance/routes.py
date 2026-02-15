from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/attendance", tags=["attendance"])


class MarkAttendanceBody(BaseModel):
    student_id: str
    date: date
    status: str  # PRESENT, ABSENT, LATE, EXCUSED
    notes: Optional[str] = None


class BulkAttendanceBody(BaseModel):
    date: date
    entries: list[dict]  # [{"student_id": "...", "status": "PRESENT"}, ...]


@router.get("")
def list_attendance(
    class_id: str = Query(...),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        q = """
            SELECT a.id, a.student_id, a.class_id, a.date, a.status, a.notes, a.created_at,
                   s.first_name, s.last_name
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            WHERE a.class_id = %s
        """
        params = [class_id]
        if from_date:
            q += " AND a.date >= %s"
            params.append(from_date)
        if to_date:
            q += " AND a.date <= %s"
            params.append(to_date)
        q += " ORDER BY a.date DESC, s.last_name"
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), student_id=str(r["student_id"]), class_id=str(r["class_id"])) for r in rows]


@router.get("/student/{student_id}")
def get_student_attendance(
    student_id: str,
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    if current["role"] == "STUDENT" and current.get("student_id") != student_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if current["role"] == "PARENT":
        with get_cursor() as cur:
            cur.execute("SELECT 1 FROM parent_student_links WHERE parent_id = (SELECT id FROM parents WHERE user_id = %s) AND student_id = %s",
                        (current["id"], student_id))
            if not cur.fetchone():
                raise HTTPException(status_code=403)
    with get_cursor() as cur:
        q = "SELECT id, student_id, class_id, date, status, notes FROM attendance WHERE student_id = %s"
        params = [student_id]
        if from_date:
            q += " AND date >= %s"
            params.append(from_date)
        if to_date:
            q += " AND date <= %s"
            params.append(to_date)
        q += " ORDER BY date DESC"
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), student_id=str(r["student_id"]), class_id=str(r["class_id"])) for r in rows]


@router.post("")
def mark_attendance(
    body: MarkAttendanceBody,
    class_id: str = Query(...),
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    if body.status not in ("PRESENT", "ABSENT", "LATE", "EXCUSED"):
        raise HTTPException(status_code=400, detail="Invalid status")
    teacher_id = current.get("teacher_id") if current.get("role") == "TEACHER" else None
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO attendance (student_id, class_id, date, status, notes, marked_by)
            VALUES (%s, %s, %s, %s, %s, (SELECT id FROM teachers WHERE user_id = %s LIMIT 1))
            ON CONFLICT (student_id, class_id, date) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes
        """, (body.student_id, class_id, body.date, body.status, body.notes or "", current["id"]))
        if teacher_id:
            cur.execute("UPDATE attendance SET marked_by = %s WHERE student_id = %s AND class_id = %s AND date = %s",
                        (teacher_id, body.student_id, class_id, body.date))
    return {"ok": True}


@router.post("/bulk")
def bulk_mark(
    body: BulkAttendanceBody,
    class_id: str = Query(...),
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    teacher_id = current.get("teacher_id") if current.get("role") == "TEACHER" else None
    with get_cursor() as cur:
        for e in body.entries:
            sid = e.get("student_id")
            status = e.get("status", "PRESENT")
            if status not in ("PRESENT", "ABSENT", "LATE", "EXCUSED") or not sid:
                continue
            cur.execute("""
                INSERT INTO attendance (student_id, class_id, date, status, marked_by)
                VALUES (%s, %s, %s, %s, (SELECT id FROM teachers WHERE user_id = %s LIMIT 1))
                ON CONFLICT (student_id, class_id, date) DO UPDATE SET status = EXCLUDED.status
            """, (sid, class_id, body.date, status, current["id"]))
    return {"ok": True}
