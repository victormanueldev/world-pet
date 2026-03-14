## Purpose

This capability defines user authorization requirements for the World Pet platform, including protected endpoints, role-based access control, and tenant context validation.

## ADDED Requirements

### Requirement: Protected endpoints require authentication
The system SHALL reject requests to protected endpoints without valid authentication.

#### Scenario: Request without token is rejected
- **WHEN** request is made to protected endpoint without Authorization header
- **THEN** system returns 401 error with "not authenticated" message

#### Scenario: Request with invalid token is rejected
- **WHEN** request is made to protected endpoint with malformed Authorization header
- **THEN** system returns 401 error with "invalid token" message

#### Scenario: Request with valid token succeeds
- **WHEN** request is made to protected endpoint with valid access token in Authorization header
- **THEN** system processes request with user context from token

### Requirement: Role-based access control enforces permissions
The system SHALL enforce role-based permissions on protected operations.

#### Scenario: Admin can perform admin-only operations
- **WHEN** user with admin role in current tenant requests admin-only operation
- **THEN** system allows the operation

#### Scenario: Non-admin cannot perform admin-only operations
- **WHEN** user with member role in current tenant requests admin-only operation
- **THEN** system returns 403 error with "insufficient permissions" message

#### Scenario: Role is checked per-tenant
- **WHEN** user has admin role in tenant A and member role in tenant B
- **AND** user requests admin operation in tenant B context
- **THEN** system returns 403 error with "insufficient permissions" message

### Requirement: Inactive users are denied access
The system SHALL deny access to users with is_active set to false.

#### Scenario: Inactive user request is rejected
- **WHEN** request is made with valid token for user whose is_active is false
- **THEN** system returns 401 error with "account disabled" message

### Requirement: Authorization respects tenant context
The system SHALL validate user's access to the requested tenant.

#### Scenario: User accesses resource in authorized tenant
- **WHEN** authenticated user requests resource in tenant they have access to
- **THEN** system processes request in that tenant context

#### Scenario: User cannot access resource in unauthorized tenant
- **WHEN** authenticated user requests resource in tenant they do not have access to
- **THEN** system returns 403 error with "tenant access denied" message

### Requirement: Current user dependency provides user context
The system SHALL provide FastAPI dependency to extract current user from token.

#### Scenario: get_current_user returns user object
- **WHEN** protected endpoint uses get_current_user dependency
- **AND** request has valid access token
- **THEN** dependency returns User object with id, email, name, role

#### Scenario: get_current_active_user checks is_active
- **WHEN** protected endpoint uses get_current_active_user dependency
- **AND** user's is_active is false
- **THEN** dependency raises 401 error

### Requirement: Role requirement dependency validates roles
The system SHALL provide FastAPI dependency factory to require specific roles.

#### Scenario: require_role allows matching role
- **WHEN** endpoint uses require_role("admin") dependency
- **AND** user has admin role in current tenant
- **THEN** request proceeds

#### Scenario: require_role allows any of multiple roles
- **WHEN** endpoint uses require_role(["admin", "moderator"]) dependency
- **AND** user has moderator role in current tenant
- **THEN** request proceeds

#### Scenario: require_role rejects non-matching role
- **WHEN** endpoint uses require_role("admin") dependency
- **AND** user has member role in current tenant
- **THEN** system returns 403 error
