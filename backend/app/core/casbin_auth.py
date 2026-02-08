import casbin
import casbin_sqlalchemy_adapter

from app.infrastructure.database import engine


def get_enforcer():
    adapter = casbin_sqlalchemy_adapter.Adapter(engine)
    enforcer = casbin.Enforcer("app/core/rbac_model.conf", adapter)
    return enforcer


def check_permission(user_id: str, resource: str, action: str) -> bool:
    enforcer = get_enforcer()
    return enforcer.enforce(str(user_id), resource, action)
