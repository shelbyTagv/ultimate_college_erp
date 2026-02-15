from typing import Optional
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/finance", tags=["finance"])


class CreateInvoiceBody(BaseModel):
    student_id: str
    academic_year_id: str
    term_id: Optional[str] = None
    amount: Decimal
    due_date: Optional[date] = None


class RecordPaymentBody(BaseModel):
    amount: Decimal
    payment_date: date
    payment_method: Optional[str] = None
    reference: Optional[str] = None


@router.get("/fee-structures")
def list_fee_structures(
    academic_year_id: Optional[str] = Query(None),
    form_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER"])),
):
    with get_cursor() as cur:
        ay = academic_year_id or _current_ay_id(cur)
        q = "SELECT id, academic_year_id, form_id, stream_id, amount, description FROM fee_structures WHERE academic_year_id = %s"
        params = [ay]
        if form_id:
            q += " AND form_id = %s"
            params.append(form_id)
        cur.execute(q, params)
        return [dict(r, id=str(r["id"]), academic_year_id=str(r["academic_year_id"]), form_id=str(r["form_id"]), stream_id=str(r["stream_id"]) if r.get("stream_id") else None) for r in cur.fetchall()]


def _current_ay_id(cur):
    r = fetch_one(cur, "SELECT id FROM academic_years WHERE is_current = true LIMIT 1")
    return str(r["id"]) if r else None


@router.get("/invoices")
def list_invoices(
    student_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER", "STUDENT", "PARENT"])),
):
    if current["role"] == "STUDENT":
        student_id = current.get("student_id")
        if not student_id:
            raise HTTPException(status_code=403)
    if current["role"] == "PARENT":
        student_id = None  # could filter by linked students
    with get_cursor() as cur:
        q = """
            SELECT i.id, i.student_id, i.academic_year_id, i.term_id, i.amount, i.due_date, i.status, i.created_at,
                   s.first_name, s.last_name, ay.name AS academic_year_name
            FROM invoices i
            JOIN students s ON s.id = i.student_id
            JOIN academic_years ay ON ay.id = i.academic_year_id
            WHERE 1=1
        """
        params = []
        if student_id:
            q += " AND i.student_id = %s"
            params.append(student_id)
        if status:
            q += " AND i.status = %s"
            params.append(status)
        q += " ORDER BY i.created_at DESC"
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), student_id=str(r["student_id"]), academic_year_id=str(r["academic_year_id"]), term_id=str(r["term_id"]) if r.get("term_id") else None) for r in rows]


@router.get("/invoices/{invoice_id}")
def get_invoice(
    invoice_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER", "STUDENT", "PARENT"])),
):
    with get_cursor() as cur:
        row = fetch_one(cur, """
            SELECT i.*, s.first_name, s.last_name, ay.name AS academic_year_name, t.name AS term_name
            FROM invoices i
            JOIN students s ON s.id = i.student_id
            JOIN academic_years ay ON ay.id = i.academic_year_id
            LEFT JOIN terms t ON t.id = i.term_id
            WHERE i.id = %s
        """, (invoice_id,))
        if not row:
            raise HTTPException(status_code=404)
        if current["role"] == "STUDENT" and str(row["student_id"]) != current.get("student_id"):
            raise HTTPException(status_code=403)
        if current["role"] == "PARENT":
            cur.execute("SELECT 1 FROM parent_student_links WHERE parent_id = (SELECT id FROM parents WHERE user_id = %s) AND student_id = %s",
                        (current["id"], row["student_id"]))
            if not cur.fetchone():
                raise HTTPException(status_code=403)
        out = dict(row)
        out["id"] = str(out["id"])
        out["student_id"] = str(out["student_id"])
        out["academic_year_id"] = str(out["academic_year_id"])
        out["term_id"] = str(out["term_id"]) if out.get("term_id") else None
        cur.execute("SELECT id, amount, payment_date, payment_method, reference FROM payments WHERE invoice_id = %s", (invoice_id,))
        out["payments"] = [dict(p, id=str(p["id"])) for p in cur.fetchall()]
        return out


@router.post("/invoices")
def create_invoice(
    body: CreateInvoiceBody,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER"])),
):
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO invoices (student_id, academic_year_id, term_id, amount, due_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, student_id, amount, status, due_date
        """, (body.student_id, body.academic_year_id, body.term_id, body.amount, body.due_date))
        row = cur.fetchone()
        return dict(row, id=str(row["id"]), student_id=str(row["student_id"]))


@router.post("/invoices/{invoice_id}/payments")
def record_payment(
    invoice_id: str,
    body: RecordPaymentBody,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER"])),
):
    with get_cursor() as cur:
        cur.execute("INSERT INTO payments (invoice_id, amount, payment_date, payment_method, reference, recorded_by) VALUES (%s, %s, %s, %s, %s, %s)",
                    (invoice_id, body.amount, body.payment_date, body.payment_method, body.reference, current["id"]))
        cur.execute("""
            WITH tot AS (SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = %s)
            UPDATE invoices SET status = CASE WHEN (SELECT paid FROM tot) >= amount THEN 'PAID' WHEN (SELECT paid FROM tot) > 0 THEN 'PARTIAL' ELSE status END, updated_at = NOW()
            WHERE id = %s
        """, (invoice_id, invoice_id))
    return {"ok": True}


@router.get("/debtors")
def list_debtors(
    academic_year_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER"])),
):
    with get_cursor() as cur:
        ay = academic_year_id or _current_ay_id(cur)
        cur.execute("""
            SELECT i.student_id, s.first_name, s.last_name,
                   SUM(i.amount) AS total_invoiced,
                   COALESCE(SUM(p.amount), 0) AS total_paid,
                   SUM(i.amount) - COALESCE(SUM(p.amount), 0) AS balance
            FROM invoices i
            JOIN students s ON s.id = i.student_id
            LEFT JOIN payments p ON p.invoice_id = i.id
            WHERE i.academic_year_id = %s
            GROUP BY i.student_id, s.first_name, s.last_name
            HAVING SUM(i.amount) > COALESCE(SUM(p.amount), 0)
            ORDER BY balance DESC
        """, (ay,))
        rows = cur.fetchall()
        return [dict(r, student_id=str(r["student_id"])) for r in rows]


@router.get("/summary")
def financial_summary(
    academic_year_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "FINANCE_OFFICER"])),
):
    with get_cursor() as cur:
        ay = academic_year_id or _current_ay_id(cur)
        cur.execute("SELECT COALESCE(SUM(amount), 0) AS total_invoiced FROM invoices WHERE academic_year_id = %s", (ay,))
        inv = cur.fetchone()
        cur.execute("SELECT COALESCE(SUM(p.amount), 0) AS total_paid FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.academic_year_id = %s", (ay,))
        paid = cur.fetchone()
        return {"academic_year_id": ay, "total_invoiced": float(inv["total_invoiced"]), "total_paid": float(paid["total_paid"]), "outstanding": float(inv["total_invoiced"]) - float(paid["total_paid"])}
