## ADDED Requirements

### Requirement: Pet owner profile management access
The system SHALL provide pet owners with access to a profile management interface at `/:slug/owner/profile`.

#### Scenario: Pet owner navigates to profile page
- **WHEN** a pet_owner user navigates to `/:slug/owner/profile`
- **THEN** the profile management interface SHALL be displayed

#### Scenario: Admin cannot access owner profile route
- **WHEN** an admin user attempts to navigate to `/:slug/owner/profile`
- **THEN** user SHALL be redirected to their dashboard

### Requirement: Owner profile management placeholder
The system SHALL display a placeholder interface indicating the profile management feature is under development.

#### Scenario: Placeholder shows page title
- **WHEN** pet owner views the profile page
- **THEN** page SHALL display "Profile" as the header

#### Scenario: Placeholder indicates coming soon
- **WHEN** pet owner views the profile page
- **THEN** page SHALL show a "Coming soon" or similar development message
