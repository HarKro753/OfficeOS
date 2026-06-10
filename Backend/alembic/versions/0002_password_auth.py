"""replace token auth with password auth

Revision ID: 0002_password_auth
Revises: 0001_initial
Create Date: 2026-06-10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_password_auth"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.drop_table("auth_tokens")


def downgrade() -> None:
    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False, unique=True),
        sa.Column("role", sa.Enum("customer", "admin", name="user_role"), nullable=False),
        sa.Column("workspace_name", sa.String(length=160), nullable=True),
        sa.Column("app_name", sa.String(length=160), nullable=True),
        sa.Column("created_by_user_id", sa.UUID(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.drop_column("users", "password_hash")
