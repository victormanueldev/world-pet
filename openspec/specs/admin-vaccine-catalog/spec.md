## Purpose

This spec defines admin access to the vaccine catalog management interface for managing available vaccines across the tenant.

## Requirements

### Requirement: Admin vaccine catalog access
The system SHALL provide admins with access to a vaccine catalog management interface at `/:slug/admin/vaccines`.

#### Scenario: Admin navigates to vaccine catalog
- **WHEN** an admin user navigates to `/:slug/admin/vaccines`
- **THEN** the vaccine catalog interface SHALL be displayed

#### Scenario: Non-admin cannot access vaccine catalog
- **WHEN** a pet_owner user attempts to navigate to `/:slug/admin/vaccines`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Vaccine catalog placeholder
The system SHALL display a placeholder interface indicating the vaccine catalog feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** admin views the vaccine catalog page
- **THEN** page SHALL display "Vaccine Catalog" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** admin views the vaccine catalog page
- **THEN** page SHALL show a "Coming soon" or similar development message
