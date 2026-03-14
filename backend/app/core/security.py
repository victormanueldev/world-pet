"""Security utilities for password hashing and JWT token management."""

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a password using bcrypt.

    Args:
        password: Plain text password to hash.

    Returns:
        The hashed password string.
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password.

    Args:
        plain_password: The plain text password to verify.
        hashed_password: The hashed password to compare against.

    Returns:
        True if the password matches, False otherwise.
    """
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(
    user_id: int,
    tenant_id: int,
    role: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT access token.

    Args:
        user_id: The user's ID.
        tenant_id: The tenant's ID.
        role: The user's role in the tenant.
        expires_delta: Optional custom expiration time.

    Returns:
        The encoded JWT access token.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(UTC) + expires_delta
    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "tenant_id": tenant_id,
        "role": role,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    user_id: int,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT refresh token.

    Args:
        user_id: The user's ID.
        expires_delta: Optional custom expiration time.

    Returns:
        The encoded JWT refresh token.
    """
    if expires_delta is None:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    expire = datetime.now(UTC) + expires_delta
    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


class TokenPayload:
    """Decoded JWT token payload."""

    def __init__(
        self,
        sub: str,
        token_type: str,
        tenant_id: int | None = None,
        role: str | None = None,
    ) -> None:
        """Initialize token payload.

        Args:
            sub: Subject (user ID).
            token_type: Type of token ("access" or "refresh").
            tenant_id: Tenant ID (only for access tokens).
            role: User role (only for access tokens).
        """
        self.sub = sub
        self.token_type = token_type
        self.tenant_id = tenant_id
        self.role = role

    @property
    def user_id(self) -> int:
        """Get user ID as integer."""
        return int(self.sub)


class TokenDecodeError(Exception):
    """Exception raised when token decoding fails."""

    pass


class TokenExpiredError(TokenDecodeError):
    """Exception raised when token has expired."""

    pass


class InvalidTokenTypeError(TokenDecodeError):
    """Exception raised when token type is invalid."""

    pass


def decode_token(token: str, expected_type: str = "access") -> TokenPayload:
    """Decode and validate a JWT token.

    Args:
        token: The JWT token string.
        expected_type: Expected token type ("access" or "refresh").

    Returns:
        TokenPayload with decoded claims.

    Raises:
        TokenDecodeError: If token is invalid.
        TokenExpiredError: If token has expired.
        InvalidTokenTypeError: If token type doesn't match expected.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError as e:
        error_msg = str(e).lower()
        if "expired" in error_msg:
            raise TokenExpiredError("Token has expired") from e
        raise TokenDecodeError(f"Invalid token: {e}") from e

    sub: str | None = payload.get("sub")
    token_type: str | None = payload.get("type")

    if sub is None:
        raise TokenDecodeError("Token missing subject claim")

    if token_type is None:
        raise TokenDecodeError("Token missing type claim")

    if token_type != expected_type:
        raise InvalidTokenTypeError(f"Expected {expected_type} token, got {token_type}")

    return TokenPayload(
        sub=sub,
        token_type=token_type,
        tenant_id=payload.get("tenant_id"),
        role=payload.get("role"),
    )
