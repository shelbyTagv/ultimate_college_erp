from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/messages", tags=["messages"])


class SendMessageBody(BaseModel):
    recipient_id: str
    subject: Optional[str] = None
    body: str


@router.get("")
def list_messages(
    folder: str = Query("inbox", regex="^(inbox|sent)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    with get_cursor() as cur:
        if folder == "inbox":
            cur.execute("""
                SELECT m.id, m.sender_id, m.subject, m.body, m.is_read, m.created_at,
                       u.email AS sender_email
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                WHERE m.recipient_id = %s
                ORDER BY m.created_at DESC
                LIMIT %s OFFSET %s
            """, (current["id"], limit, skip))
        else:
            cur.execute("""
                SELECT m.id, m.recipient_id, m.subject, m.body, m.is_read, m.created_at,
                       u.email AS recipient_email
                FROM messages m
                JOIN users u ON u.id = m.recipient_id
                WHERE m.sender_id = %s
                ORDER BY m.created_at DESC
                LIMIT %s OFFSET %s
            """, (current["id"], limit, skip))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), sender_id=str(r.get("sender_id") or r.get("sender_id")), recipient_id=str(r.get("recipient_id")) if r.get("recipient_id") else None) for r in rows]


@router.post("")
def send_message(
    body: SendMessageBody,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO messages (sender_id, recipient_id, subject, body)
            VALUES (%s, %s, %s, %s)
            RETURNING id, recipient_id, subject, created_at
        """, (current["id"], body.recipient_id, body.subject, body.body))
        row = cur.fetchone()
        return dict(row, id=str(row["id"]), recipient_id=str(row["recipient_id"]))


@router.get("/users")
def list_users_for_message(
    q: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    with get_cursor() as cur:
        cur.execute("""
            SELECT u.id, u.email, u.role,
                   COALESCE(t.first_name || ' ' || t.last_name, s.first_name || ' ' || s.last_name, p.first_name || ' ' || p.last_name, u.email) AS display_name
            FROM users u
            LEFT JOIN teachers t ON t.user_id = u.id
            LEFT JOIN students s ON s.user_id = u.id
            LEFT JOIN parents p ON p.user_id = u.id
            WHERE u.id != %s AND u.is_active = true
            ORDER BY display_name
        """, (current["id"],))
        rows = cur.fetchall()
        if q:
            ql = q.lower()
            rows = [r for r in rows if ql in (r.get("email") or "").lower() or ql in (r.get("display_name") or "").lower()]
        return [dict(r, id=str(r["id"])) for r in rows[:50]]


@router.get("/{message_id}")
def get_message(
    message_id: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    with get_cursor() as cur:
        row = fetch_one(cur, "SELECT * FROM messages WHERE id = %s", (message_id,))
        if not row:
            raise HTTPException(status_code=404)
        if str(row["recipient_id"]) != current["id"] and str(row["sender_id"]) != current["id"]:
            raise HTTPException(status_code=403)
        if str(row["recipient_id"]) == current["id"]:
            cur.execute("UPDATE messages SET is_read = true WHERE id = %s", (message_id,))
        return dict(row, id=str(row["id"]), sender_id=str(row["sender_id"]), recipient_id=str(row["recipient_id"]))
