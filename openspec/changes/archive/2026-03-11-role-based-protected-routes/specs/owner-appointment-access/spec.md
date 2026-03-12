## ADDED Requirements

### Requirement: Pet owner appointment access
The system SHALL provide pet owners with access to an appointment viewing and requesting interface at `/:slug/owner/appointments`.

#### Scenario: Pet owner navigates to appointments page
- **WHEN** a pet_owner user navigates to `/:slug/owner/appointments`
- **THEN** the appointment interface SHALL be displayed

#### Scenario: Admin cannot access owner appointments route
- **WHEN** an admin user attempts to navigate to `/:slug/owner/appointments`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Owner appointments placeholder
The system SHALL display a placeholder interface indicating the appointment feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** pet owner views the appointments page
- **THEN** page SHALL display "Appointments" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** pet owner views the appointments page
- **THEN** page SHALL show a "Coming soon" or similar development message
