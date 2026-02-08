from datetime import timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.domain.user import Role, User
from app.infrastructure.repositories.user_repo import RoleRepository, UserRepository


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_user_token(self, user: User) -> str:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return create_access_token(
            subject=user.email, expires_delta=access_token_expires
        )

    def register_user(self, email: str, password: str, full_name: str, role_name: str = "Client") -> User:
        if self.user_repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        role = self.role_repo.get_by_name(role_name)
        if not role:
            # For initial setup, create role if not exists
            role = Role(name=role_name, description=f"Default {role_name} role")
            self.role_repo.create(role)

        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role_id=role.id,
        )
        return self.user_repo.create(new_user)
