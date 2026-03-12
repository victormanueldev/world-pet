## Purpose

This spec defines admin access to the pet management interface for viewing and managing all pets across the tenant.

## Requirements

### Requirement: Admin pet management access
The system SHALL provide admins with access to a pet management interface at `/:slug/admin/pets`.

#### Scenario: Admin navigates to pets page
- **WHEN** an admin user navigates to `/:slug/admin/pets`
- **THEN** the pet management interface SHALL be displayed

#### Scenario: Non-admin cannot access admin pets page
- **WHEN** a pet_owner user attempts to navigate to `/:slug/admin/pets`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Pet management placeholder
The system SHALL display a placeholder interface indicating the pet management feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** admin views the pets page
- **THEN** page SHALL display "Pet Management" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** admin views the pets page
- **THEN** page SHALL show a "Coming soon" or similar development message
