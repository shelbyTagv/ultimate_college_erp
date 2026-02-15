from fastapi import APIRouter, Depends, HTTPException

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/parents", tags=["parents"])


@router.get("/me")
def get_my_profile(current=Depends(require_roles(["PARENT"]))):
    with get_cursor() as cur:
        p = fetch_one(cur, "SELECT * FROM parents WHERE user_id = %s", (current["id"],))
        if not p:
            raise HTTPException(status_code=404, detail="Parent profile not found")
        out = dict(p)
        out["id"] = str(out["id"])
        out["user_id"] = str(out["user_id"])
        cur.execute("""
            SELECT s.id, s.first_name, s.last_name, s.gender, psl.relationship
            FROM parent_student_links psl
            JOIN students s ON s.id = psl.student_id
            WHERE psl.parent_id = %s
        """, (out["id"],))
        out["students"] = [dict(r, id=str(r["id"])) for r in cur.fetchall()]
        return out


@router.get("")
def list_parents(
    skip: int = 0,
    limit: int = 50,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF"])),
):
    with get_cursor() as cur:
        cur.execute("SELECT id, user_id, first_name, last_name, phone FROM parents ORDER BY last_name LIMIT %s OFFSET %s", (limit, skip))
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), user_id=str(r["user_id"])) for r in rows]
