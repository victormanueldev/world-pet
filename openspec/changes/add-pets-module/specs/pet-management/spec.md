## ADDED Requirements

### Requirement: Create Pet

The system SHALL allow authenticated users to create a new pet record within their tenant. Admins SHALL be able to create pets with or without an owner. Pet owners SHALL only create pets assigned to themselves.

#### Scenario: Owner creates pet for themselves
- **WHEN** a pet owner submits a valid pet creation request
- **THEN** the system creates a pet with owner_id set to the requesting user
- **THEN** the system sets tenant_id from the user's current tenant context
- **THEN** the system sets status to "owned"
- **THEN** the system returns the created pet with a 201 status code

#### Scenario: Admin creates pet without owner (clinic-owned)
- **WHEN** an admin submits a pet creation request with owner_id as null
- **THEN** the system creates a pet with owner_id null
- **THEN** the system sets tenant_id from the admin's current tenant context
- **THEN** the system sets status to "available_for_adoption"
- **THEN** the system returns the created pet with a 201 status code

#### Scenario: Admin creates pet with owner
- **WHEN** an admin submits a pet creation request with a specific owner_id
- **THEN** the system verifies the owner exists in the same tenant
- **THEN** the system creates a pet with the specified owner_id
- **THEN** the system sets status to "owned"
- **THEN** the system returns the created pet with a 201 status code

#### Scenario: Pet creation with invalid owner (cross-tenant)
- **WHEN** an admin submits a pet creation request with an owner_id from a different tenant
- **THEN** the system rejects the request with a 400 Bad Request error
- **THEN** the system returns an error message indicating owner is not in the same tenant

#### Scenario: Pet creation with missing required fields
- **WHEN** a user submits a pet creation request missing required fields (name, species, sex)
- **THEN** the system rejects the request with a 422 Validation Error
- **THEN** the system returns error details indicating which fields are missing

#### Scenario: Pet creation with invalid species
- **WHEN** a user submits a pet creation request with a species not in the allowed enum (dog, cat, bird, rabbit, other)
- **THEN** the system rejects the request with a 422 Validation Error
- **THEN** the system returns an error message indicating the allowed species values

---

### Requirement: List Pets with Role-Based Filtering

The system SHALL return pets filtered based on the user's role. Pet owners SHALL only see their own pets. Admins SHALL see all pets within their tenant. The system SHALL support filtering, searching, and pagination.

#### Scenario: Owner lists their pets
- **WHEN** a pet owner requests the list of pets
- **THEN** the system returns only pets where owner_id matches the requesting user's ID
- **THEN** the system excludes soft-deleted pets (deleted_at IS NULL)
- **THEN** the system returns pets with a 200 status code

#### Scenario: Admin lists all clinic pets
- **WHEN** an admin requests the list of pets
- **THEN** the system returns all pets in the admin's tenant
- **THEN** the system excludes soft-deleted pets (deleted_at IS NULL)
- **THEN** the system returns pets with a 200 status code

#### Scenario: Filter pets by status
- **WHEN** an admin requests pets with status filter "available_for_adoption"
- **THEN** the system returns only pets with status "available_for_adoption"
- **THEN** the system excludes soft-deleted pets
- **THEN** the system returns pets with a 200 status code

#### Scenario: Filter pets by species
- **WHEN** a user requests pets with species filter "dog"
- **THEN** the system returns only pets with species "dog"
- **THEN** the system applies role-based filtering (owner sees own dogs, admin sees all dogs)
- **THEN** the system returns pets with a 200 status code

#### Scenario: Search pets by name
- **WHEN** a user requests pets with search term "Max"
- **THEN** the system returns pets with names containing "Max" (case-insensitive)
- **THEN** the system applies role-based filtering
- **THEN** the system returns pets with a 200 status code

#### Scenario: Paginated pet list
- **WHEN** a user requests pets with page=2 and limit=20
- **THEN** the system returns pets 21-40 from the filtered result set
- **THEN** the system includes pagination metadata (total, page, limit)
- **THEN** the system returns pets with a 200 status code

#### Scenario: Empty pet list
- **WHEN** a user requests pets and no pets match the filters
- **THEN** the system returns an empty array
- **THEN** the system returns a 200 status code with total=0

---

### Requirement: Retrieve Pet Details

