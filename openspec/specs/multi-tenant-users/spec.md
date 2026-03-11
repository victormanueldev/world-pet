## ADDED Requirements

### Requirement: User can belong to multiple tenants
The system SHALL allow users to be associated with multiple tenants.

#### Scenario: User is added to second tenant
- **WHEN** admin adds existing user to a second tenant
- **THEN** system creates user-tenant association with specified role
- **AND** user can now access both tenants

#### Scenario: User lists their accessible tenants
- **WHEN** user sends GET request to /api/v1/users/me/tenants
- **THEN** system returns list of tenants the user has access to

### Requirement: User has per-tenant role
The system SHALL assign roles on a per-tenant basis.

#### Scenario: User has different roles in different tenants
- **WHEN** user is admin in tenant A and member in tenant B
- **THEN** user has admin privileges in tenant A
- **AND** user has member privileges in tenant B

#### Scenario: Admin changes user role in one tenant
- **WHEN** admin updates user role in tenant A only
- **THEN** user's role in tenant B remains unchanged

### Requirement: User can switch active tenant
The system SHALL allow users to specify which tenant context to use, validated against their authentication.

#### Scenario: User switches active tenant
- **WHEN** user sends request with X-Tenant-ID header for tenant they have access to
- **THEN** system processes request in context of that tenant

#### Scenario: User cannot switch to inaccessible tenant
- **WHEN** user attempts to access tenant they have no association with
- **THEN** system returns 403 error with "tenant access denied" message

#### Scenario: Unauthenticated user cannot switch tenant
- **WHEN** unauthenticated user sends request with X-Tenant-ID header
- **THEN** system returns 401 error with "not authenticated" message

#### Scenario: Token tenant is used when no header provided
- **WHEN** authenticated user sends request without X-Tenant-ID header
- **THEN** system uses tenant_id from access token as context

### Requirement: User lists their accessible tenants with authentication
The system SHALL allow authenticated users to list tenants they have access to.

#### Scenario: User lists their accessible tenants
- **WHEN** authenticated user sends GET request to /api/v1/users/me/tenants
- **THEN** system returns list of tenants the user has access to
- **AND** each tenant includes the user's role in that tenant
- **AND** each tenant includes the tenant slug

#### Scenario: Unauthenticated user cannot list tenants
- **WHEN** unauthenticated user sends GET request to /api/v1/users/me/tenants
- **THEN** system returns 401 error with "not authenticated" message

### Requirement: Authenticated tenant context dependency
The system SHALL provide a dependency that combines authentication with tenant context validation.

#### Scenario: get_authenticated_tenant_id validates access
- **WHEN** endpoint uses get_authenticated_tenant_id dependency
- **AND** user is authenticated
- **AND** tenant context (from token or header or URL) is valid for user
- **THEN** dependency returns validated tenant_id

#### Scenario: get_authenticated_tenant_id rejects invalid tenant
- **WHEN** endpoint uses get_authenticated_tenant_id dependency
- **AND** user is authenticated
- **AND** tenant_id (from header or URL) is not accessible to user
- **THEN** dependency raises 403 error with "tenant access denied" message

### Requirement: User-tenant association can be removed
The system SHALL allow removing user access to a tenant.

#### Scenario: Admin removes user from tenant
- **WHEN** admin sends DELETE request to /api/v1/tenants/{tenant_id}/users/{user_id}
- **THEN** user-tenant association is removed
- **AND** user can no longer access that tenant
- **AND** user's data in that tenant is preserved (not deleted)

### Requirement: Post-login tenant redirect
The system SHALL redirect authenticated users to their tenant-specific path after login.

#### Scenario: Single-tenant user logs in
- **WHEN** user with only one tenant logs in successfully
- **THEN** response includes tenant slug in accessible_tenants
- **AND** frontend redirects to `/{tenantSlug}/dashboard`

#### Scenario: Multi-tenant user logs in
- **WHEN** user with multiple tenants logs in successfully
- **AND** no preferred tenant is selected
- **THEN** response includes multiple tenants in accessible_tenants
- **AND** frontend shows tenant selector
- **AND** user selection redirects to `/{selectedTenantSlug}/dashboard`

#### Scenario: User with tenant context logs in
- **WHEN** user visits `/tenants/{slug}/login` and logs in
- **THEN** response includes the requested tenant in accessible_tenants
- **AND** frontend redirects to `/{tenantSlug}/dashboard` (the requested tenant)

#### Scenario: Root login redirects to tenant dashboard
- **WHEN** authenticated user visits `/login` (root level)
- **THEN** frontend redirects to `/{firstAccessibleTenantSlug}/`
- **AND** does not display the login form
