"""initial pilot schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    role = postgresql.ENUM("customer", "admin", name="user_role", create_type=False)
    request_status = postgresql.ENUM(
        "submitted",
        "in_progress",
        "resolved",
        name="request_status",
        create_type=False,
    )
    file_kind = postgresql.ENUM(
        "spec",
        "asset",
        "answer_markdown",
        "evidence_video",
        name="stored_file_kind",
        create_type=False,
    )
    deliverable_kind = postgresql.ENUM(
        "answer_markdown",
        "evidence_video",
        name="deliverable_kind",
        create_type=False,
    )

    role.create(op.get_bind())
    request_status.create(op.get_bind())
    file_kind.create(op.get_bind())
    deliverable_kind.create(op.get_bind())

    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("name", sa.String(length=160), nullable=True),
        sa.Column("role", role, nullable=False, server_default="customer"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "workspaces",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("app_name", sa.String(length=160), nullable=False),
        sa.Column("bundle_id", sa.String(length=255), nullable=True),
        sa.Column("apple_access_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False, unique=True),
        sa.Column("role", role, nullable=False, server_default="customer"),
        sa.Column("workspace_name", sa.String(length=160), nullable=True),
        sa.Column("app_name", sa.String(length=160), nullable=True),
        sa.Column("created_by_user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "session_tokens",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "workspace_members",
        sa.Column("workspace_id", sa.UUID(), sa.ForeignKey("workspaces.id"), primary_key=True),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("role", role, nullable=False, server_default="customer"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "update_requests",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("workspace_id", sa.UUID(), sa.ForeignKey("workspaces.id"), nullable=False),
        sa.Column("created_by_user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("resolved_by_user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("raw_spec_text", sa.Text(), nullable=False),
        sa.Column("generated_markdown", sa.Text(), nullable=False),
        sa.Column("status", request_status, nullable=False, server_default="submitted"),
        sa.Column("answer_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "acceptance_criteria",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("request_id", sa.UUID(), sa.ForeignKey("update_requests.id"), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("required_video", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "stored_files",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("workspace_id", sa.UUID(), sa.ForeignKey("workspaces.id"), nullable=False),
        sa.Column("request_id", sa.UUID(), sa.ForeignKey("update_requests.id"), nullable=True),
        sa.Column("uploaded_by_user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("bucket", sa.String(length=120), nullable=False),
        sa.Column("object_key", sa.String(length=1024), nullable=False, unique=True),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=160), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("kind", file_kind, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "deliverables",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("request_id", sa.UUID(), sa.ForeignKey("update_requests.id"), nullable=False),
        sa.Column("created_by_user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("acceptance_criterion_id", sa.UUID(), sa.ForeignKey("acceptance_criteria.id"), nullable=True),
        sa.Column("bucket", sa.String(length=120), nullable=False),
        sa.Column("object_key", sa.String(length=1024), nullable=False, unique=True),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=160), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("kind", deliverable_kind, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index("ix_requests_status", "update_requests", ["status"])
    op.create_index("ix_requests_workspace", "update_requests", ["workspace_id"])
    op.create_index("ix_deliverables_request", "deliverables", ["request_id"])


def downgrade() -> None:
    op.drop_index("ix_deliverables_request", table_name="deliverables")
    op.drop_index("ix_requests_workspace", table_name="update_requests")
    op.drop_index("ix_requests_status", table_name="update_requests")
    op.drop_table("deliverables")
    op.drop_table("stored_files")
    op.drop_table("acceptance_criteria")
    op.drop_table("update_requests")
    op.drop_table("workspace_members")
    op.drop_table("session_tokens")
    op.drop_table("auth_tokens")
    op.drop_table("workspaces")
    op.drop_table("users")
    postgresql.ENUM(name="deliverable_kind").drop(op.get_bind())
    postgresql.ENUM(name="stored_file_kind").drop(op.get_bind())
    postgresql.ENUM(name="request_status").drop(op.get_bind())
    postgresql.ENUM(name="user_role").drop(op.get_bind())
