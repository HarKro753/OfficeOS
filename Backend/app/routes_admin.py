import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import create_magic_token, require_admin
from app.db import get_db
from app.email_service import send_magic_link
from app.models import (
    AcceptanceCriterion,
    Deliverable,
    DeliverableKind,
    RequestStatus,
    UpdateRequest,
    User,
    UserRole,
    Workspace,
    WorkspaceMember,
)
from app.schemas import (
    InviteCreate,
    InviteOut,
    RequestOut,
    UserOut,
    WorkspaceCreate,
    WorkspaceOut,
)
from app.storage import storage_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
async def list_users(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(select(User).order_by(User.created_at.desc()))
    return list(rows)


@router.post("/invites", response_model=InviteOut)
async def create_invite(
    payload: InviteCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    token, auth_token = await create_magic_token(
        db,
        email=str(payload.email),
        role=payload.role,
        workspace_name=payload.workspace_name,
        app_name=payload.app_name,
        created_by_user_id=admin.id,
    )
    await db.commit()
    link = await send_magic_link(str(payload.email), token)
    return InviteOut(email=str(payload.email), invite_link=link, expires_at=auth_token.expires_at)


@router.post("/workspaces", response_model=WorkspaceOut)
async def create_workspace(
    payload: WorkspaceCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    workspace = Workspace(**payload.model_dump())
    db.add(workspace)
    await db.flush()
    db.add(WorkspaceMember(workspace_id=workspace.id, user_id=admin.id, role=UserRole.admin))
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.get("/requests", response_model=list[RequestOut])
async def admin_list_requests(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(UpdateRequest)
        .options(
            selectinload(UpdateRequest.criteria),
            selectinload(UpdateRequest.deliverables),
        )
        .order_by(UpdateRequest.created_at.desc())
    )
    return list(rows)


@router.get("/requests/{request_id}", response_model=RequestOut)
async def admin_get_request(
    request_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await request_with_children(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


@router.post("/requests/{request_id}/start", response_model=RequestOut)
async def start_request(
    request_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await request_with_children(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    request.status = RequestStatus.in_progress
    await db.commit()
    return await request_with_children(db, request_id)


@router.post("/requests/{request_id}/answer-markdown", response_model=RequestOut)
async def upload_answer_markdown(
    request_id: uuid.UUID,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await request_with_children(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    upload = await storage_service.upload_file(
        prefix=f"workspaces/{request.workspace_id}/requests/{request.id}/answers",
        file=file,
    )
    db.add(
        Deliverable(
            request_id=request.id,
            created_by_user_id=admin.id,
            bucket=upload.bucket,
            object_key=upload.object_key,
            filename=upload.filename,
            mime_type=upload.mime_type,
            size_bytes=upload.size_bytes,
            kind=DeliverableKind.answer_markdown,
        )
    )
    await db.commit()
    return await request_with_children(db, request_id)


@router.post(
    "/requests/{request_id}/criteria/{criterion_id}/video",
    response_model=RequestOut,
)
async def upload_criterion_video(
    request_id: uuid.UUID,
    criterion_id: uuid.UUID,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await request_with_children(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    criterion = await db.get(AcceptanceCriterion, criterion_id)
    if not criterion or criterion.request_id != request.id:
        raise HTTPException(status_code=404, detail="Criterion not found")
    if not (file.content_type or "").startswith("video/"):
        raise HTTPException(status_code=400, detail="Evidence must be a video file")

    upload = await storage_service.upload_file(
        prefix=f"workspaces/{request.workspace_id}/requests/{request.id}/evidence",
        file=file,
    )
    db.add(
        Deliverable(
            request_id=request.id,
            created_by_user_id=admin.id,
            acceptance_criterion_id=criterion.id,
            bucket=upload.bucket,
            object_key=upload.object_key,
            filename=upload.filename,
            mime_type=upload.mime_type,
            size_bytes=upload.size_bytes,
            kind=DeliverableKind.evidence_video,
        )
    )
    await db.commit()
    return await request_with_children(db, request_id)


@router.post("/requests/{request_id}/resolve", response_model=RequestOut)
async def resolve_request(
    request_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await request_with_children(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    has_answer = any(
        deliverable.kind == DeliverableKind.answer_markdown
        for deliverable in request.deliverables
    )
    criteria_with_video = {
        deliverable.acceptance_criterion_id
        for deliverable in request.deliverables
        if deliverable.kind == DeliverableKind.evidence_video
    }
    missing_video = [
        criterion.title
        for criterion in request.criteria
        if criterion.required_video and criterion.id not in criteria_with_video
    ]
    if not has_answer:
        raise HTTPException(status_code=400, detail="Upload answer Markdown first")
    if missing_video:
        raise HTTPException(
            status_code=400,
            detail=f"Missing video evidence for: {', '.join(missing_video)}",
        )

    request.status = RequestStatus.resolved
    request.resolved_by_user_id = admin.id
    request.answer_sent_at = datetime.now(UTC)
    await db.commit()
    return await request_with_children(db, request_id)


async def request_with_children(
    db: AsyncSession, request_id: uuid.UUID
) -> UpdateRequest | None:
    return await db.scalar(
        select(UpdateRequest)
        .options(
            selectinload(UpdateRequest.criteria),
            selectinload(UpdateRequest.deliverables),
        )
        .where(UpdateRequest.id == request_id)
    )