The system SHALL allow users to retrieve detailed information about a specific pet. Pet owners SHALL only retrieve their own pets. Admins SHALL retrieve any pet in their tenant.

#### Scenario: Owner retrieves their own pet
- **WHEN** a pet owner requests details for a pet they own
- **THEN** the system returns the complete pet record
- **THEN** the system includes owner information if available
- **THEN** the system returns the pet with a 200 status code

#### Scenario: Owner tries to retrieve another user's pet
- **WHEN** a pet owner requests details for a pet owned by another user
- **THEN** the system rejects the request with a 404 Not Found error
- **THEN** the system does not reveal whether the pet exists (tenant isolation)

#### Scenario: Admin retrieves any pet in tenant
- **WHEN** an admin requests details for any pet in their tenant
- **THEN** the system returns the complete pet record
- **THEN** the system includes owner information if available
- **THEN** the system returns the pet with a 200 status code

#### Scenario: Admin tries to retrieve pet from different tenant
- **WHEN** an admin requests details for a pet in a different tenant
- **THEN** the system rejects the request with a 404 Not Found error
- **THEN** the system does not reveal whether the pet exists (tenant isolation)

#### Scenario: Retrieve soft-deleted pet
- **WHEN** a user requests details for a soft-deleted pet
- **THEN** the system rejects the request with a 404 Not Found error
- **THEN** the system treats deleted pets as non-existent in standard queries

#### Scenario: Retrieve non-existent pet
- **WHEN** a user requests details for a pet ID that doesn't exist
- **THEN** the system returns a 404 Not Found error

---

### Requirement: Update Pet

The system SHALL allow users to update pet information. Pet owners SHALL only update their own pets. Admins SHALL update any pet in their tenant. The system SHALL validate updates and handle photo changes.

#### Scenario: Owner updates their own pet
- **WHEN** a pet owner submits valid updates for their own pet
- **THEN** the system applies the updates to the pet record
- **THEN** the system updates the updated_at timestamp
- **THEN** the system sets updated_by to the requesting user's ID
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Owner tries to update another user's pet
- **WHEN** a pet owner submits updates for a pet they don't own
- **THEN** the system rejects the request with a 404 Not Found error

#### Scenario: Admin updates any pet
- **WHEN** an admin submits valid updates for any pet in their tenant
- **THEN** the system applies the updates to the pet record
- **THEN** the system updates the updated_at timestamp
- **THEN** the system sets updated_by to the admin's ID
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Update pet with new photo
- **WHEN** a user updates a pet with a new photo_key
- **THEN** the system verifies the new photo exists in S3
- **THEN** the system deletes the old photo from S3 (if it exists)
- **THEN** the system updates the pet with the new photo_key and photo_url
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Update pet with invalid field
- **WHEN** a user submits an update with an invalid field value (e.g., negative weight)
- **THEN** the system rejects the request with a 422 Validation Error
- **THEN** the system returns error details indicating the validation issue

#### Scenario: Update immutable fields
- **WHEN** a user attempts to update immutable fields (tenant_id, created_at, created_by)
- **THEN** the system ignores those fields in the update
- **THEN** the system applies only the allowed field updates
- **THEN** the system returns the updated pet with a 200 status code

---

### Requirement: Soft Delete Pet

The system SHALL allow admins to soft delete pets. Pet owners SHALL NOT be able to delete pets. Soft deletion SHALL preserve the pet record with a timestamp and tag S3 photos for archival.

#### Scenario: Admin soft deletes pet
- **WHEN** an admin requests to delete a pet in their tenant
- **THEN** the system sets the deleted_at timestamp to the current time
- **THEN** the system tags the S3 photo with "deleted=true" (if photo exists)
- **THEN** the system does NOT remove the database record
- **THEN** the system returns a 204 No Content status code

#### Scenario: Owner tries to delete pet
- **WHEN** a pet owner requests to delete their own pet
- **THEN** the system rejects the request with a 403 Forbidden error
- **THEN** the system does not modify the pet record

#### Scenario: Admin tries to delete pet from different tenant
- **WHEN** an admin requests to delete a pet from a different tenant
- **THEN** the system rejects the request with a 404 Not Found error

