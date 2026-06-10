from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import StoredFile, StoredFileKind, User
from app.routes_workspaces import require_workspace_member
from app.schemas import (
    CompleteUploadRequest,
    FileOut,
    PresignUploadOut,
    PresignUploadRequest,
)
from app.storage import storage_service

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/presign-upload", response_model=PresignUploadOut)
async def presign_upload(
    payload: PresignUploadRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await require_workspace_member(db, workspace_id=payload.workspace_id, user=user)
    prefix = f"workspaces/{payload.workspace_id}/requests/{payload.request_id or 'unassigned'}"
    object_key = storage_service.object_key(prefix, payload.filename)
    return storage_service.presign_upload(
        object_key=object_key, content_type=payload.mime_type
    )


@router.post("/complete-upload", response_model=FileOut)
async def complete_upload(
    payload: CompleteUploadRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await require_workspace_member(db, workspace_id=payload.workspace_id, user=user)
    stored_file = StoredFile(
        workspace_id=payload.workspace_id,
        request_id=payload.request_id,
        uploaded_by_user_id=user.id,
        bucket=settings.s3_bucket,
        object_key=payload.object_key,
        filename=payload.filename,
        mime_type=payload.mime_type,
        size_bytes=payload.size_bytes,
        kind=StoredFileKind(payload.kind),
    )
    db.add(stored_file)
    await db.commit()
    await db.refresh(stored_file)
    return stored_file
