## ADDED Requirements

### Requirement: Centralized route configuration
The system SHALL provide a centralized route configuration that defines all protected routes with their role requirements, component mappings, and navigation metadata.

#### Scenario: Route definition includes required metadata
- **WHEN** a route is defined in the configuration
- **THEN** it MUST include path, allowed roles array, component reference, and navigation label

#### Scenario: Route configuration is type-safe
- **WHEN** route configuration is accessed by application code
- **THEN** TypeScript SHALL enforce correct types for roles, paths, and component references

### Requirement: Route groups organize related routes
The system SHALL organize routes into logical groups with labels and role requirements for navigation rendering.

#### Scenario: Route group defines section metadata
- **WHEN** a route group is defined
- **THEN** it MUST include a label, allowed roles array, and array of route definitions

#### Scenario: Routes are filtered by group roles
- **WHEN** navigation is rendered for a user
- **THEN** only route groups matching the user's role SHALL be displayed

### Requirement: Role-based access hook
The system SHALL provide a `useCanAccess` hook that determines if the current user has one of the required roles.

#### Scenario: User has required role
- **WHEN** `useCanAccess(['admin'])` is called and user has admin role
- **THEN** hook SHALL return true

#### Scenario: User lacks required role
- **WHEN** `useCanAccess(['admin'])` is called and user has pet_owner role
- **THEN** hook SHALL return false

#### Scenario: Multiple roles allowed
- **WHEN** `useCanAccess(['admin', 'pet_owner'])` is called and user has pet_owner role
- **THEN** hook SHALL return true

### Requirement: Filtered routes hook
The system SHALL provide a `useFilteredRoutes` hook that returns only route groups and routes accessible to the current user based on their role.

#### Scenario: Admin sees admin routes
- **WHEN** `useFilteredRoutes()` is called by an admin user
- **THEN** returned groups SHALL include "Administration" section with admin routes

#### Scenario: Pet owner sees owner routes
- **WHEN** `useFilteredRoutes()` is called by a pet_owner user
- **THEN** returned groups SHALL include "My Account" section with owner routes

#### Scenario: Shared routes visible to all
- **WHEN** `useFilteredRoutes()` is called by any authenticated user
- **THEN** shared routes (dashboard) SHALL be included for all roles

### Requirement: Auto-generated navigation
The system SHALL auto-generate navigation menus from the centralized route configuration based on the current user's role.

#### Scenario: Navigation renders route groups as sections
- **WHEN** navigation is rendered
- **THEN** each visible route group SHALL appear as a labeled section

#### Scenario: Navigation items link to configured paths
- **WHEN** a navigation item is clicked
- **THEN** user SHALL navigate to the path defined in route configuration

#### Scenario: Navigation shows role-appropriate icons
- **WHEN** navigation item is rendered and route has an icon defined
- **THEN** the specified icon SHALL be displayed alongside the label
