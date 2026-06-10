from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.db import get_db
from app.models import User, Workspace, WorkspaceMember
from app.schemas import WorkspaceOut

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("", response_model=list[WorkspaceOut])
async def list_workspaces(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user.id)
        .order_by(Workspace.created_at.desc())
    )
    return list(rows)


async def require_workspace_member(
    db: AsyncSession, *, workspace_id: object, user: User
) -> WorkspaceMember:
    member = await db.get(WorkspaceMember, {"workspace_id": workspace_id, "user_id": user.id})
    if not member:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return member
