"""Unit tests for the security module."""

from datetime import timedelta

import pytest

from app.core.security import (
    InvalidTokenTypeError,
    TokenDecodeError,
    TokenExpiredError,
    TokenPayload,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    """Tests for password hashing functions."""

    def test_hash_password_returns_hash(self) -> None:
        """Test that hash_password returns a bcrypt hash."""
        password = "MySecurePassword123"
        hashed = hash_password(password)

        assert hashed != password
        assert hashed.startswith("$2b$")  # bcrypt identifier

    def test_hash_password_different_for_same_input(self) -> None:
        """Test that hashing the same password twice produces different hashes (due to salt)."""
        password = "MySecurePassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2

    def test_verify_password_correct(self) -> None:
        """Test that verify_password returns True for correct password."""
        password = "MySecurePassword123"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self) -> None:
        """Test that verify_password returns False for incorrect password."""
        password = "MySecurePassword123"
        hashed = hash_password(password)

        assert verify_password("WrongPassword", hashed) is False

    def test_verify_password_empty_password(self) -> None:
        """Test that empty password doesn't match a hash."""
        password = "MySecurePassword123"
        hashed = hash_password(password)

        assert verify_password("", hashed) is False


class TestAccessToken:
    """Tests for access token creation and decoding."""

    def test_create_access_token(self) -> None:
        """Test that create_access_token returns a valid JWT."""
        token = create_access_token(user_id=1, tenant_id=10, role="admin")

        assert token is not None
        assert isinstance(token, str)
        # JWT format: header.payload.signature
        assert token.count(".") == 2

    def test_decode_access_token(self) -> None:
        """Test that access token can be decoded with correct claims."""
        token = create_access_token(user_id=42, tenant_id=10, role="admin")
        payload = decode_token(token, expected_type="access")

        assert payload.user_id == 42
        assert payload.tenant_id == 10
        assert payload.role == "admin"
        assert payload.token_type == "access"

    def test_access_token_contains_claims(self) -> None:
        """Test that access token contains all required claims."""
        token = create_access_token(user_id=1, tenant_id=5, role="member")
        payload = decode_token(token, expected_type="access")

        assert payload.sub == "1"
        assert payload.tenant_id == 5
        assert payload.role == "member"
        assert payload.token_type == "access"

    def test_expired_access_token_raises(self) -> None:
        """Test that expired access token raises TokenExpiredError."""
        token = create_access_token(
            user_id=1,
            tenant_id=10,
            role="admin",
            expires_delta=timedelta(seconds=-1),  # Already expired
        )

        with pytest.raises(TokenExpiredError, match="expired"):
            decode_token(token)


class TestRefreshToken:
    """Tests for refresh token creation and decoding."""

    def test_create_refresh_token(self) -> None:
        """Test that create_refresh_token returns a valid JWT."""
        token = create_refresh_token(user_id=1)

        assert token is not None
        assert isinstance(token, str)
        assert token.count(".") == 2

    def test_decode_refresh_token(self) -> None:
        """Test that refresh token can be decoded."""
        token = create_refresh_token(user_id=42)
        payload = decode_token(token, expected_type="refresh")

        assert payload.user_id == 42
        assert payload.token_type == "refresh"
        # Refresh tokens don't have tenant_id or role
        assert payload.tenant_id is None
        assert payload.role is None

    def test_expired_refresh_token_raises(self) -> None:
        """Test that expired refresh token raises TokenExpiredError."""
        token = create_refresh_token(
            user_id=1,
            expires_delta=timedelta(seconds=-1),
        )

        with pytest.raises(TokenExpiredError, match="expired"):
            decode_token(token, expected_type="refresh")


class TestTokenTypeValidation:
    """Tests for token type validation."""

    def test_access_token_as_refresh_raises(self) -> None:
        """Test that using access token as refresh token raises error."""
        token = create_access_token(user_id=1, tenant_id=10, role="admin")

        with pytest.raises(InvalidTokenTypeError, match="Expected refresh"):
            decode_token(token, expected_type="refresh")

    def test_refresh_token_as_access_raises(self) -> None:
        """Test that using refresh token as access token raises error."""
        token = create_refresh_token(user_id=1)

        with pytest.raises(InvalidTokenTypeError, match="Expected access"):
            decode_token(token, expected_type="access")


class TestInvalidTokens:
    """Tests for invalid token handling."""

    def test_invalid_token_format(self) -> None:
        """Test that invalid token format raises TokenDecodeError."""
        with pytest.raises(TokenDecodeError, match="Invalid token"):
            decode_token("not-a-valid-jwt")

    def test_tampered_token_raises(self) -> None:
        """Test that tampered token raises TokenDecodeError."""
        token = create_access_token(user_id=1, tenant_id=10, role="admin")
        # Tamper with the token
        tampered = token[:-5] + "xxxxx"

        with pytest.raises(TokenDecodeError, match="Invalid token"):
            decode_token(tampered)

    def test_empty_token_raises(self) -> None:
        """Test that empty token raises TokenDecodeError."""
        with pytest.raises(TokenDecodeError, match="Invalid token"):
            decode_token("")


class TestTokenPayload:
    """Tests for TokenPayload class."""

    def test_token_payload_user_id_property(self) -> None:
        """Test that TokenPayload.user_id returns integer."""
        payload = TokenPayload(
            sub="42", token_type="access", tenant_id=10, role="admin"
        )

        assert payload.user_id == 42
        assert isinstance(payload.user_id, int)

    def test_token_payload_attributes(self) -> None:
        """Test TokenPayload attributes."""
        payload = TokenPayload(sub="1", token_type="access", tenant_id=5, role="member")

        assert payload.sub == "1"
        assert payload.token_type == "access"
        assert payload.tenant_id == 5
        assert payload.role == "member"
