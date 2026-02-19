from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import User, UserCreate
from app.schemas.token import Token
from app.crud import crud_user, crud_tenant
from app.core import security, rbac
from datetime import timedelta
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await crud_user.get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # 1. Create Tenant
    tenant = await crud_tenant.create_tenant(db, user_in.tenant_name)
    
    # 2. Create User
    new_user = await crud_user.create_user(db, user_in, tenant.id)
    
    # 3. Assign Role (Casbin)
    enforcer = rbac.get_enforcer()
    # p, sub, dom, obj, act
    # admin, tenant_id, *, * (super permissions for this tenant)
    # Actually, let's use groups: g, sub, role, dom
    enforcer.add_grouping_policy(str(new_user.id), "admin", str(tenant.id))
    # Add actual policy for admin role if it doesn't exist (usually handled in seed)
    enforcer.add_policy("admin", str(tenant.id), ".*", ".*")
    
    return new_user

@router.post("/login", response_model=Token)
async def login(db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = await crud_user.get_user_by_email(db, form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
