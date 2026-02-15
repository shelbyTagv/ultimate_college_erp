from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/students", tags=["students"])


@router.get("")
def list_students(
    form_id: Optional[str] = Query(None),
    class_id: Optional[str] = Query(None),
    academic_year_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        if class_id:
            cur.execute("""
                SELECT s.id, s.user_id, s.first_name, s.last_name, s.date_of_birth, s.gender, s.phone, s.enrollment_status,
                       sc.class_id, c.name AS class_name, f.name AS form_name
                FROM students s
                JOIN student_classes sc ON sc.student_id = s.id
                JOIN classes c ON c.id = sc.class_id
                JOIN forms f ON f.id = c.form_id
                WHERE sc.class_id = %s
                ORDER BY s.last_name, s.first_name
                LIMIT %s OFFSET %s
            """, (class_id, limit, skip))
        elif form_id and academic_year_id:
            cur.execute("""
                SELECT s.id, s.first_name, s.last_name, s.gender, s.enrollment_status, c.name AS class_name
                FROM students s
                JOIN student_classes sc ON sc.student_id = s.id
                JOIN classes c ON c.id = sc.class_id
                WHERE c.form_id = %s AND sc.academic_year_id = %s
                ORDER BY s.last_name
                LIMIT %s OFFSET %s
            """, (form_id, academic_year_id, limit, skip))
        else:
            cur.execute("""
                SELECT id, user_id, first_name, last_name, date_of_birth, gender, phone, enrollment_status, created_at
                FROM students ORDER BY last_name, first_name LIMIT %s OFFSET %s
            """, (limit, skip))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), user_id=str(r["user_id"]) if r.get("user_id") else None) for r in rows]


@router.get("/me")
def get_my_profile(current=Depends(require_roles(["STUDENT"]))):
    with get_cursor() as cur:
        s = fetch_one(cur, "SELECT * FROM students WHERE user_id = %s", (current["id"],))
        if not s:
            raise HTTPException(status_code=404, detail="Student profile not found")
        out = dict(s)
        out["id"] = str(out["id"])
        out["user_id"] = str(out["user_id"]) if out.get("user_id") else None
        cur.execute("""
            SELECT c.id AS class_id, c.name AS class_name, f.name AS form_name, s2.name AS stream_name
            FROM student_classes sc
            JOIN classes c ON c.id = sc.class_id
            JOIN forms f ON f.id = c.form_id
            JOIN streams s2 ON s2.id = c.stream_id
            WHERE sc.student_id = %s AND sc.academic_year_id = (SELECT id FROM academic_years WHERE is_current = true LIMIT 1)
        """, (out["id"],))
        cls = cur.fetchone()
        if cls:
            out["class_id"] = str(cls["class_id"])
            out["class_name"] = cls["class_name"]
            out["form_name"] = cls["form_name"]
            out["stream_name"] = cls["stream_name"]
        return out


@router.get("/{student_id}")
def get_student(
    student_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "PARENT"])),
):
    with get_cursor() as cur:
        s = fetch_one(cur, "SELECT * FROM students WHERE id = %s", (student_id,))
        if not s:
            raise HTTPException(status_code=404)
        if current["role"] == "PARENT":
            cur.execute("SELECT 1 FROM parent_student_links WHERE parent_id = (SELECT id FROM parents WHERE user_id = %s) AND student_id = %s",
                        (current["id"], student_id))
            if not cur.fetchone():
                raise HTTPException(status_code=403, detail="Not linked to this student")
        out = dict(s)
        out["id"] = str(out["id"])
        out["user_id"] = str(out["user_id"]) if out.get("user_id") else None
        return out
