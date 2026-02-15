from fastapi import APIRouter, Depends

from ..db import get_cursor
from ..auth import require_roles

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("")
def list_subjects(current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT"]))):
    with get_cursor() as cur:
        cur.execute("SELECT id, name, code, is_examinable FROM subjects ORDER BY name")
        return [dict(r, id=str(r["id"])) for r in cur.fetchall()]
