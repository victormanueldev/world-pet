## 1. Backend - Tenant Resolution

- [x] 1.1 Add get_tenant_by_slug dependency in app/dependencies/tenant.py
- [x] 1.2 Create tenant info service method (get_tenant_by_slug) in tenant_service.py
- [x] 1.3 Add slug parameter validation

## 2. Backend - Public Tenant Endpoints

- [x] 2.1 Create GET /tenants/{slug} public endpoint (returns clinic name, slug)
- [x] 2.2 Create POST /tenants/{slug}/register endpoint for pet owner registration
- [x] 2.3 Add validation: slug must exist (return 404 if not found)
- [x] 2.4 Update RegisterResponse to include tenant slug in response

## 3. Backend - Auth Service Updates

- [x] 3.1 Update login response to include tenant slug in accessible_tenants
- [x] 3.2 Update /auth/me response to include tenant slug in tenants list
- [x] 3.3 Ensure tenant_service returns slug with tenant info

## 4. Frontend - Routing Structure

- [x] 4.1 Update App.tsx to support /:slug/* pattern
- [x] 4.2 Create Landing page component for root /
- [x] 4.3 Add route: /:slug/login (clinic-specific login)
- [x] 4.4 Add route: /:slug/register (clinic-specific registration)
- [ ] 4.5 Update ProtectedRoute to handle slug context

## 5. Frontend - Tenant Context

- [x] 5.1 Create TenantProvider to manage tenant state
- [x] 5.2 Add useTenant() hook for components to access tenant info
- [x] 5.3 Implement URL slug ↔ JWT tenant validation
- [x] 5.4 Add redirect for mismatched tenant (redirect to correct path)

## 6. Frontend - Login Flow Updates

- [x] 6.1 Update Login page to handle post-login redirect to tenant path
- [x] 6.2 Update Login page to show tenant name when visiting /:slug/login
- [x] 6.3 Add multi-tenant selection after login (if user has multiple tenants)
- [x] 6.4 Implement redirect to /{slug}/dashboard after successful login

## 7. Frontend - Registration Updates

- [x] 7.1 Update Register page to show clinic name at /:slug/register
- [x] 7.2 Update Register page to show clinic selector at /register (root)
- [x] 7.3 Create "Find your clinic" search/select component (out of scope for MVP)

## 8. Frontend - API Integration

- [x] 8.1 Update API service to call GET /tenants/{slug} for tenant info
- [x] 8.2 Update API service for POST /tenants/{slug}/register endpoint
- [x] 8.3 Update auth service to handle redirect URLs

## 9. Testing

- [x] 9.1 Backend: Add tests for GET /tenants/{slug} endpoint
- [x] 9.2 Backend: Add tests for POST /tenants/{slug}/register endpoint
- [x] 9.3 Frontend: Add tests for tenant routing
- [x] 9.4 Frontend: Add tests for tenant mismatch redirect
- [x] 9.5 Integration: Test end-to-end tenant registration flow
- [x] 9.6 Integration: Test end-to-end login-to-dashboard flow

## 10. Documentation & Cleanup

- [x] 10.1 Update API documentation for new endpoints
- [x] 10.2 Update frontend routing documentation
- [x] 10.3 Run backend tests and fix any failures
- [x] 10.4 Run frontend tests and fix any failures
