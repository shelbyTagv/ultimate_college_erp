from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/exams", tags=["exams"])


class CreateExamBody(BaseModel):
    term_id: str
    class_id: str
    subject_id: str
    name: str
    exam_type: str  # CONTINUOUS, TEST, TERM, FINAL, ZIMSEC
    total_marks: float = 100


class EnterResultBody(BaseModel):
    student_id: str
    marks: float


@router.get("")
def list_exams(
    term_id: Optional[str] = Query(None),
    class_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        q = """
            SELECT e.id, e.term_id, e.class_id, e.subject_id, e.name, e.exam_type, e.total_marks, e.created_at,
                   sub.name AS subject_name, c.name AS class_name, t.name AS term_name
            FROM exams e
            JOIN subjects sub ON sub.id = e.subject_id
            JOIN classes c ON c.id = e.class_id
            JOIN terms t ON t.id = e.term_id
            WHERE 1=1
        """
        params = []
        if term_id:
            q += " AND e.term_id = %s"
            params.append(term_id)
        if class_id:
            q += " AND e.class_id = %s"
            params.append(class_id)
        q += " ORDER BY e.created_at DESC"
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), term_id=str(r["term_id"]), class_id=str(r["class_id"]), subject_id=str(r["subject_id"])) for r in rows]


@router.post("")
def create_exam(
    body: CreateExamBody,
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    if body.exam_type not in ("CONTINUOUS", "TEST", "TERM", "FINAL", "ZIMSEC"):
        raise HTTPException(status_code=400, detail="Invalid exam_type")
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO exams (term_id, class_id, subject_id, name, exam_type, total_marks)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, term_id, class_id, subject_id, name, exam_type, total_marks, created_at
        """, (body.term_id, body.class_id, body.subject_id, body.name, body.exam_type, body.total_marks))
        row = cur.fetchone()
        return dict(row, id=str(row["id"]), term_id=str(row["term_id"]), class_id=str(row["class_id"]), subject_id=str(row["subject_id"]))


@router.get("/{exam_id}/results")
def get_exam_results(
    exam_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        cur.execute("""
            SELECT er.id, er.student_id, er.marks, er.approved_at, s.first_name, s.last_name
            FROM exam_results er
            JOIN students s ON s.id = er.student_id
            WHERE er.exam_id = %s
        """, (exam_id,))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), student_id=str(r["student_id"])) for r in rows]


@router.post("/{exam_id}/results")
def enter_result(
    exam_id: str,
    body: EnterResultBody,
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    teacher_id = current.get("teacher_id")
    with get_cursor() as cur:
        tid = teacher_id or fetch_one(cur, "SELECT id FROM teachers LIMIT 1")["id"]
        cur.execute("""
            INSERT INTO exam_results (exam_id, student_id, marks, entered_by)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (exam_id, student_id) DO UPDATE SET marks = EXCLUDED.marks, updated_at = NOW()
        """, (exam_id, body.student_id, body.marks, tid))
    return {"ok": True}


@router.post("/{exam_id}/results/approve")
def approve_results(
    exam_id: str,
    current=Depends(require_roles(["ADMIN_STAFF", "SUPER_ADMIN"])),
):
    with get_cursor() as cur:
        cur.execute("""
            UPDATE exam_results SET approved_by = %s, approved_at = NOW()
            WHERE exam_id = %s
        """, (current["id"], exam_id))
    return {"ok": True}
