## ADDED Requirements

### Requirement: Tenant can be created by system
The system SHALL create a default tenant automatically on first system initialization.

#### Scenario: First system initialization creates default tenant
- **WHEN** the system starts for the first time with no tenants
- **THEN** system creates a default tenant with name "Default" and slug "default"

### Requirement: Tenant can be retrieved by ID
The system SHALL allow retrieval of a single tenant by its unique identifier.

#### Scenario: Admin requests tenant by valid ID
- **WHEN** admin sends GET request to /api/v1/tenants/{tenant_id} with valid ID
- **THEN** system returns the tenant object with id, name, slug, settings, created_at, updated_at

#### Scenario: Admin requests tenant by invalid ID
- **WHEN** admin sends GET request to /api/v1/tenants/{tenant_id} with non-existent ID
- **THEN** system returns 404 error with "tenant not found" message

### Requirement: Tenant can be updated
The system SHALL allow updating tenant information including name and settings.

#### Scenario: Admin updates tenant name
- **WHEN** admin sends PATCH request to /api/v1/tenants/{tenant_id} with new name
- **THEN** system updates the tenant's name and returns the updated tenant object

#### Scenario: Admin updates tenant settings
- **WHEN** admin sends PATCH request to /api/v1/tenants/{tenant_id} with new settings
- **THEN** system updates the tenant's settings and returns the updated tenant object

### Requirement: Tenant can be deleted
The system SHALL allow deletion of tenant accounts.

#### Scenario: Admin deletes a tenant
- **WHEN** admin sends DELETE request to /api/v1/tenants/{tenant_id} with valid ID
- **AND** tenant has no associated users
- **THEN** system marks the tenant as deleted and returns 204 status

#### Scenario: Admin attempts to delete tenant with users
- **WHEN** admin sends DELETE request to /api/v1/tenants/{tenant_id} that has associated users
- **THEN** system returns 400 error with "cannot delete tenant with users" message

### Requirement: Tenants can be listed
The system SHALL provide a list of all tenants.

#### Scenario: Admin lists all tenants
- **WHEN** admin sends GET request to /api/v1/tenants
- **THEN** system returns all tenants with their basic information
- **AND** response includes pagination metadata
