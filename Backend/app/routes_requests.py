import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_user
from app.db import get_db
from app.mock_ai import generate_request_artifacts
from app.models import AcceptanceCriterion, RequestStatus, UpdateRequest, User
from app.routes_workspaces import require_workspace_member
from app.schemas import RequestCreate, RequestOut

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=RequestOut)
async def create_request(
    payload: RequestCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await require_workspace_member(db, workspace_id=payload.workspace_id, user=user)
    artifacts = generate_request_artifacts(
        title=payload.title, raw_spec_text=payload.raw_spec_text
    )
    request = UpdateRequest(
        workspace_id=payload.workspace_id,
        created_by_user_id=user.id,
        title=payload.title,
        raw_spec_text=payload.raw_spec_text,
        generated_markdown=artifacts.markdown,
        status=RequestStatus.submitted,
    )
    db.add(request)
    await db.flush()
    for criterion in artifacts.criteria:
        db.add(
            AcceptanceCriterion(
                request_id=request.id,
                title=criterion.title,
                description=criterion.description,
                required_video=True,
            )
        )
    await db.commit()
    return await get_request(request.id, user, db)


@router.get("", response_model=list[RequestOut])
async def list_requests(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(UpdateRequest)
        .join_from(UpdateRequest, UpdateRequest.workspace)
        .options(
            selectinload(UpdateRequest.criteria),
            selectinload(UpdateRequest.deliverables),
        )
        .where(UpdateRequest.created_by_user_id == user.id)
        .order_by(UpdateRequest.created_at.desc())
    )
    return list(rows)


@router.get("/{request_id}", response_model=RequestOut)
async def get_request(
    request_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request = await db.scalar(
        select(UpdateRequest)
        .options(
            selectinload(UpdateRequest.criteria),
            selectinload(UpdateRequest.deliverables),
        )
        .where(UpdateRequest.id == request_id)
    )
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    await require_workspace_member(db, workspace_id=request.workspace_id, user=user)
    return request
