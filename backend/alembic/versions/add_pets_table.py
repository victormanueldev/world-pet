"""Add pets table with tenant isolation and soft delete.

Revision ID: add_pets_table
Revises: f9bbc2b95323
Create Date: 2026-03-14

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "add_pets_table"
down_revision: str | None = "f9bbc2b95323"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Create pets table
    op.create_table(
        "pets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tenant_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("species", sa.String(length=20), nullable=False),
        sa.Column("breed", sa.String(length=100), nullable=True),
        sa.Column("sex", sa.String(length=10), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("weight", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("sterilized", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="owned"
        ),
        sa.Column("adopted_at", sa.DateTime(), nullable=True),
        sa.Column("photo_url", sa.Text(), nullable=True),
        sa.Column("photo_key", sa.String(length=255), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        # CHECK constraints for enums and consistency
        sa.CheckConstraint(
            "species IN ('dog', 'cat', 'bird', 'rabbit', 'other')",
            name="ck_pet_species",
        ),
        sa.CheckConstraint("sex IN ('male', 'female', 'unknown')", name="ck_pet_sex"),
        sa.CheckConstraint(
            "status IN ('available_for_adoption', 'owned', 'inactive')",
            name="ck_pet_status",
        ),
        sa.CheckConstraint(
            "(status = 'owned' AND owner_id IS NOT NULL) OR status != 'owned'",
            name="ck_pet_owner_required",
        ),
        sa.CheckConstraint(
            "(owner_id IS NOT NULL AND adopted_at IS NOT NULL) OR (owner_id IS NULL AND adopted_at IS NULL)",
            name="ck_pet_adopted_consistency",
        ),
    )

    # Create indexes
    op.create_index(op.f("ix_pets_id"), "pets", ["id"], unique=False)
    op.create_index(
        "ix_pets_tenant_id",
        "pets",
        ["tenant_id"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "ix_pets_owner_id",
        "pets",
        ["owner_id"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "ix_pets_status",
        "pets",
        ["status"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "ix_pets_tenant_status",
        "pets",
        ["tenant_id", "status"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "ix_pets_species",
        "pets",
        ["species"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "ix_pets_deleted_at",
        "pets",
        ["deleted_at"],
        unique=False,
        postgresql_where=sa.text("deleted_at IS NOT NULL"),
    )

    # Create trigger for updated_at auto-update
    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_pets_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    op.execute(
        """
        CREATE TRIGGER trigger_pets_updated_at
        BEFORE UPDATE ON pets
        FOR EACH ROW
        EXECUTE FUNCTION update_pets_updated_at();
        """
    )


def downgrade() -> None:
    # Drop trigger and function
    op.execute("DROP TRIGGER IF EXISTS trigger_pets_updated_at ON pets;")
    op.execute("DROP FUNCTION IF EXISTS update_pets_updated_at();")

    # Drop indexes
    op.drop_index("ix_pets_deleted_at", table_name="pets")
    op.drop_index("ix_pets_tenant_status", table_name="pets")
    op.drop_index("ix_pets_species", table_name="pets")
    op.drop_index("ix_pets_status", table_name="pets")
    op.drop_index("ix_pets_owner_id", table_name="pets")
    op.drop_index("ix_pets_tenant_id", table_name="pets")
    op.drop_index(op.f("ix_pets_id"), table_name="pets")

    # Drop table
    op.drop_table("pets")
