## ADDED Requirements

### Requirement: Admin appointment dashboard access
The system SHALL provide admins with access to an appointment management interface at `/:slug/admin/appointments`.

#### Scenario: Admin navigates to appointments page
- **WHEN** an admin user navigates to `/:slug/admin/appointments`
- **THEN** the appointment management interface SHALL be displayed

#### Scenario: Non-admin cannot access appointments page
- **WHEN** a pet_owner user attempts to navigate to `/:slug/admin/appointments`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Appointment management placeholder
The system SHALL display a placeholder interface indicating the appointment management feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** admin views the appointments page
- **THEN** page SHALL display "Appointments" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** admin views the appointments page
- **THEN** page SHALL show a "Coming soon" or similar development message
