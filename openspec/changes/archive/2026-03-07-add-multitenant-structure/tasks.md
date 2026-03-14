## 1. Database Models

- [x] 1.1 Create app/models/tenant.py with Tenant SQLAlchemy model (id, name, slug, settings, created_at, updated_at)
- [x] 1.2 Create app/models/user_tenant.py for many-to-many user-tenant association with role
- [x] 1.3 Create Alembic migration for tenant table
- [x] 1.4 Create Alembic migration for user_tenant association table
- [x] 1.5 Add tenant_id column to user table with foreign key
- [x] 1.6 Backfill existing users with default tenant
- [x] 4.3 Implement JWT tenant_id claim extraction
- [x] 4.5 Validate user has access to requested tenant
- [x] 5.2 Update user service to always filter by tenant_id
- [x] 5.3 Add tenant_id required validation to user creation
- [x] 6.2 Add GET /users/me/tenants endpoint for listing user's accessible tenants
- [x] 6.3 Add DELETE /tenants/{tenant_id}/users/{user_id} endpoint
- [x] 7.1 Update user creation to require tenant_id
- [x] 7.2 Update user queries to filter by tenant
- [x] 7.3 Add user-tenant association management in user service
- [x] 7.4 Implement per-tenant role checking

## 8. Frontend - Tenant Context

- [x] 8.1 Create frontend/src/context/TenantContext.tsx with tenant state
- [x] 8.2 Create frontend/src/hooks/useTenant.ts for tenant context access
- [x] 8.3 Update AuthContext to store and manage current tenant
- [x] 9.1 Create frontend/src/components/tenant/TenantSwitcher.tsx
- [x] 9.2 Add tenant switcher to sidebar or header
- [x] 9.3 Implement tenant list fetching for switcher
- [x] 10.1 Update API client to include X-Tenant-ID header
- [x] 10.2 Add tenant context to all API requests
- [x] 10.3 Handle 403 errors for unauthorized tenant access
- [x] 12.3 Run frontend type checking

## 11. Testing

- [x] 11.1 Write unit tests for tenant service CRUD
- [x] 11.2 Write unit tests for tenant context extraction
- [x] 11.3 Write integration tests for tenant isolation
- [x] 11.4 Write integration tests for multi-tenant user access
- [x] 11.5 Add frontend tests for tenant switcher

## 12. Quality Checks

- [x] 12.1 Run backend linting (ruff check)
- [x] 12.2 Run backend type checking (mypy)
- [x] 12.3 Run frontend type checking
- [x] 12.4 Run all tests
