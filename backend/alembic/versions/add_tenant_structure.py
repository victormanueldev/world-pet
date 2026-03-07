"""Add tenant, user_tenant tables and tenant_id to users.

Revision ID: add_tenant_structure
Revises:
Create Date: 2026-03-07

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "add_tenant_structure"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create tenants table
    op.create_table(
        "tenants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("settings", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tenants_id"), "tenants", ["id"], unique=False)
    op.create_index(op.f("ix_tenants_slug"), "tenants", ["slug"], unique=True)

    # Add tenant_id column to users (initially nullable for backfill)
    op.add_column("users", sa.Column("tenant_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_users_tenant_id"), "users", ["tenant_id"], unique=False)
    op.create_foreign_key(
        "fk_users_tenant_id",
        "users",
        "tenants",
        ["tenant_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # Create user_tenants association table
    op.create_table(
        "user_tenants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "tenant_id", name="uq_user_tenant"),
    )
    op.create_index(op.f("ix_user_tenants_id"), "user_tenants", ["id"], unique=False)
    op.create_index(
        op.f("ix_user_tenants_user_id"), "user_tenants", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_user_tenants_tenant_id"), "user_tenants", ["tenant_id"], unique=False
    )


def downgrade() -> None:
    op.drop_table("user_tenants")
    op.drop_column("users", "tenant_id")
    op.drop_table("tenants")
