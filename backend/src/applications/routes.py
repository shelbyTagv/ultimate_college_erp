from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import get_current_user_optional, require_roles

router = APIRouter(prefix="/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    desired_form_id: str
    intended_stream_id: str


class ApplicationReview(BaseModel):
    status: str  # APPROVED, REJECTED
    review_notes: Optional[str] = None


@router.post("")
def submit_application(
    data: ApplicationCreate,
):
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO applications (first_name, last_name, email, phone, date_of_birth, gender, address, desired_form_id, intended_stream_id, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDING')
            RETURNING id, first_name, last_name, email, status, created_at
        """, (data.first_name, data.last_name, data.email, data.phone, data.date_of_birth, data.gender, data.address, data.desired_form_id, data.intended_stream_id))
        row = cur.fetchone()
        return dict(row, id=str(row["id"]))


@router.post("/{application_id}/documents")
def add_document(
    application_id: str,
    document_type: str,
    file_path: str,
    file_name: Optional[str] = None,
    current=Depends(get_current_user_optional),
):
    with get_cursor() as cur:
        app = fetch_one(cur, "SELECT id FROM applications WHERE id = %s AND status = 'PENDING'", (application_id,))
        if not app:
            raise HTTPException(status_code=404, detail="Application not found or already processed")
        cur.execute("INSERT INTO application_documents (application_id, document_type, file_path, file_name) VALUES (%s, %s, %s, %s) RETURNING id",
                    (application_id, document_type, file_path, file_name))
        row = cur.fetchone()
        return dict(row, id=str(row["id"]))


@router.get("")
def list_applications(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        q = """
            SELECT a.id, a.first_name, a.last_name, a.email, a.phone, a.status, a.created_at,
                   f.name AS desired_form, s.name AS intended_stream
            FROM applications a
            JOIN forms f ON f.id = a.desired_form_id
            JOIN streams s ON s.id = a.intended_stream_id
            WHERE 1=1
        """
        params = []
        if status:
            q += " AND a.status = %s"
            params.append(status)
        q += " ORDER BY a.created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, skip])
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"])) for r in rows]


@router.get("/{application_id}")
def get_application(
    application_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        row = fetch_one(cur, """
            SELECT a.*, f.name AS desired_form_name, s.name AS intended_stream_name
            FROM applications a
            JOIN forms f ON f.id = a.desired_form_id
            JOIN streams s ON s.id = a.intended_stream_id
            WHERE a.id = %s
        """, (application_id,))
        if not row:
            raise HTTPException(status_code=404)
        out = dict(row)
        out["id"] = str(out["id"])
        out["desired_form_id"] = str(out["desired_form_id"])
        out["intended_stream_id"] = str(out["intended_stream_id"])
        cur.execute("SELECT id, document_type, file_path, file_name FROM application_documents WHERE application_id = %s", (application_id,))
        out["documents"] = [dict(d, id=str(d["id"])) for d in cur.fetchall()]
        return out


@router.post("/{application_id}/review")
def review_application(
    application_id: str,
    body: ApplicationReview,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    if body.status not in ("APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail="status must be APPROVED or REJECTED")
    with get_cursor() as cur:
        app = fetch_one(cur, "SELECT * FROM applications WHERE id = %s AND status = 'PENDING'", (application_id,))
        if not app:
            raise HTTPException(status_code=404)
        cur.execute("""
            UPDATE applications SET status = %s, review_notes = %s, reviewed_by = %s, reviewed_at = NOW()
            WHERE id = %s
        """, (body.status, body.review_notes, current["id"], application_id))
        if body.status == "APPROVED":
            cur.execute("""
                INSERT INTO students (first_name, last_name)
                SELECT first_name, last_name FROM applications WHERE id = %s
                RETURNING id
            """, (application_id,))
            student_row = cur.fetchone()
            if student_row:
                cur.execute("UPDATE applications SET student_id = %s WHERE id = %s", (student_row["id"], application_id))
        return {"ok": True, "status": body.status}
