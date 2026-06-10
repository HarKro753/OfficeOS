import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import RequestStatus, UserRole


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str | None
    role: UserRole

    model_config = {"from_attributes": True}


class AuthRequest(BaseModel):
    email: EmailStr


class AuthConsume(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class InviteCreate(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.customer
    workspace_name: str | None = None
    app_name: str | None = None


class InviteOut(BaseModel):
    email: str
    invite_link: str
    expires_at: datetime


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    app_name: str = Field(min_length=1, max_length=160)
    bundle_id: str | None = None
    apple_access_notes: str | None = None


class WorkspaceOut(BaseModel):
    id: uuid.UUID
    name: str
    app_name: str
    bundle_id: str | None
    apple_access_notes: str | None

    model_config = {"from_attributes": True}


class RequestCreate(BaseModel):
    workspace_id: uuid.UUID
    title: str = Field(min_length=1, max_length=240)
    raw_spec_text: str = Field(min_length=1)


class CriterionOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    required_video: bool

    model_config = {"from_attributes": True}


class DeliverableOut(BaseModel):
    id: uuid.UUID
    filename: str
    mime_type: str
    size_bytes: int
    kind: str
    acceptance_criterion_id: uuid.UUID | None
    download_url: str | None = None

    model_config = {"from_attributes": True}


class RequestOut(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_by_user_id: uuid.UUID
    title: str
    raw_spec_text: str
    generated_markdown: str
    status: RequestStatus
    answer_sent_at: datetime | None
    created_at: datetime
    updated_at: datetime
    criteria: list[CriterionOut] = []
    deliverables: list[DeliverableOut] = []

    model_config = {"from_attributes": True}


class PresignUploadRequest(BaseModel):
    workspace_id: uuid.UUID
    request_id: uuid.UUID | None = None
    filename: str = Field(min_length=1, max_length=255)
    mime_type: str = "application/octet-stream"
    kind: str = "asset"


class PresignUploadOut(BaseModel):
    url: str
    method: str
    object_key: str


class CompleteUploadRequest(BaseModel):
    workspace_id: uuid.UUID
    request_id: uuid.UUID | None = None
    object_key: str
    filename: str
    mime_type: str
    size_bytes: int = 0
    kind: str = "asset"


class FileOut(BaseModel):
    id: uuid.UUID
    object_key: str
    filename: str
    mime_type: str
    size_bytes: int
    kind: str

    model_config = {"from_attributes": True}
