from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/assignments", tags=["assignments"])


class CreateAssignmentBody(BaseModel):
    class_id: str
    subject_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    total_marks: float = 100
    term_id: Optional[str] = None


class GradeSubmissionBody(BaseModel):
    marks: Optional[float] = None
    feedback: Optional[str] = None


@router.get("")
def list_assignments(
    class_id: Optional[str] = Query(None),
    subject_id: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT"])),
):
    with get_cursor() as cur:
        if student_id:
            if current["role"] == "STUDENT" and current.get("student_id") != student_id:
                raise HTTPException(status_code=403)
            cur.execute("""
                SELECT a.id, a.class_id, a.subject_id, a.title, a.description, a.due_date, a.total_marks, a.created_at,
                       sub.name AS subject_name, c.name AS class_name,
                       asub.marks, asub.feedback, asub.submitted_at, asub.file_name
                FROM assignments a
                JOIN subjects sub ON sub.id = a.subject_id
                JOIN classes c ON c.id = a.class_id
                JOIN student_classes sc ON sc.class_id = a.class_id AND sc.student_id = %s
                LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = %s
                ORDER BY a.due_date DESC NULLS LAST
            """, (student_id, student_id))
        elif class_id:
            cur.execute("""
                SELECT a.id, a.class_id, a.subject_id, a.title, a.due_date, a.total_marks, a.created_at,
                       sub.name AS subject_name
                FROM assignments a
                JOIN subjects sub ON sub.id = a.subject_id
                WHERE a.class_id = %s
                ORDER BY a.created_at DESC
            """, (class_id,))
        else:
            cur.execute("""
                SELECT a.id, a.class_id, a.subject_id, a.title, a.due_date, a.total_marks, a.created_at,
                       sub.name AS subject_name, c.name AS class_name
                FROM assignments a
                JOIN subjects sub ON sub.id = a.subject_id
                JOIN classes c ON c.id = a.class_id
                ORDER BY a.created_at DESC
            """)
        rows = cur.fetchall()
        return [_row_to_dict(r) for r in rows]


def _row_to_dict(r):
    d = dict(r)
    for k in ("id", "class_id", "subject_id", "term_id"):
        if k in d and d[k]:
            d[k] = str(d[k])
    return d


@router.post("")
def create_assignment(
    body: CreateAssignmentBody,
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    teacher_id = current.get("teacher_id")
    if current["role"] == "TEACHER" and not teacher_id:
        raise HTTPException(status_code=403, detail="Teacher profile not found")
    with get_cursor() as cur:
        tid = teacher_id or fetch_one(cur, "SELECT id FROM teachers LIMIT 1")["id"]
        cur.execute("""
            INSERT INTO assignments (class_id, subject_id, created_by, title, description, due_date, total_marks, term_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, class_id, subject_id, title, due_date, total_marks, created_at
        """, (body.class_id, body.subject_id, tid, body.title, body.description, body.due_date, body.total_marks, body.term_id))
        row = cur.fetchone()
        return _row_to_dict(row)


@router.get("/{assignment_id}")
def get_assignment(
    assignment_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT"])),
):
    with get_cursor() as cur:
        row = fetch_one(cur, """
            SELECT a.*, sub.name AS subject_name, c.name AS class_name
            FROM assignments a
            JOIN subjects sub ON sub.id = a.subject_id
            JOIN classes c ON c.id = a.class_id
            WHERE a.id = %s
        """, (assignment_id,))
        if not row:
            raise HTTPException(status_code=404)
        return _row_to_dict(row)


@router.get("/{assignment_id}/submissions")
def list_submissions(
    assignment_id: str,
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    with get_cursor() as cur:
        cur.execute("""
            SELECT asub.id, asub.student_id, asub.marks, asub.feedback, asub.submitted_at, asub.file_name,
                   s.first_name, s.last_name
            FROM assignment_submissions asub
            JOIN students s ON s.id = asub.student_id
            WHERE asub.assignment_id = %s
        """, (assignment_id,))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), student_id=str(r["student_id"])) for r in rows]


@router.post("/{assignment_id}/submit")
def submit_assignment(
    assignment_id: str,
    file_path: Optional[str] = None,
    file_name: Optional[str] = None,
    current=Depends(require_roles(["STUDENT"])),
):
    student_id = current.get("student_id")
    if not student_id:
        raise HTTPException(status_code=403, detail="Student profile not found")
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO assignment_submissions (assignment_id, student_id, file_path, file_name)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (assignment_id, student_id) DO UPDATE SET file_path = EXCLUDED.file_path, file_name = EXCLUDED.file_name, submitted_at = NOW()
        """, (assignment_id, student_id, file_path or "", file_name or ""))
    return {"ok": True}


@router.post("/{assignment_id}/submissions/{submission_id}/grade")
def grade_submission(
    assignment_id: str,
    submission_id: str,
    body: GradeSubmissionBody,
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    teacher_id = current.get("teacher_id")
    with get_cursor() as cur:
        tid = teacher_id or fetch_one(cur, "SELECT id FROM teachers LIMIT 1")["id"]
        cur.execute("""
            UPDATE assignment_submissions SET marks = %s, feedback = %s, graded_by = %s, graded_at = NOW()
            WHERE id = %s AND assignment_id = %s
        """, (body.marks, body.feedback, tid, submission_id, assignment_id))
    return {"ok": True}
