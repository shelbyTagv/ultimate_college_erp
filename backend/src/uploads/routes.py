import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from ..config import get_settings
from ..auth import require_roles

router = APIRouter(prefix="/uploads", tags=["uploads"])
settings = get_settings()


def _upload_dir() -> str:
    d = settings.upload_dir
    os.makedirs(d, exist_ok=True)
    return d


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(_upload_dir(), name)
    size = 0
    max_bytes = settings.max_upload_mb * 1024 * 1024
    async with aiofiles.open(path, "wb") as f:
        while chunk := await file.read(8192):
            size += len(chunk)
            if size > max_bytes:
                os.remove(path)
                raise HTTPException(status_code=413, detail="File too large")
            await f.write(chunk)
    return {"path": path, "file_name": file.filename, "saved_as": name}


@router.get("/{filename}")
def download_file(
    filename: str,
    current=Depends(require_roles(["SUPER_ADMIN", "ADMIN_STAFF", "TEACHER", "STUDENT", "PARENT"])),
):
    path = os.path.join(_upload_dir(), filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404)
    return FileResponse(path, filename=filename)