#### Scenario: Delete already deleted pet
- **WHEN** an admin requests to delete a pet that is already soft-deleted
- **THEN** the system rejects the request with a 404 Not Found error
- **THEN** the system treats deleted pets as non-existent

#### Scenario: Delete pet with future appointments (future consideration)
- **WHEN** an admin requests to delete a pet that has future appointments
- **THEN** the system MAY warn the admin or prevent deletion
- **THEN** the system ensures data integrity for related records

---

### Requirement: Multi-Tenant Isolation

The system SHALL enforce strict tenant isolation for all pet operations. Users SHALL only access pets within their assigned tenant. Cross-tenant access SHALL be prevented at the database query level.

#### Scenario: User queries pets with tenant filter
- **WHEN** any pet operation is performed
- **THEN** the system MUST include tenant_id in the WHERE clause
- **THEN** the system derives tenant_id from the user's JWT token
- **THEN** the system prevents manual tenant_id override in requests

#### Scenario: Attempt to access pet from different tenant
- **WHEN** a user provides a pet_id from a different tenant
- **THEN** the system query returns no results (WHERE tenant_id = ? AND id = ?)
- **THEN** the system returns 404 Not Found (not 403 Forbidden to avoid information disclosure)

#### Scenario: Admin creates pet in different tenant
- **WHEN** an admin attempts to specify a tenant_id different from their current tenant
- **THEN** the system ignores the provided tenant_id
- **THEN** the system uses the tenant_id from the JWT token
- **THEN** the system creates the pet in the correct tenant

---

### Requirement: Audit Trail

The system SHALL maintain an audit trail for pet records. All create and update operations SHALL record the user who performed the action and the timestamp.

#### Scenario: Pet creation audit
- **WHEN** a pet is created
- **THEN** the system sets created_by to the requesting user's ID
- **THEN** the system sets created_at to the current timestamp
- **THEN** the system stores these fields immutably

#### Scenario: Pet update audit
- **WHEN** a pet is updated
- **THEN** the system sets updated_by to the requesting user's ID
- **THEN** the system sets updated_at to the current timestamp
- **THEN** the system preserves the original created_by and created_at values

#### Scenario: Pet deletion audit
- **WHEN** a pet is soft deleted
- **THEN** the system sets deleted_at to the current timestamp
- **THEN** the system preserves all other audit fields
- **THEN** the system allows future forensic analysis

---

### Requirement: Data Validation

The system SHALL validate all pet data according to defined constraints. The system SHALL reject invalid data with clear error messages.

#### Scenario: Validate required fields
- **WHEN** a pet is created or updated
- **THEN** the system requires name, species, and sex fields
- **THEN** the system allows optional fields (breed, birth_date, weight, photo_key)

#### Scenario: Validate species enum
- **WHEN** a pet is created or updated with a species value
- **THEN** the system only accepts: "dog", "cat", "bird", "rabbit", "other"
- **THEN** the system rejects other values with a 422 Validation Error

#### Scenario: Validate sex enum
- **WHEN** a pet is created or updated with a sex value
- **THEN** the system only accepts: "male", "female", "unknown"
- **THEN** the system rejects other values with a 422 Validation Error

#### Scenario: Validate status enum
- **WHEN** a pet status is set
- **THEN** the system only accepts: "available_for_adoption", "owned", "inactive"
- **THEN** the system rejects other values with a 422 Validation Error

#### Scenario: Validate weight value
- **WHEN** a pet is created or updated with a weight value
- **THEN** the system requires weight to be a positive decimal number
- **THEN** the system allows up to 2 decimal places (e.g., 25.50 kg)
- **THEN** the system rejects negative or zero values

#### Scenario: Validate name length
- **WHEN** a pet is created or updated with a name
- **THEN** the system requires name to be 1-100 characters
- **THEN** the system rejects names exceeding 100 characters

#### Scenario: Validate status and owner_id consistency
- **WHEN** a pet is created or updated with status "owned"
- **THEN** the system requires owner_id to be non-null
- **THEN** the system rejects pets with status "owned" and owner_id null

#### Scenario: Validate birth_date
- **WHEN** a pet is created or updated with a birth_date
- **THEN** the system accepts valid ISO 8601 date format (YYYY-MM-DD)
- **THEN** the system rejects future dates
- **THEN** the system allows birth_date to be null (unknown age)
