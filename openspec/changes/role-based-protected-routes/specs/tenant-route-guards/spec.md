## ADDED Requirements

### Requirement: Protected routes enforce role-based access
The system SHALL validate that authenticated users have the required role(s) to access role-protected routes.

#### Scenario: User with required role accesses protected route
- **WHEN** authenticated user navigates to a route requiring their role
- **AND** user's role matches one of the route's required roles
- **THEN** system SHALL allow access to the protected content

#### Scenario: User without required role attempts to access protected route
- **WHEN** authenticated user navigates to a route requiring a different role
- **AND** user's role does not match any of the route's required roles
- **THEN** system SHALL redirect user to their tenant dashboard

#### Scenario: Admin attempts to access owner-only route
- **WHEN** admin user navigates to `/:slug/owner/pets`
- **THEN** system SHALL redirect to `/:slug/` (dashboard)

#### Scenario: Pet owner attempts to access admin-only route
- **WHEN** pet_owner user navigates to `/:slug/admin/settings`
- **THEN** system SHALL redirect to `/:slug/` (dashboard)

### Requirement: Role-based route protection integrates with centralized configuration
The system SHALL use the centralized route configuration to determine role requirements for protected routes.

#### Scenario: ProtectedRoute uses route config for role validation
- **WHEN** ProtectedRoute component renders with requiredRoles prop
- **THEN** it SHALL validate current user role against the provided roles array

#### Scenario: Nested admin routes inherit admin role requirement
- **WHEN** user navigates to any route under `/:slug/admin/*`
- **THEN** ProtectedRoute SHALL enforce admin role requirement

#### Scenario: Nested owner routes inherit pet_owner role requirement
- **WHEN** user navigates to any route under `/:slug/owner/*`
- **THEN** ProtectedRoute SHALL enforce pet_owner role requirement
