#!/usr/bin/env python3
"""
Database initialization script for World Pet application.
Creates an initial tenant and admin user.
"""

import asyncio
import os
import sys

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import User
from app.models.user_tenant import UserTenant


async def init_db() -> None:
    """Initialize database with initial tenant and admin user."""
    async with AsyncSessionLocal() as db:
        # Check if we already have data
        from sqlalchemy import select

        # Check for existing tenants
        result = await db.execute(select(Tenant))
        existing_tenants = result.scalars().all()

        if existing_tenants:
            print("Database already initialized. Skipping...")
            return

        # Create initial tenant
        initial_tenant = Tenant(
            name="World Pet",
            slug="world-pet",
            settings='{"theme": "dark", "notifications": true}',
        )
        db.add(initial_tenant)
        await db.flush()  # Get the ID without committing

        # Create admin user
        admin_user = User(
            email="admin@worldpet.com",
            name="Administrator",
            password_hash=hash_password("admin123"),  # Change in production!
            is_active=True,
        )
        db.add(admin_user)
        await db.flush()  # Get the ID without committing

        # Add user tenant association
        user_tenant = UserTenant(
            user_id=admin_user.id,
            tenant_id=initial_tenant.id,
            role="admin",
        )
        db.add(user_tenant)

        # Commit the transaction
        await db.commit()

        print(
            f"Created initial tenant: {initial_tenant.name} (ID: {initial_tenant.id})"
        )
        print(f"Created admin user: {admin_user.email} (ID: {admin_user.id})")
        print("Default password: admin123 (please change after first login!)")


if __name__ == "__main__":
    asyncio.run(init_db())
