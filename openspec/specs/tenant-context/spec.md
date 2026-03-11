## ADDED Requirements

### Requirement: Tenant context extracted from JWT
The system SHALL extract tenant_id from JWT token claims.

#### Scenario: Request with valid JWT containing tenant_id
- **WHEN** user sends request with valid JWT that includes tenant_id claim
- **THEN** system extracts tenant_id from token and uses it for data scoping

#### Scenario: Request with JWT missing tenant_id
- **WHEN** user sends request with valid JWT but without tenant_id claim
- **THEN** system returns 400 error with "tenant claim required" message

### Requirement: Tenant context extracted from header
The system SHALL accept tenant_id via X-Tenant-ID header as fallback.

#### Scenario: Request with tenant header
- **WHEN** user sends request with X-Tenant-ID header
- **THEN** system uses header value as tenant_id (if JWT claim not present)

#### Scenario: Both JWT and header tenant_id provided
- **WHEN** user sends request with both JWT tenant_id claim and X-Tenant-ID header
- **THEN** system prioritizes JWT claim over header

### Requirement: Tenant context extracted from URL path
The system SHALL extract tenant slug from URL path for tenant identification.

#### Scenario: Request to tenant-scoped path
- **WHEN** user sends request to `/api/v1/tenants/{slug}/...` path
- **THEN** system resolves tenant_id from slug in the URL path

#### Scenario: Request to tenant path with invalid slug
- **WHEN** user sends request to `/api/v1/tenants/{invalid-slug}/...`
- **AND** slug does not correspond to any tenant
- **THEN** system returns 404 error with "Clinic not found" message

### Requirement: Tenant context validation
The system SHALL validate that the user has access to the requested tenant.

#### Scenario: User requests access to unauthorized tenant
- **WHEN** user with access to tenant A attempts to access tenant B
- **THEN** system returns 403 error with "access to tenant denied" message

### Requirement: Tenant context available in request scope
The system SHALL make tenant context available throughout the request processing.

#### Scenario: Service layer accesses tenant context
- **WHEN** any service method is called
- **THEN** tenant_id is available in the request context for data scoping
