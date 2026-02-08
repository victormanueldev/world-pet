import bcrypt
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

from jose import jwt

from app.core.config import settings


def _get_password_payload(password: str) -> bytes:
    """
    Pre-hash password with SHA-256 to avoid bcrypt's 72-byte limit and return bytes.
    """
    # SHA-256 hex digest is always 64 characters
    digest = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return digest.encode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        _get_password_payload(plain_password), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    # Use 12 rounds for a good balance of security and performance
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(_get_password_payload(password), salt)
    return hashed.decode("utf-8")


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return decoded_token if decoded_token["exp"] >= datetime.now(timezone.utc).timestamp() else None
    except Exception:
        return None
