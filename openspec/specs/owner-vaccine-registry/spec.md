## Purpose

This spec defines pet owner access to view and manage vaccination records for their pets.

## Requirements

### Requirement: Pet owner vaccine registry access
The system SHALL provide pet owners with access to a vaccination registry for their pets at `/:slug/owner/vaccines`.

#### Scenario: Pet owner navigates to vaccines page
- **WHEN** a pet_owner user navigates to `/:slug/owner/vaccines`
- **THEN** the vaccination registry interface SHALL be displayed

#### Scenario: Admin cannot access owner vaccines route
- **WHEN** an admin user attempts to navigate to `/:slug/owner/vaccines`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Owner vaccine registry placeholder
The system SHALL display a placeholder interface indicating the vaccination registry feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** pet owner views the vaccines page
- **THEN** page SHALL display "Vaccinations" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** pet owner views the vaccines page
- **THEN** page SHALL show a "Coming soon" or similar development message
