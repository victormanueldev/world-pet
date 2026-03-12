## ADDED Requirements

### Requirement: Public tenant information endpoint
The system SHALL expose basic tenant information via public API endpoint without authentication.

#### Scenario: Get tenant info with valid slug
- **WHEN** user sends GET request to `/api/v1/tenants/{slug}` with valid slug
- **THEN** system returns 200 with tenant information:
  - `id`: tenant ID
  - `name`: clinic name
  - `slug`: tenant slug

#### Scenario: Get tenant info with invalid slug
- **WHEN** user sends GET request to `/api/v1/tenants/{invalid-slug}` with non-existent slug
- **THEN** system returns 404 error with "Clinic not found" message

#### Scenario: Public endpoint accessible without auth
- **WHEN** unauthenticated user requests tenant info
- **THEN** system returns tenant information (no auth required)

### Requirement: Tenant info used by frontend
The system SHALL provide tenant info that frontend uses to display clinic name on tenant-specific pages.

#### Scenario: Login page displays tenant name
- **WHEN** user visits `/{slug}/login`
- **THEN** frontend displays clinic name from tenant info endpoint
- **AND** shows clinic-specific branding (if implemented)

#### Scenario: Registration page displays tenant name
- **WHEN** user visits `/{slug}/register`
- **THEN** frontend displays clinic name from tenant info endpoint
- **AND** indicates "Registering at [Clinic Name]"
