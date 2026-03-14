## MODIFIED Requirements

### Requirement: Tenant context extracted from URL path
The system SHALL extract tenant slug from URL path for tenant identification.

#### Scenario: Request to tenant-scoped path
- **WHEN** user sends request to `/api/v1/tenants/{slug}/...` path
- **THEN** system resolves tenant_id from slug in the URL path

#### Scenario: Request to tenant path with invalid slug
- **WHEN** user sends request to `/api/v1/tenants/{invalid-slug}/...`
- **AND** slug does not correspond to any tenant
- **THEN** system returns 404 error with "Clinic not found" message

### Requirement: Frontend tenant slug validation
The frontend SHALL validate that the URL slug matches one of the user's accessible tenants before allowing access to protected routes.

#### Scenario: Frontend validates slug against user tenants
- **WHEN** authenticated user navigates to `/{slug}/...` route
- **THEN** frontend checks if slug matches any tenant in user's accessible_tenants
- **AND** if match found, allows access to the protected route
- **AND** if no match, redirects to user's first accessible tenant

#### Scenario: Frontend redirects on invalid slug
- **WHEN** authenticated user navigates to `/{invalidSlug}/dashboard`
- **AND** invalidSlug does not match any accessible tenant
- **THEN** frontend redirects to `/{primaryTenantSlug}/dashboard`
