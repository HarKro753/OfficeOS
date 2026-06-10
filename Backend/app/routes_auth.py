from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import consume_magic_token, create_magic_token, get_current_user
from app.config import settings
from app.db import get_db
from app.email_service import send_magic_link
from app.models import User, UserRole
from app.schemas import AuthConsume, AuthRequest, AuthResponse, InviteOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-link", response_model=InviteOut)
async def request_link(payload: AuthRequest, db: AsyncSession = Depends(get_db)):
    token, auth_token = await create_magic_token(
        db, email=str(payload.email), role=UserRole.customer
    )
    await db.commit()
    link = await send_magic_link(str(payload.email), token)
    return InviteOut(email=str(payload.email), invite_link=link, expires_at=auth_token.expires_at)


@router.post("/bootstrap-admin", response_model=InviteOut)
async def bootstrap_admin(
    payload: AuthRequest,
    x_bootstrap_token: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not settings.admin_bootstrap_token or x_bootstrap_token != settings.admin_bootstrap_token:
        raise HTTPException(status_code=403, detail="Invalid bootstrap token")

    token, auth_token = await create_magic_token(
        db, email=str(payload.email), role=UserRole.admin
    )
    await db.commit()
    link = await send_magic_link(str(payload.email), token)
    return InviteOut(email=str(payload.email), invite_link=link, expires_at=auth_token.expires_at)


@router.post("/consume", response_model=AuthResponse)
async def consume(payload: AuthConsume, db: AsyncSession = Depends(get_db)):
    access_token, user = await consume_magic_token(db, payload.token)
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user
