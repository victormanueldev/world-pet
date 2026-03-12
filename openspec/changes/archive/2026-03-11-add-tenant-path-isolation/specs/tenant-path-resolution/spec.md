## ADDED Requirements

### Requirement: Tenant resolution from URL path
The system SHALL extract tenant context from the URL path slug.

#### Scenario: Request to tenant path with valid slug
- **WHEN** user sends request to `/api/v1/tenants/{slug}/...` with valid tenant slug
- **THEN** system resolves tenant ID from slug
- **AND** processes request in context of that tenant

#### Scenario: Request to tenant path with invalid slug
- **WHEN** user sends request to `/api/v1/tenants/{invalid-slug}/...` with non-existent slug
- **THEN** system returns 404 error with "Clinic not found" message

#### Scenario: Public endpoint accessible without authentication
- **WHEN** unauthenticated user sends request to tenant-specific public endpoint
- **THEN** system allows access (no authentication required)

### Requirement: Tenant path validation for authenticated routes
The system SHALL validate that authenticated users access appropriate tenant paths.

#### Scenario: User accesses tenant path matching their JWT tenant
- **WHEN** authenticated user with tenant_id in JWT visits `/{tenantSlug}/...`
- **AND** tenantSlug corresponds to their JWT tenant_id
- **THEN** request proceeds normally

#### Scenario: User accesses tenant path NOT matching their JWT tenant
- **WHEN** authenticated user with tenant_id in JWT visits `/{wrongTenantSlug}/...`
- **AND** tenantSlug does NOT correspond to their JWT tenant_id
- **THEN** system returns 403 error with "Access to this clinic denied" message

### Requirement: Root domain accessible without tenant context
The system SHALL allow access to root domain paths without tenant context.

#### Scenario: Access root login page
- **WHEN** user visits `/login`
- **THEN** system renders login page without tenant context required

#### Scenario: Access root registration page
- **WHEN** user visits `/register`
- **THEN** system renders registration page without tenant context required

#### Scenario: Access landing page
- **WHEN** user visits `/`
- **THEN** system renders landing/marketing page without tenant context required
