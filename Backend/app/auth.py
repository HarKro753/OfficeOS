import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import SessionToken, User, UserRole, Workspace, WorkspaceMember

GLOBAL_WORKSPACE_NAME = "OfficeOS"
GLOBAL_APP_NAME = "YUKA"
GLOBAL_BUNDLE_ID = "com.officeos.yuka"
PASSWORD_HASH_ALGORITHM = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 390_000


def hash_token(token: str) -> str:
    return hashlib.sha256(f"{settings.app_secret_key}:{token}".encode()).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)


def normalize_email(email: str) -> str:
    return email.lower().strip()


def hash_password(password: str) -> str:
    salt = secrets.token_urlsafe(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt.encode(),
        PASSWORD_HASH_ITERATIONS,
    ).hex()
    return (
        f"{PASSWORD_HASH_ALGORITHM}${PASSWORD_HASH_ITERATIONS}"
        f"${salt}${password_hash}"
    )


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False

    try:
        algorithm, iterations, salt, password_hash = stored_hash.split("$", 3)
        if algorithm != PASSWORD_HASH_ALGORITHM:
            return False
        next_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt.encode(),
            int(iterations),
        ).hex()
        return hmac.compare_digest(next_hash, password_hash)
    except (TypeError, ValueError):
        return False


async def ensure_global_workspace_membership(db: AsyncSession, user: User) -> None:
    workspace = await db.scalar(
        select(Workspace).where(
            Workspace.name == GLOBAL_WORKSPACE_NAME,
            Workspace.app_name == GLOBAL_APP_NAME,
        )
    )
    if not workspace:
        workspace = Workspace(
            name=GLOBAL_WORKSPACE_NAME,
            app_name=GLOBAL_APP_NAME,
            bundle_id=GLOBAL_BUNDLE_ID,
        )
        db.add(workspace)
        await db.flush()

    member = await db.get(
        WorkspaceMember,
        {"workspace_id": workspace.id, "user_id": user.id},
    )
    if not member:
        db.add(
            WorkspaceMember(
                workspace_id=workspace.id,
                user_id=user.id,
                role=user.role,
            )
        )
    elif user.role == UserRole.admin and member.role != UserRole.admin:
        member.role = UserRole.admin


async def create_session_token(db: AsyncSession, user: User) -> str:
    now = datetime.now(UTC)
    session_token = new_token()
    db.add(
        SessionToken(
            user_id=user.id,
            token_hash=hash_token(session_token),
            expires_at=now + timedelta(days=settings.session_expires_days),
        )
    )
    return session_token


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
