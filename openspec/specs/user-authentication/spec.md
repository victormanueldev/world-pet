## Purpose

This capability defines user authentication requirements for the World Pet platform, including registration, login, token management, and password security.

## ADDED Requirements

### Requirement: User can register with email and password
The system SHALL allow new users to create accounts with email and password credentials.

#### Scenario: Successful registration
- **WHEN** user sends POST request to /api/v1/auth/register with valid email, name, password, and tenant_id
- **THEN** system creates new user with hashed password
- **AND** system creates user-tenant association with role "pet_owner"
- **AND** system returns user profile (without password)

#### Scenario: Registration with existing email fails
- **WHEN** user sends POST request to /api/v1/auth/register with email that already exists
- **THEN** system returns 400 error with "email already registered" message

#### Scenario: Registration with invalid email format fails
- **WHEN** user sends POST request to /api/v1/auth/register with invalid email format
- **THEN** system returns 422 validation error

#### Scenario: Registration with weak password fails
- **WHEN** user sends POST request to /api/v1/auth/register with password shorter than 8 characters
- **THEN** system returns 422 validation error with password requirements

### Requirement: User can authenticate with credentials
The system SHALL allow users to authenticate using email and password to receive JWT tokens.

#### Scenario: Successful login with single tenant
- **WHEN** user sends POST request to /api/v1/auth/login with valid email and password
- **AND** user belongs to exactly one tenant
- **THEN** system returns access_token and refresh_token
- **AND** access_token contains user_id, tenant_id, and role claims
- **AND** system updates user's last_login timestamp

#### Scenario: Successful login with tenant selection
- **WHEN** user sends POST request to /api/v1/auth/login with valid credentials and tenant_id
- **AND** user has access to specified tenant
- **THEN** system returns access_token and refresh_token for that tenant context

#### Scenario: Login requires tenant selection for multi-tenant user
- **WHEN** user sends POST request to /api/v1/auth/login with valid credentials
- **AND** user belongs to multiple tenants
- **AND** no tenant_id is specified
- **THEN** system returns 400 error with list of available tenants

#### Scenario: Login with invalid credentials fails
- **WHEN** user sends POST request to /api/v1/auth/login with invalid email or password
- **THEN** system returns 401 error with "invalid credentials" message

#### Scenario: Login with inactive account fails
- **WHEN** user sends POST request to /api/v1/auth/login with valid credentials
- **AND** user's is_active flag is false
- **THEN** system returns 401 error with "account disabled" message

### Requirement: User can refresh access token
The system SHALL allow users to obtain new access tokens using a valid refresh token.

#### Scenario: Successful token refresh
- **WHEN** user sends POST request to /api/v1/auth/refresh with valid refresh_token
- **THEN** system returns new access_token
- **AND** original refresh_token remains valid

#### Scenario: Token refresh with invalid token fails
- **WHEN** user sends POST request to /api/v1/auth/refresh with invalid or expired refresh_token
- **THEN** system returns 401 error with "invalid refresh token" message

### Requirement: User can retrieve their profile
The system SHALL allow authenticated users to retrieve their own profile information.

#### Scenario: Get current user profile
- **WHEN** authenticated user sends GET request to /api/v1/auth/me
- **THEN** system returns user's id, email, name, role, tenant_id, created_at

#### Scenario: Unauthenticated request to profile fails
- **WHEN** request to /api/v1/auth/me is made without valid access token
- **THEN** system returns 401 error with "not authenticated" message

### Requirement: Passwords are securely hashed
The system SHALL store passwords using bcrypt hashing algorithm.

#### Scenario: Password is hashed on registration
- **WHEN** user registers with password "MySecurePass123"
- **THEN** system stores bcrypt hash, not plaintext
- **AND** stored hash is verifiable against original password

#### Scenario: Password hash is not exposed
- **WHEN** user profile is retrieved via any endpoint
- **THEN** password_hash field is never included in response

### Requirement: Access tokens expire
The system SHALL issue access tokens with limited validity period.

#### Scenario: Access token expires after configured time
- **WHEN** access token is created
- **THEN** token contains exp claim set to 15 minutes from creation

#### Scenario: Expired access token is rejected
- **WHEN** request is made with expired access token
- **THEN** system returns 401 error with "token expired" message
