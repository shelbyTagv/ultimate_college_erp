from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..db import get_cursor, fetch_one, fetch_all
from ..auth import require_roles

router = APIRouter(prefix="/learning", tags=["learning"])


class CreateMaterialBody(BaseModel):
    class_id: str
    subject_id: str
    title: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None


@router.get("/materials")
def list_materials(
    class_id: Optional[str] = Query(None),
    subject_id: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT"])),
):
    with get_cursor() as cur:
        if student_id:
            if current["role"] == "STUDENT" and current.get("student_id") != student_id:
                raise HTTPException(status_code=403)
            cur.execute("""
                SELECT lm.id, lm.class_id, lm.subject_id, lm.title, lm.description, lm.file_path, lm.file_name, lm.created_at,
                       sub.name AS subject_name, c.name AS class_name
                FROM learning_materials lm
                JOIN subjects sub ON sub.id = lm.subject_id
                JOIN classes c ON c.id = lm.class_id
                JOIN student_classes sc ON sc.class_id = lm.class_id AND sc.student_id = %s
                WHERE lm.is_published = true
                ORDER BY lm.created_at DESC
            """, (student_id,))
        elif class_id:
            cur.execute("""
                SELECT lm.id, lm.class_id, lm.subject_id, lm.title, lm.description, lm.file_path, lm.file_name, lm.created_at,
                       sub.name AS subject_name
                FROM learning_materials lm
                JOIN subjects sub ON sub.id = lm.subject_id
                WHERE lm.class_id = %s AND lm.is_published = true
                ORDER BY lm.created_at DESC
            """, (class_id,))
        else:
            cur.execute("""
                SELECT lm.id, lm.class_id, lm.subject_id, lm.title, lm.file_name, lm.created_at,
                       sub.name AS subject_name, c.name AS class_name
                FROM learning_materials lm
                JOIN subjects sub ON sub.id = lm.subject_id
                JOIN classes c ON c.id = lm.class_id
                WHERE lm.is_published = true
                ORDER BY lm.created_at DESC
            """)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"]), class_id=str(r["class_id"]), subject_id=str(r["subject_id"])) for r in rows]


@router.post("/materials")
def create_material(
    body: CreateMaterialBody,
    current=Depends(require_roles(["TEACHER", "ADMIN_STAFF", "SUPER_ADMIN"])),
):
    teacher_id = current.get("teacher_id")
    with get_cursor() as cur:
        tid = teacher_id or fetch_one(cur, "SELECT id FROM teachers LIMIT 1")["id"]
        cur.execute("""
            INSERT INTO learning_materials (class_id, subject_id, uploaded_by, title, description, file_path, file_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, class_id, subject_id, title, created_at
        """, (body.class_id, body.subject_id, tid, body.title, body.description, body.file_path, body.file_name))
        row = cur.fetchone()
        return dict(row, id=str(row["id"]), class_id=str(row["class_id"]), subject_id=str(row["subject_id"]))


@router.get("/library")
def list_library(
    category: Optional[str] = Query(None),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT"])),
):
    with get_cursor() as cur:
        q = "SELECT id, title, description, file_path, file_name, category, created_at FROM library_items WHERE is_public = true"
        params = []
        if category:
            q += " AND category = %s"
            params.append(category)
        q += " ORDER BY created_at DESC"
        cur.execute(q, params)
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"])) for r in rows]
