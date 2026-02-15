from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/results", tags=["results"])


@router.get("/student/{student_id}")
def get_student_results(
    student_id: str,
    term_id: Optional[str] = Query(None),
    academic_year_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    if current["role"] == "STUDENT" and current.get("student_id") != student_id:
        raise HTTPException(status_code=403)
    if current["role"] == "PARENT":
        with get_cursor() as cur:
            cur.execute("SELECT 1 FROM parent_student_links WHERE parent_id = (SELECT id FROM parents WHERE user_id = %s) AND student_id = %s",
                        (current["id"], student_id))
            if not cur.fetchone():
                raise HTTPException(status_code=403)
    with get_cursor() as cur:
        q = """
            SELECT er.id, er.marks, er.approved_at, e.name AS exam_name, e.exam_type, e.total_marks,
                   sub.name AS subject_name, t.name AS term_name
            FROM exam_results er
            JOIN exams e ON e.id = er.exam_id
            JOIN terms t ON t.id = e.term_id
            JOIN subjects sub ON sub.id = e.subject_id
            WHERE er.student_id = %s
        """
        params = [student_id]
        if term_id:
            q += " AND e.term_id = %s"
            params.append(term_id)
        if academic_year_id:
            q += " AND t.academic_year_id = %s"
            params.append(academic_year_id)
        q += " ORDER BY t.start_date, sub.name"
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"])) for r in rows]


@router.get("/class/{class_id}")
def get_class_results(
    class_id: str,
    term_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        q = """
            SELECT er.student_id, s.first_name, s.last_name, er.marks, e.name AS exam_name, sub.name AS subject_name
            FROM exam_results er
            JOIN exams e ON e.id = er.exam_id
            JOIN students s ON s.id = er.student_id
            JOIN subjects sub ON sub.id = e.subject_id
            JOIN student_classes sc ON sc.student_id = s.id AND sc.class_id = %s
            WHERE e.class_id = %s
        """
        params = [class_id, class_id]
        if term_id:
            q += " AND e.term_id = %s"
            params.append(term_id)
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, student_id=str(r["student_id"])) for r in rows]
