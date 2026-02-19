from fastapi import APIRouter, Depends
from app.schemas.user import User
from app.api.deps.auth import get_current_active_user
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/me", response_model=User)
async def read_user_me(
    current_user: UserModel = Depends(get_current_active_user),
):
    return current_user
