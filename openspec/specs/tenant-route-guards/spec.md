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
