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
The system SHALL allow users to specify which tenant context to use.

#### Scenario: User switches active tenant
- **WHEN** user sends request with X-Tenant-ID header for tenant they have access to
- **THEN** system processes request in context of that tenant

#### Scenario: User cannot switch to inaccessible tenant
- **WHEN** user attempts to access tenant they have no association with
- **THEN** system returns 403 error with "tenant access denied" message

### Requirement: User-tenant association can be removed
The system SHALL allow removing user access to a tenant.

#### Scenario: Admin removes user from tenant
- **WHEN** admin sends DELETE request to /api/v1/tenants/{tenant_id}/users/{user_id}
- **THEN** user-tenant association is removed
- **AND** user can no longer access that tenant
- **AND** user's data in that tenant is preserved (not deleted)
