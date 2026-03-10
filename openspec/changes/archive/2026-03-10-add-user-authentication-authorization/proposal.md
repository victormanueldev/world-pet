## Why

The World Pet platform currently has a multi-tenant user infrastructure with tenant management, user-tenant associations, and per-tenant roles, but lacks actual authentication and authorization mechanisms. Users cannot log in, API endpoints are unprotected, and role-based access control is not enforced. This change introduces secure user authentication (login/logout, password hashing, JWT tokens) and authorization (role-based permissions, protected routes) to make the platform production-ready.

## What Changes

- **User registration**: New users can create accounts with email/password
- **User login/logout**: JWT-based authentication with access and refresh tokens
- **Password security**: Secure password hashing using bcrypt, password validation rules
- **Protected API routes**: Endpoints require valid authentication tokens
- **Role-based authorization**: Enforce user roles (admin, member) on API operations
- **Tenant-scoped permissions**: Authorization respects the multi-tenant context
- **Current user endpoint**: Authenticated users can retrieve their own profile
- **Token refresh**: Refresh tokens to maintain sessions without re-authentication

## Capabilities

### New Capabilities

- `user-authentication`: User registration, login, logout, password hashing, JWT token generation and validation
- `user-authorization`: Role-based access control, permission checking, protected route dependencies

### Modified Capabilities

- `multi-tenant-users`: Adding authentication context to tenant switching, ensuring users can only access tenants they're authenticated for

## Impact

- **Backend API**: New `/api/v1/auth/*` endpoints (register, login, logout, refresh, me)
- **Models**: User model may need `is_active`, `last_login` fields
- **Dependencies**: New FastAPI dependencies for `get_current_user`, `require_role`
- **All existing endpoints**: Must be updated to require authentication
- **Frontend**: Will need login/registration pages and token management (separate change)
- **External dependencies**: `python-jose` for JWT, `passlib[bcrypt]` for password hashing
