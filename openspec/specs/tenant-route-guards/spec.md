## Purpose

This spec defines frontend route guard behavior for multi-tenant path-based isolation.

## ADDED Requirements

### Requirement: Authenticated users redirected from landing page
The system SHALL redirect authenticated users away from the landing page to their tenant dashboard.

#### Scenario: Authenticated user visits landing page
- **WHEN** authenticated user navigates to `/`
- **THEN** system redirects to `/{user's first tenant slug}/`

#### Scenario: Unauthenticated user visits landing page
- **WHEN** unauthenticated user navigates to `/`
- **THEN** system displays the landing page normally

### Requirement: Authenticated users redirected from root auth pages
The system SHALL redirect authenticated users away from `/login` and `/register` to their tenant dashboard.

#### Scenario: Authenticated user visits /login
- **WHEN** authenticated user navigates to `/login`
- **THEN** system redirects to `/{user's first tenant slug}/`

#### Scenario: Authenticated user visits /register
- **WHEN** authenticated user navigates to `/register`
- **THEN** system redirects to `/{user's first tenant slug}/`

#### Scenario: Authenticated user visits tenant-specific /:slug/login
- **WHEN** authenticated user navigates to `/{validTenantSlug}/login`
- **THEN** system redirects to `/{validTenantSlug}/` (dashboard)

### Requirement: Protected routes require valid tenant slug
The system SHALL validate that the tenant slug in the URL matches one of the user's accessible tenants.

#### Scenario: User accesses protected route with valid tenant slug
- **WHEN** authenticated user navigates to `/{validTenantSlug}/dashboard`
- **AND** the slug matches one of their accessible tenants
- **THEN** system allows access to the protected content

#### Scenario: User accesses protected route with invalid tenant slug
- **WHEN** authenticated user navigates to `/{invalidSlug}/dashboard`
- **AND** the slug does not match any of their accessible tenants
- **THEN** system redirects to `/{user's first tenant slug}/`

#### Scenario: User accesses protected route without tenant slug
- **WHEN** authenticated user attempts to navigate to `/dashboard` (no slug)
- **THEN** system redirects to `/{user's first tenant slug}/`

### Requirement: User with no tenants handled gracefully
The system SHALL handle users who have no accessible tenants appropriately.

#### Scenario: Authenticated user with no tenants visits landing page
- **WHEN** authenticated user with empty tenant list navigates to `/`
- **THEN** system redirects to `/login` with message to select a tenant

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
