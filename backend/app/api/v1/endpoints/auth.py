"""Authentication API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    TokenDecodeError,
    TokenExpiredError,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db.session import get_db
from app.dependencies.auth import get_current_active_user, get_token_payload
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    LoginTenantSelectionRequired,
    RegisterRequest,
    RegisterResponse,
    TenantInfo,
    TokenRefreshRequest,
    TokenRefreshResponse,
    UserProfile,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    request: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Register a new user.

    Creates a new user account with the provided email and password.
    The user is automatically associated with the specified tenant.
    """
    # Check if email already exists
    existing_user = await auth_service.get_user_by_email(db, request.email)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Verify tenant exists
    result = await db.execute(select(Tenant).where(Tenant.id == request.tenant_id))
    tenant = result.scalar_one_or_none()
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tenant ID",
        )

    # Create user
    user = await auth_service.register_user(
        db=db,
        email=request.email,
        name=request.name,
        password=request.password,
        tenant_id=request.tenant_id,
        role="user",
    )

    return user


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LoginResponse | LoginTenantSelectionRequired:
    """Authenticate user and return JWT tokens.

    If the user belongs to multiple tenants and no tenant_id is provided,
    returns a list of available tenants for selection.
    """
    # Authenticate user
    user = await auth_service.authenticate_user(db, request.email, request.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account disabled",
        )

    # Get user's tenant associations
    associations = await auth_service.get_user_tenant_associations(db, user.id)

    if not associations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no tenant associations",
        )

    # Determine which tenant to use
    if request.tenant_id is not None:
        # User specified a tenant - verify access
        tenant_association = next(
            (a for a in associations if a.tenant_id == request.tenant_id),
            None,
        )
        if tenant_association is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tenant access denied",
            )
        selected_tenant_id = request.tenant_id
        selected_role = tenant_association.role
    elif len(associations) == 1:
        # User has only one tenant - auto-select
        selected_tenant_id = associations[0].tenant_id
        selected_role = associations[0].role
    else:
        # User has multiple tenants - require selection
        # Fetch tenant names for the response
        tenant_ids = [a.tenant_id for a in associations]
        result = await db.execute(select(Tenant).where(Tenant.id.in_(tenant_ids)))
        tenants = {t.id: t for t in result.scalars().all()}

        available_tenants = [
            TenantInfo(
                id=a.tenant_id,
                name=tenants[a.tenant_id].name if a.tenant_id in tenants else "Unknown",
                role=a.role,
            )
            for a in associations
        ]

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Tenant selection required",
                "available_tenants": [t.model_dump() for t in available_tenants],
            },
        )

    # Update last login
    await auth_service.update_last_login(db, user)

    # Create tokens
    access_token = create_access_token(
        user_id=user.id,
        tenant_id=selected_tenant_id,
        role=selected_role,
    )
    refresh_token = create_refresh_token(user_id=user.id)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    request: TokenRefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenRefreshResponse:
    """Refresh an access token using a refresh token.

    Returns a new access token. The refresh token remains valid.
    """
    try:
        payload = decode_token(request.refresh_token, expected_type="refresh")
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    except TokenDecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Get user
    result = await db.execute(select(User).where(User.id == payload.user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account disabled",
        )

    # Get user's tenant associations to find a default tenant
    associations = await auth_service.get_user_tenant_associations(db, user.id)

    if not associations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no tenant associations",
        )

    # Use the first tenant (or the user's primary tenant_id if set)
    if user.tenant_id:
        # Find association matching user's primary tenant
        association = next(
            (a for a in associations if a.tenant_id == user.tenant_id),
            associations[0],
        )
    else:
        association = associations[0]

    # Create new access token
    access_token = create_access_token(
        user_id=user.id,
        tenant_id=association.tenant_id,
        role=association.role,
    )

    return TokenRefreshResponse(access_token=access_token)


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Get the current authenticated user's profile."""
    return current_user
