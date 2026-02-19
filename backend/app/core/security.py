from datetime import datetime, timedelta, timezone
from typing import Any
from jose import jwt
import bcrypt
from app.core.config import settings
import hashlib

def get_password_hash(password: str) -> str:
    # Pre-hash to handle the 72-char limit of bcrypt
    # Use SHA-256 to ensure the input to bcrypt is always 64 bytes
    pre_hashed = hashlib.sha256(password.encode()).hexdigest().encode()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed, salt)
    return hashed.decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pre_hashed = hashlib.sha256(plain_password.encode()).hexdigest().encode()
    return bcrypt.checkpw(pre_hashed, hashed_password.encode())

def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
