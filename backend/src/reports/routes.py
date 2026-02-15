from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
import io
import csv

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/enrollment")
def enrollment_report(
    academic_year_id: Optional[str] = Query(None),
    format: str = Query("json", regex="^(json|csv)$"),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        ay = academic_year_id
        if not ay:
            r = fetch_one(cur, "SELECT id FROM academic_years WHERE is_current = true LIMIT 1")
            ay = str(r["id"]) if r else None
        if not ay:
            return [] if format == "json" else _csv_response([], [])
        cur.execute("""
            SELECT c.name AS class_name, f.name AS form_name, s.name AS stream_name, COUNT(sc.student_id) AS student_count
            FROM classes c
            JOIN forms f ON f.id = c.form_id
            JOIN streams s ON s.id = c.stream_id
            LEFT JOIN student_classes sc ON sc.class_id = c.id AND sc.academic_year_id = c.academic_year_id
            WHERE c.academic_year_id = %s
            GROUP BY c.id, c.name, f.name, s.name, f.display_order, s.name
            ORDER BY f.display_order, s.name
        """, (ay,))
        rows = cur.fetchall()
        data = [dict(r) for r in rows]
        if format == "csv":
            return _csv_response(data, ["class_name", "form_name", "stream_name", "student_count"])
        return data


@router.get("/gender-distribution")
def gender_distribution(
    academic_year_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        ay = academic_year_id or _current_ay(cur)
        cur.execute("""
            SELECT s.gender, COUNT(*) AS count
            FROM students s
            JOIN student_classes sc ON sc.student_id = s.id
            WHERE sc.academic_year_id = %s
            GROUP BY s.gender
        """, (ay,))
        return [dict(r) for r in cur.fetchall()]


@router.get("/zimsec-candidates")
def zimsec_candidates(
    academic_year_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        ay = academic_year_id or _current_ay(cur)
        cur.execute("""
            SELECT s.id, s.first_name, s.last_name, c.name AS class_name, f.name AS form_name
            FROM students s
            JOIN student_classes sc ON sc.student_id = s.id
            JOIN classes c ON c.id = sc.class_id
            JOIN forms f ON f.id = c.form_id
            WHERE sc.academic_year_id = %s AND f.name IN ('Form 4', 'Form 6')
            ORDER BY f.display_order, c.name, s.last_name
        """, (ay,))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"])) for r in rows]


def _current_ay(cur):
    r = fetch_one(cur, "SELECT id FROM academic_years WHERE is_current = true LIMIT 1")
    return str(r["id"]) if r else None


def _csv_response(rows: list, headers: list):
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=headers, extrasaction="ignore")
    w.writeheader()
    w.writerows(rows)
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=report.csv"})
