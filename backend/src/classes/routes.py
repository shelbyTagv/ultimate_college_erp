from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("")
def list_classes(
    academic_year_id: Optional[str] = Query(None),
    form_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        ay = academic_year_id
        if not ay:
            row = fetch_one(cur, "SELECT id FROM academic_years WHERE is_current = true LIMIT 1")
            ay = str(row["id"]) if row else None
        if not ay:
            return []
        if form_id:
            cur.execute("""
                SELECT c.id, c.name, c.form_id, c.stream_id, f.name AS form_name, s.name AS stream_name
                FROM classes c
                JOIN forms f ON f.id = c.form_id
                JOIN streams s ON s.id = c.stream_id
                WHERE c.academic_year_id = %s AND c.form_id = %s
                ORDER BY f.display_order, s.name
            """, (ay, form_id))
        else:
            cur.execute("""
                SELECT c.id, c.name, c.form_id, c.stream_id, f.name AS form_name, s.name AS stream_name
                FROM classes c
                JOIN forms f ON f.id = c.form_id
                JOIN streams s ON s.id = c.stream_id
                WHERE c.academic_year_id = %s
                ORDER BY f.display_order, s.name
            """, (ay,))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), form_id=str(r["form_id"]), stream_id=str(r["stream_id"])) for r in rows]


@router.get("/academic-years")
def list_academic_years(current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"]))):
    with get_cursor() as cur:
        cur.execute("SELECT id, name, start_date, end_date, is_current FROM academic_years ORDER BY start_date DESC")
        return [dict(r, id=str(r["id"])) for r in cur.fetchall()]


@router.get("/forms")
def list_forms(current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"]))):
    with get_cursor() as cur:
        cur.execute("SELECT id, name, display_order FROM forms ORDER BY display_order")
        return [dict(r, id=str(r["id"])) for r in cur.fetchall()]


@router.get("/terms")
def list_terms(
    academic_year_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        ay = academic_year_id
        if not ay:
            row = fetch_one(cur, "SELECT id FROM academic_years WHERE is_current = true LIMIT 1")
            ay = str(row["id"]) if row else None
        if not ay:
            return []
        cur.execute("SELECT id, name, start_date, end_date FROM terms WHERE academic_year_id = %s ORDER BY start_date", (ay,))
        return [dict(r, id=str(r["id"])) for r in cur.fetchall()]


@router.get("/streams")
def list_streams(
    form_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        if form_id:
            cur.execute("SELECT id, name, form_id FROM streams WHERE form_id = %s ORDER BY name", (form_id,))
        else:
            cur.execute("SELECT id, name, form_id FROM streams ORDER BY form_id, name")
        return [dict(r, id=str(r["id"]), form_id=str(r["form_id"])) for r in cur.fetchall()]


@router.get("/{class_id}")
def get_class(
    class_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER"])),
):
    with get_cursor() as cur:
        row = fetch_one(cur, """
            SELECT c.*, f.name AS form_name, s.name AS stream_name, ay.name AS academic_year_name
            FROM classes c
            JOIN forms f ON f.id = c.form_id
            JOIN streams s ON s.id = c.stream_id
            JOIN academic_years ay ON ay.id = c.academic_year_id
            WHERE c.id = %s
        """, (class_id,))
        if not row:
            raise HTTPException(status_code=404)
        out = dict(row)
        out["id"] = str(out["id"])
        out["form_id"] = str(out["form_id"])
        out["stream_id"] = str(out["stream_id"])
        out["academic_year_id"] = str(out["academic_year_id"])
        return out
