from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    create_session_token,
    ensure_global_workspace_membership,
    get_current_user,
    hash_password,
    normalize_email,
    verify_password,
)
from app.config import settings
from app.db import get_db
from app.models import User, UserRole
from app.schemas import AuthCredentials, AuthResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(payload: AuthCredentials, db: AsyncSession = Depends(get_db)):
    email = normalize_email(str(payload.email))
    user = await db.scalar(select(User).where(User.email == email))
    if user and user.password_hash:
        raise HTTPException(status_code=409, detail="Email already registered")
    if not user:
        user = User(
            email=email,
            password_hash=hash_password(payload.password),
            role=UserRole.customer,
        )
        db.add(user)
        await db.flush()
    else:
        user.password_hash = hash_password(payload.password)

    await ensure_global_workspace_membership(db, user)
    access_token = await create_session_token(db, user)
    await db.commit()
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: AuthCredentials, db: AsyncSession = Depends(get_db)):
    email = normalize_email(str(payload.email))
    user = await db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    await ensure_global_workspace_membership(db, user)
    access_token = await create_session_token(db, user)
    await db.commit()
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/bootstrap-admin", response_model=AuthResponse)
async def bootstrap_admin(
    payload: AuthCredentials,
    x_bootstrap_token: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not settings.admin_bootstrap_token or x_bootstrap_token != settings.admin_bootstrap_token:
        raise HTTPException(status_code=403, detail="Invalid bootstrap token")

    email = normalize_email(str(payload.email))
    user = await db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(
            email=email,
            password_hash=hash_password(payload.password),
            role=UserRole.admin,
        )
        db.add(user)
        await db.flush()
    else:
        user.password_hash = hash_password(payload.password)
        user.role = UserRole.admin

    await ensure_global_workspace_membership(db, user)
    access_token = await create_session_token(db, user)
    await db.commit()
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user
