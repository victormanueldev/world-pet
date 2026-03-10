# Backend

## 1. Dependencies and Configuration

- [x] 1.1 Add python-jose[cryptography] and passlib[bcrypt] to pyproject.toml
- [x] 1.2 Update config.py with REFRESH_TOKEN_EXPIRE_DAYS setting (default 7)

## 2. Database Model Updates

- [x] 2.1 Add is_active (bool, default True) and last_login (datetime, nullable) fields to User model
- [x] 2.2 Create Alembic migration for User model changes
- [x] 2.3 Run migration and verify schema changes

## 3. Core Security Module

- [x] 3.1 Create app/core/security.py with password hashing functions (hash_password, verify_password)
- [x] 3.2 Add JWT token creation functions (create_access_token, create_refresh_token)
- [x] 3.3 Add JWT token decoding and validation function (decode_token)
- [x] 3.4 Write unit tests for security module (password hashing, token creation/validation)

## 4. Auth Dependencies

- [x] 4.1 Create app/dependencies/auth.py with get_current_user dependency
- [x] 4.2 Add get_current_active_user dependency (checks is_active)
- [x] 4.3 Add require_role dependency factory for role-based access
- [x] 4.4 Add get_authenticated_tenant_id dependency (combines auth + tenant validation)
- [x] 4.5 Write unit tests for auth dependencies

## 5. Auth Service Layer

- [x] 5.1 Create app/services/auth_service.py with authenticate_user function
- [x] 5.2 Add register_user function with password hashing and user-tenant association
- [x] 5.3 Add get_user_by_email function (global, not tenant-scoped)
- [x] 5.4 Add update_last_login function
- [x] 5.5 Write unit tests for auth service

## 6. Auth Schemas

- [x] 6.1 Create app/schemas/auth.py with LoginRequest, LoginResponse schemas
- [x] 6.2 Add RegisterRequest, RegisterResponse schemas
- [x] 6.3 Add TokenRefreshRequest, TokenRefreshResponse schemas
- [x] 6.4 Add UserProfile schema (for /me endpoint)

## 7. Auth Endpoints

- [x] 7.1 Create app/api/v1/endpoints/auth.py router
- [x] 7.2 Implement POST /auth/register endpoint
- [x] 7.3 Implement POST /auth/login endpoint with single/multi-tenant logic
- [x] 7.4 Implement POST /auth/refresh endpoint
- [x] 7.5 Implement GET /auth/me endpoint (protected)
- [x] 7.6 Register auth router in app/api/v1/router.py
- [x] 7.7 Write integration tests for all auth endpoints

## 8. Update Existing Endpoints

- [x] 8.1 Update users endpoints to use get_current_active_user and get_authenticated_tenant_id
- [x] 8.2 Update tenants endpoints to require authentication and admin role where appropriate
- [x] 8.3 Update /users/me/tenants endpoint to use authenticated user context
- [x] 8.4 Verify all protected endpoints return 401 without token

## 9. Backend Integration Testing

- [x] 9.1 Create auth test fixtures (authenticated client, test users with tokens)
- [x] 9.2 Write end-to-end tests for registration → login → access protected resource flow
- [x] 9.3 Write tests for multi-tenant user login and tenant switching
- [x] 9.4 Write tests for role-based access control scenarios
- [x] 9.5 Verify existing tests pass with new auth requirements

# Frontend

## 10. Auth Context and State

- [x] 10.1 Create src/context/AuthContext.tsx with user state, tokens, and auth methods
- [x] 10.2 Create useAuth hook for accessing auth context
- [x] 10.3 Add token storage utilities (localStorage with secure handling)
- [x] 10.4 Implement automatic token refresh logic on app load and before expiry

## 11. Auth API Service

- [x] 11.1 Create src/services/auth.ts with login, register, refresh, logout API calls
- [x] 11.2 Create src/services/api.ts axios instance with Authorization header interceptor
- [x] 11.3 Add response interceptor for 401 handling (redirect to login or attempt refresh)
- [x] 11.4 Write unit tests for auth service

## 12. Auth Pages

- [x] 12.1 Create src/pages/Login.tsx with email/password form and tenant selection
- [x] 12.2 Create src/pages/Register.tsx with registration form (email, name, password, tenant)
- [x] 12.3 Apply glassmorphism dark theme styling to auth pages
- [x] 12.4 Add form validation with error messages
- [x] 12.5 Add loading states and Framer Motion animations
- [x] 12.6 Write component tests for Login and Register pages

## 13. Protected Routes

- [x] 13.1 Create src/components/auth/ProtectedRoute.tsx wrapper component
- [x] 13.2 Create src/components/auth/PublicRoute.tsx (redirects authenticated users)
- [x] 13.3 Update App.tsx routes to use ProtectedRoute for dashboard and other pages
- [x] 13.4 Add /login and /register routes as public routes

## 14. User Profile and Navigation

- [x] 14.1 Create src/components/layout/UserMenu.tsx with user info and logout button
- [x] 14.2 Update Sidebar.tsx to show UserMenu when authenticated
- [x] 14.3 Integrate TenantSwitcher with auth context (only show accessible tenants)
- [x] 14.4 Add loading skeleton while checking auth state on app load

## 15. Frontend Integration Testing

- [x] 15.1 Write tests for auth flow (login → dashboard access)
- [x] 15.2 Write tests for protected route redirects
- [x] 15.3 Write tests for token refresh behavior
- [x] 15.4 Write tests for logout and session cleanup
