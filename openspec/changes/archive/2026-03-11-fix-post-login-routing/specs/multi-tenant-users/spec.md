## MODIFIED Requirements

### Requirement: Post-login tenant redirect
The system SHALL redirect authenticated users to their tenant-specific path after login.

#### Scenario: Single-tenant user logs in
- **WHEN** user with only one tenant logs in successfully
- **THEN** response includes tenant slug in accessible_tenants
- **AND** frontend redirects to `/{tenantSlug}/`

#### Scenario: Multi-tenant user logs in
- **WHEN** user with multiple tenants logs in successfully
- **AND** no preferred tenant is selected
- **THEN** response includes multiple tenants in accessible_tenants
- **AND** frontend shows tenant selector
- **AND** user selection redirects to `/{selectedTenantSlug}/`

#### Scenario: User with tenant context logs in
- **WHEN** user visits `/{slug}/login` and logs in successfully
- **THEN** response includes the requested tenant in accessible_tenants
- **AND** frontend redirects to `/{tenantSlug}/` (the requested tenant)

#### Scenario: Root login redirects to tenant dashboard
- **WHEN** authenticated user visits `/login` (root level)
- **THEN** frontend redirects to `/{firstAccessibleTenantSlug}/`
- **AND** does not display the login form
