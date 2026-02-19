from fastapi import Depends, HTTPException, status
from app.core import rbac
from app.api.deps.auth import get_current_user
from app.models.user import User

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):
        enforcer = rbac.get_enforcer()
        for role in self.allowed_roles:
            # Check if user has the role in their tenant
            # g, sub, role, dom
            if enforcer.has_grouping_policy(str(current_user.id), role, str(current_user.tenant_id)):
                return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
