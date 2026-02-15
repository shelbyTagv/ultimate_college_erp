from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..db import get_cursor, fetch_one
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from .deps import require_roles

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str  # validated in endpoint


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    with get_cursor() as cur:
        row = fetch_one(
            cur,
            """
            SELECT id, email, password_hash, role, is_active
            FROM users WHERE LOWER(email) = LOWER(%s)
            """,
            (data.email.strip(),),
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        if not row["is_active"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        if not verify_password(data.password, row["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        user_id = str(row["id"])
        role = row["role"]
        token = create_access_token(data={"sub": user_id, "role": role})
        out = {
            "id": user_id,
            "email": row["email"],
            "role": role,
        }
        # Attach profile id for teacher/student/parent
        if role == "TEACHER":
            t = fetch_one(cur, "SELECT id, first_name, last_name FROM teachers WHERE user_id = %s", (user_id,))
            if t:
                out["teacher_id"] = str(t["id"])
                out["first_name"] = t["first_name"]
                out["last_name"] = t["last_name"]
        elif role == "STUDENT":
            s = fetch_one(cur, "SELECT id, first_name, last_name FROM students WHERE user_id = %s", (user_id,))
            if s:
                out["student_id"] = str(s["id"])
                out["first_name"] = s["first_name"]
                out["last_name"] = s["last_name"]
        elif role == "PARENT":
            p = fetch_one(cur, "SELECT id, first_name, last_name FROM parents WHERE user_id = %s", (user_id,))
            if p:
                out["parent_id"] = str(p["id"])
                out["first_name"] = p["first_name"]
                out["last_name"] = p["last_name"]
        return TokenResponse(access_token=token, user=out)


@router.get("/me")
def me(current: dict = Depends(get_current_user)):
    with get_cursor() as cur:
        row = fetch_one(
            cur,
            "SELECT id, email, role, is_active, created_at FROM users WHERE id = %s",
            (current["id"],),
        )
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        out = dict(row)
        out["id"] = str(out["id"])
        role = out["role"]
        if role == "TEACHER":
            t = fetch_one(cur, "SELECT id, first_name, last_name FROM teachers WHERE user_id = %s", (current["id"],))
            if t:
                out["teacher_id"] = str(t["id"])
                out["first_name"] = t["first_name"]
                out["last_name"] = t["last_name"]
        elif role == "STUDENT":
            s = fetch_one(cur, "SELECT id, first_name, last_name FROM students WHERE user_id = %s", (current["id"],))
            if s:
                out["student_id"] = str(s["id"])
                out["first_name"] = s["first_name"]
                out["last_name"] = s["last_name"]
        elif role == "PARENT":
            p = fetch_one(cur, "SELECT id, first_name, last_name FROM parents WHERE user_id = %s", (current["id"],))
            if p:
                out["parent_id"] = str(p["id"])
                out["first_name"] = p["first_name"]
                out["last_name"] = p["last_name"]
        return out
