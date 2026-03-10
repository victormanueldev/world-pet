## MODIFIED Requirements

### Requirement: User can switch active tenant
The system SHALL allow users to specify which tenant context to use, validated against their authentication.

#### Scenario: User switches active tenant via header
- **WHEN** authenticated user sends request with X-Tenant-ID header for tenant they have access to
- **THEN** system processes request in context of that tenant
- **AND** user's role in that tenant is used for authorization

#### Scenario: User cannot switch to inaccessible tenant
- **WHEN** authenticated user sends request with X-Tenant-ID header for tenant they have no association with
- **THEN** system returns 403 error with "tenant access denied" message

#### Scenario: Unauthenticated user cannot switch tenant
- **WHEN** unauthenticated user sends request with X-Tenant-ID header
- **THEN** system returns 401 error with "not authenticated" message

#### Scenario: Token tenant is used when no header provided
- **WHEN** authenticated user sends request without X-Tenant-ID header
- **THEN** system uses tenant_id from access token as context

## ADDED Requirements

### Requirement: User lists their accessible tenants with authentication
The system SHALL allow authenticated users to list tenants they have access to.

#### Scenario: User lists their accessible tenants
- **WHEN** authenticated user sends GET request to /api/v1/users/me/tenants
- **THEN** system returns list of tenants the user has access to
- **AND** each tenant includes the user's role in that tenant

#### Scenario: Unauthenticated user cannot list tenants
- **WHEN** unauthenticated user sends GET request to /api/v1/users/me/tenants
- **THEN** system returns 401 error with "not authenticated" message

### Requirement: Authenticated tenant context dependency
The system SHALL provide a dependency that combines authentication with tenant context validation.

#### Scenario: get_authenticated_tenant_id validates access
- **WHEN** endpoint uses get_authenticated_tenant_id dependency
- **AND** user is authenticated
- **AND** tenant context (from token or header) is valid for user
- **THEN** dependency returns validated tenant_id

#### Scenario: get_authenticated_tenant_id rejects invalid tenant
- **WHEN** endpoint uses get_authenticated_tenant_id dependency
- **AND** user is authenticated
- **AND** tenant_id (from header) is not accessible to user
- **THEN** dependency raises 403 error with "tenant access denied" message
