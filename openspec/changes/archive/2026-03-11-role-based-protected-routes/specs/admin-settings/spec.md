## ADDED Requirements

### Requirement: Admin settings access
The system SHALL provide admins with access to a system settings interface at `/:slug/admin/settings`.

#### Scenario: Admin navigates to settings page
- **WHEN** an admin user navigates to `/:slug/admin/settings`
- **THEN** the settings interface SHALL be displayed

#### Scenario: Non-admin cannot access settings page
- **WHEN** a pet_owner user attempts to navigate to `/:slug/admin/settings`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Settings placeholder
The system SHALL display a placeholder interface indicating the settings feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** admin views the settings page
- **THEN** page SHALL display "Settings" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** admin views the settings page
- **THEN** page SHALL show a "Coming soon" or similar development message
