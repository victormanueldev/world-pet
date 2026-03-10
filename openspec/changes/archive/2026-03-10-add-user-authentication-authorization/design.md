## Context

World Pet has a multi-tenant architecture with:
- `User` model with `email`, `name`, `password_hash`, `role`, `tenant_id`
- `UserTenant` association table for multi-tenant membership with per-tenant roles
- Existing `get_current_tenant_id` dependency that extracts tenant from headers
- Configuration with `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` already defined
- Service layer (`user_service.py`) with tenant-scoped CRUD operations

Currently, endpoints are unprotected - anyone can call them without authentication. The `password_hash` field exists but no hashing or verification logic is implemented.

## Goals / Non-Goals

**Goals:**
- Implement secure JWT-based authentication with access and refresh tokens
- Add user registration with email/password validation
- Create reusable FastAPI dependencies for authentication and authorization
- Enforce role-based access control respecting the multi-tenant context
- Protect all existing API endpoints

**Non-Goals:**
- OAuth2/social login (future enhancement)
- Email verification or password reset flows (future enhancement)
- Frontend implementation (separate change)
- API rate limiting (separate concern)
- Session management/token revocation list (keep stateless for simplicity)

## Decisions

### D1: JWT Token Strategy - Dual Token Approach

**Decision**: Use separate access tokens (short-lived, 15 min) and refresh tokens (long-lived, 7 days).

**Alternatives considered**:
- Single long-lived token: Simpler but security risk if compromised
- Session-based auth: Requires server-side state, doesn't scale well

**Rationale**: Access tokens are included in every request and may be logged/cached, so they should expire quickly. Refresh tokens are only used for token renewal, reducing exposure. This balances security with user experience.

**Implementation**:
- Access token: Contains `sub` (user_id), `tenant_id`, `role`, expires in 15 minutes
- Refresh token: Contains only `sub` (user_id), `type: "refresh"`, expires in 7 days
- Both use HS256 with `SECRET_KEY` from config

### D2: Password Hashing - bcrypt via passlib

**Decision**: Use `passlib[bcrypt]` with default work factor.

**Alternatives considered**:
- argon2: More modern but less widely supported
- scrypt: Good but bcrypt has better library support
- Plain hashlib: Insecure, no salting or work factor

**Rationale**: bcrypt is battle-tested, automatically handles salting, and passlib provides a clean API with automatic algorithm upgrades.

### D3: Dependency Injection Pattern for Auth

**Decision**: Create composable FastAPI dependencies:
- `get_current_user`: Validates token, returns User object
- `get_current_active_user`: Adds `is_active` check
- `require_role(roles)`: Factory returning dependency that checks user role
- `get_authenticated_tenant_id`: Combines auth + tenant context

**Alternatives considered**:
- Middleware-based auth: Less flexible, can't skip for public routes
- Decorator-based: Doesn't integrate with FastAPI's DI system

**Rationale**: FastAPI's dependency injection is idiomatic, allows per-route customization, and provides automatic OpenAPI documentation.

### D4: Auth Endpoints Structure

**Decision**: Create `/api/v1/auth/*` router with:
- `POST /auth/register` - Create new user (public)
- `POST /auth/login` - Authenticate, return tokens (public)
- `POST /auth/refresh` - Exchange refresh token for new access token (public)
- `GET /auth/me` - Get current user profile (protected)
- `POST /auth/logout` - Client-side only, no server action (stateless)

**Rationale**: RESTful, follows common patterns, keeps auth separate from resource endpoints.

### D5: Tenant Context in Authentication

**Decision**: Include `tenant_id` in access token claims. User must specify tenant at login if they belong to multiple tenants. The `X-Tenant-ID` header can override for tenant switching (validated against user's tenant access).

**Flow**:
1. Login: If user has one tenant, auto-select. If multiple, require `tenant_id` in request or return list of available tenants.
2. Requests: Token's `tenant_id` is default context, `X-Tenant-ID` header can override (validated).
3. `get_authenticated_tenant_id` dependency: Returns tenant from token or header, validates user has access.

**Rationale**: Embeds common case in token (single tenant users), while supporting multi-tenant switching via header for power users.

### D6: User Model Extensions

**Decision**: Add to `User` model:
- `is_active: bool = True` - Soft disable accounts
- `last_login: datetime | None` - Audit trail

**Rationale**: `is_active` allows account suspension without deletion. `last_login` supports security monitoring.

## Risks / Trade-offs

**[Risk] Stateless tokens cannot be revoked** → Accept for MVP. Future: Add token blacklist with Redis or short access token expiry (already doing 15 min).

**[Risk] Refresh token theft** → Mitigate with: (1) HTTPS only in production, (2) HttpOnly cookies for web clients (future), (3) Short refresh token lifetime (7 days).

**[Risk] Tenant ID in token may become stale** → Mitigate by re-validating tenant access on each request via `get_authenticated_tenant_id`. Token's tenant_id is a hint, not the source of truth.

**[Trade-off] bcrypt is CPU-intensive** → Accept. Security benefit outweighs performance cost. Use reasonable work factor (default 12).

**[Trade-off] No email verification** → Accept for MVP. Users can register with any email. Add verification flow later.

## Migration Plan

1. Add new dependencies: `python-jose[cryptography]`, `passlib[bcrypt]`
2. Create database migration for `is_active`, `last_login` on User model
3. Add auth module: `app/core/security.py` (password hashing, token utils)
4. Add auth dependencies: `app/dependencies/auth.py`
5. Add auth router: `app/api/v1/endpoints/auth.py`
6. Update existing endpoints to use auth dependencies
7. Update tests with auth fixtures

**Rollback**: Remove auth dependencies from endpoints, endpoints become public again.
