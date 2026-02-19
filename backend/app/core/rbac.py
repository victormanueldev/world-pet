import casbin
import casbin_sqlalchemy_adapter
from sqlalchemy import create_engine
from app.core.config import settings

_enforcer = None

def get_enforcer():
    global _enforcer
    if _enforcer is None:
        # For Casbin, we use a sync engine for the adapter
        sync_url = settings.SQLALCHEMY_DATABASE_URI.replace("postgresql+asyncpg://", "postgresql://")
        casbin_engine = create_engine(sync_url)
        casbin_adapter = casbin_sqlalchemy_adapter.Adapter(casbin_engine)
        
        model_path = "rbac/model.conf"
        _enforcer = casbin.Enforcer(model_path, casbin_adapter)
        _enforcer.load_policy()
    return _enforcer
