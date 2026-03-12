## ADDED Requirements

### Requirement: Tenant-specific registration endpoint
The system SHALL allow pet owner registration at a specific clinic via URL path.

#### Scenario: Register at valid tenant slug
- **WHEN** user sends POST request to `/api/v1/tenants/{slug}/register`
- **AND** slug corresponds to existing tenant
- **AND** email is not already registered
- **THEN** system creates user associated with that tenant
- **AND** returns 201 with user information

#### Scenario: Register at invalid tenant slug
- **WHEN** user sends POST request to `/api/v1/tenants/{invalid-slug}/register`
- **AND** slug does not correspond to any tenant
- **THEN** system returns 404 error with "Clinic not found" message

#### Scenario: Register with existing email at tenant
- **WHEN** user sends POST request to `/api/v1/tenants/{slug}/register`
- **AND** email is already registered in system
- **THEN** system returns 400 error with "Email already registered" message

#### Scenario: Register without password complexity
- **WHEN** user sends POST request to `/api/v1/tenants/{slug}/register`
- **AND** password does not meet complexity requirements
- **THEN** system returns 422 validation error

### Requirement: Registration form pre-fills tenant context
The system SHALL pre-fill tenant information in registration form based on URL.

#### Scenario: Tenant registration page shows clinic name
- **WHEN** user navigates to `/{slug}/register`
- **THEN** page displays "Register at [Clinic Name]"
- **AND** registration form does not require tenant_id field

#### Scenario: Root registration allows clinic selection
- **WHEN** user navigates to `/register` (root)
- **AND** system cannot determine tenant from context
- **THEN** page shows clinic selector or search
- **AND** user must select a clinic before registering
