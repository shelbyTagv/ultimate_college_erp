from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("")
def list_teachers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        cur.execute("""
            SELECT t.id, t.user_id, t.first_name, t.last_name, t.title, t.phone, t.employee_number
            FROM teachers t ORDER BY t.last_name, t.first_name LIMIT %s OFFSET %s
        """, (limit, skip))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), user_id=str(r["user_id"])) for r in rows]


@router.get("/me")
def get_my_profile(current=Depends(require_roles(["TEACHER"]))):
    with get_cursor() as cur:
        t = fetch_one(cur, "SELECT * FROM teachers WHERE user_id = %s", (current["id"],))
        if not t:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
        out = dict(t)
        out["id"] = str(out["id"])
        out["user_id"] = str(out["user_id"])
        cur.execute("""
            SELECT c.id AS class_id, c.name AS class_name, sub.name AS subject_name, sub.id AS subject_id
            FROM class_teachers ct
            JOIN classes c ON c.id = ct.class_id
            JOIN subjects sub ON sub.id = ct.subject_id
            WHERE ct.teacher_id = %s AND ct.academic_year_id = (SELECT id FROM academic_years WHERE is_current = true LIMIT 1)
        """, (out["id"],))
        out["classes"] = [dict(r, class_id=str(r["class_id"]), subject_id=str(r["subject_id"])) for r in cur.fetchall()]
        return out


@router.get("/{teacher_id}")
def get_teacher(
    teacher_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        t = fetch_one(cur, "SELECT * FROM teachers WHERE id = %s", (teacher_id,))
        if not t:
            raise HTTPException(status_code=404)
        return dict(t, id=str(t["id"]), user_id=str(t["user_id"]))
