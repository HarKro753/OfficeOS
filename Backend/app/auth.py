import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import AuthToken, SessionToken, User, UserRole, Workspace, WorkspaceMember


def hash_token(token: str) -> str:
    return hashlib.sha256(f"{settings.app_secret_key}:{token}".encode()).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)


async def create_magic_token(
    db: AsyncSession,
    *,
    email: str,
    role: UserRole = UserRole.customer,
    workspace_name: str | None = None,
    app_name: str | None = None,
    created_by_user_id: uuid.UUID | None = None,
) -> tuple[str, AuthToken]:
    token = new_token()
    auth_token = AuthToken(
        email=email.lower().strip(),
        token_hash=hash_token(token),
        role=role,
        workspace_name=workspace_name,
        app_name=app_name,
        created_by_user_id=created_by_user_id,
        expires_at=datetime.now(UTC)
        + timedelta(minutes=settings.magic_link_expires_minutes),
    )
    db.add(auth_token)
    await db.flush()
    return token, auth_token


async def consume_magic_token(db: AsyncSession, token: str) -> tuple[str, User]:
    auth_token = await db.scalar(
        select(AuthToken).where(AuthToken.token_hash == hash_token(token))
    )
    now = datetime.now(UTC)
    if not auth_token or auth_token.consumed_at or auth_token.expires_at < now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid link")

    user = await db.scalar(select(User).where(User.email == auth_token.email))
    if not user:
        user = User(email=auth_token.email, role=auth_token.role)
        db.add(user)
        await db.flush()
    else:
        user.role = auth_token.role

    if auth_token.workspace_name or auth_token.app_name:
        workspace = Workspace(
            name=auth_token.workspace_name or auth_token.app_name or "Workspace",
            app_name=auth_token.app_name or auth_token.workspace_name or "App",
        )
        db.add(workspace)
        await db.flush()
        db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role=user.role))

    auth_token.consumed_at = now
    session_token = new_token()
    db.add(
        SessionToken(
            user_id=user.id,
            token_hash=hash_token(session_token),
            expires_at=now + timedelta(days=settings.session_expires_days),
        )
    )
    await db.commit()
    return session_token, user


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    raw_token = authorization.removeprefix("Bearer ").strip()
    session_token = await db.scalar(
        select(SessionToken).where(SessionToken.token_hash == hash_token(raw_token))
    )
    now = datetime.now(UTC)
    if (
        not session_token
        or session_token.revoked_at is not None
        or session_token.expires_at < now
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await db.get(User, session_token.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
