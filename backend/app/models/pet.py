"""Pet SQLAlchemy model."""

from datetime import date, datetime, UTC
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Integer,
    Numeric,
    String,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.tenant import Tenant


class Pet(Base):
    """Pet model with multi-tenant isolation and adoption support."""

    __tablename__ = "pets"

    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Multi-tenancy (explicit isolation)
    tenant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Core Identity
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    species: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )  # dog, cat, bird, rabbit, other
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Biological Data
    sex: Mapped[str] = mapped_column(
        String(10), nullable=False
    )  # male, female, unknown
    birth_date: Mapped[date | None] = mapped_column(nullable=True)
    weight: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)  # kg
    sterilized: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Ownership & Status
    owner_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="owned", index=True
    )  # available_for_adoption, owned, inactive
    adopted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Media (AWS S3)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)  # CloudFront URL
    photo_key: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # S3 object key

    # Soft Delete
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, index=True
    )

    # Audit Trail
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        onupdate=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=False,
    )
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    updated_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant")
    owner: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[owner_id], primaryjoin="Pet.owner_id == User.id"
    )
    created_by_user: Mapped["User"] = relationship(
        "User", foreign_keys=[created_by], primaryjoin="Pet.created_by == User.id"
    )
    updated_by_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[updated_by], primaryjoin="Pet.updated_by == User.id"
    )
