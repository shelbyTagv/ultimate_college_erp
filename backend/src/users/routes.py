from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles, hash_password

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserUpdate(BaseModel):
    is_active: Optional[bool] = None


@router.get("")
def list_users(
    role: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        if role:
            cur.execute(
                "SELECT id, email, role, is_active, created_at FROM users WHERE role = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (role, limit, skip),
            )
        else:
            cur.execute(
                "SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, skip),
            )
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"])) for r in rows]


@router.post("")
def create_user(
    data: UserCreate,
    current=Depends(require_roles(["SUPER_ADMIN"])),
):
    allowed = ["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT", "FINANCE_OFFICER"]
    if data.role not in allowed:
        raise HTTPException(status_code=400, detail="Invalid role")
    with get_cursor() as cur:
        cur.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (data.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        ph = hash_password(data.password)
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s) RETURNING id, email, role",
            (data.email, ph, data.role),
        )
        row = cur.fetchone()
        return dict(row, id=str(row["id"]))
