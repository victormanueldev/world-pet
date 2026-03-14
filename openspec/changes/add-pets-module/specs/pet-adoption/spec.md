## ADDED Requirements

### Requirement: Assign Owner to Pet

The system SHALL allow admins to assign an owner to a clinic-owned pet. The system SHALL update the pet's status to "owned" and record the adoption timestamp. Only admins SHALL be able to perform adoption operations.

#### Scenario: Admin assigns owner to available pet
- **WHEN** an admin assigns an owner_id to a pet with status "available_for_adoption"
- **THEN** the system verifies the owner exists in the same tenant
- **THEN** the system sets the pet's owner_id to the specified user
- **THEN** the system sets the pet's status to "owned"
- **THEN** the system sets the pet's adopted_at timestamp to the current time
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Owner tries to adopt pet
- **WHEN** a pet owner (non-admin) attempts to assign an owner to a pet
- **THEN** the system rejects the request with a 403 Forbidden error
- **THEN** the system does not modify the pet record

#### Scenario: Assign owner from different tenant
- **WHEN** an admin attempts to assign an owner_id from a different tenant
- **THEN** the system rejects the request with a 400 Bad Request error
- **THEN** the system returns an error message indicating owner must be in the same tenant

#### Scenario: Assign non-existent owner
- **WHEN** an admin attempts to assign an owner_id that doesn't exist
- **THEN** the system rejects the request with a 400 Bad Request error
- **THEN** the system returns an error message indicating owner not found

#### Scenario: Adopt already owned pet
- **WHEN** an admin attempts to assign an owner to a pet that already has an owner
- **THEN** the system rejects the request with a 409 Conflict error
- **THEN** the system returns an error message indicating pet is already owned

#### Scenario: Concurrent adoption attempts
- **WHEN** two admins simultaneously attempt to adopt the same pet to different owners
- **THEN** the system uses database row locking (SELECT FOR UPDATE)
- **THEN** the first adoption succeeds
- **THEN** the second adoption receives a 409 Conflict error
- **THEN** only one adoption is recorded

---

### Requirement: Track Adoption History

The system SHALL record the adoption date when a pet is assigned to an owner. The system SHALL maintain this timestamp for audit and historical purposes.

#### Scenario: Record adoption timestamp
- **WHEN** a pet is assigned to an owner
- **THEN** the system sets adopted_at to the current timestamp
- **THEN** the adopted_at field is immutable after being set

#### Scenario: Retrieve pet with adoption date
- **WHEN** an owned pet is retrieved
- **THEN** the response includes the adopted_at timestamp
- **THEN** the response includes the owner information

#### Scenario: Pet without adoption date
- **WHEN** a clinic-owned pet is retrieved (owner_id is null)
- **THEN** the response includes adopted_at as null
- **THEN** the response indicates the pet is available for adoption

---

### Requirement: Change Pet Status

The system SHALL allow admins to change a pet's status. Valid transitions SHALL be enforced. Status changes SHALL be logged and auditable.

#### Scenario: Change status from available to owned (via adoption)
- **WHEN** an admin assigns an owner to an available pet
- **THEN** the system automatically changes status from "available_for_adoption" to "owned"
- **THEN** the system enforces owner_id is not null when status is "owned"

#### Scenario: Change status to inactive
- **WHEN** an admin changes a pet's status to "inactive"
- **THEN** the system updates the status
- **THEN** the system does not modify owner_id or adopted_at
- **THEN** the pet is excluded from "available for adoption" listings

#### Scenario: Invalid status transition
- **WHEN** an admin attempts to set status to "owned" without an owner_id
- **THEN** the system rejects the request with a 400 Bad Request error
- **THEN** the system returns an error message indicating owner_id is required for owned status

#### Scenario: Status consistency validation
- **WHEN** any pet update occurs
- **THEN** the system validates that status "owned" requires owner_id not null
- **THEN** the system validates that status "available_for_adoption" requires owner_id null
- **THEN** the system rejects inconsistent state with a 422 Validation Error

---

### Requirement: List Available Pets for Adoption

The system SHALL allow admins to filter pets by status "available_for_adoption". The system SHALL return only pets without owners. This list SHALL help admins identify adoptable pets.

#### Scenario: Admin lists available pets
- **WHEN** an admin requests pets with status filter "available_for_adoption"
- **THEN** the system returns pets where status = "available_for_adoption"
- **THEN** the system returns pets where owner_id is null
- **THEN** the system excludes soft-deleted pets
- **THEN** the system returns pets with a 200 status code

#### Scenario: Admin searches available pets by species
- **WHEN** an admin requests available pets filtered by species "dog"
- **THEN** the system returns only dogs with status "available_for_adoption"
- **THEN** the system applies both filters (status AND species)

#### Scenario: Empty available pets list
- **WHEN** an admin requests available pets and none exist
- **THEN** the system returns an empty array
- **THEN** the system returns a 200 status code with total=0

#### Scenario: Owner tries to list available pets
- **WHEN** a pet owner requests pets with status "available_for_adoption"
- **THEN** the system returns an empty array (owners only see their own pets)
- **THEN** the system does not reveal clinic-owned pets to non-admins

---

### Requirement: Transfer Ownership

The system SHALL allow admins to transfer a pet from one owner to another. The system SHALL record the ownership change. The original owner SHALL lose access to the pet.

#### Scenario: Admin transfers pet to new owner
- **WHEN** an admin updates a pet's owner_id to a different user
- **THEN** the system verifies the new owner exists in the same tenant
- **THEN** the system updates the pet's owner_id
- **THEN** the system maintains status as "owned"
- **THEN** the system does not change adopted_at (preserves original adoption date)
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Original owner loses access after transfer
- **WHEN** a pet's owner_id is changed to a different user
- **THEN** the original owner can no longer retrieve the pet
- **THEN** the original owner receives a 404 Not Found when attempting to access the pet
- **THEN** the new owner can retrieve the pet

#### Scenario: Transfer to non-existent owner
- **WHEN** an admin attempts to transfer a pet to a non-existent owner_id
- **THEN** the system rejects the request with a 400 Bad Request error

#### Scenario: Transfer to owner in different tenant
- **WHEN** an admin attempts to transfer a pet to an owner in a different tenant
- **THEN** the system rejects the request with a 400 Bad Request error

---

### Requirement: Return Pet to Clinic

The system SHALL allow admins to remove ownership from a pet, returning it to clinic control. The pet SHALL become available for adoption again.

#### Scenario: Admin removes owner from pet
- **WHEN** an admin sets a pet's owner_id to null
- **THEN** the system updates the pet's owner_id to null
- **THEN** the system changes the pet's status to "available_for_adoption"
- **THEN** the system preserves the adopted_at timestamp (historical record)
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Pet appears in available listings after return
- **WHEN** a pet's owner is removed
- **THEN** the pet appears in the "available_for_adoption" list
- **THEN** admins can assign the pet to a new owner

#### Scenario: Previous owner loses access after return
- **WHEN** a pet's owner_id is set to null
- **THEN** the previous owner can no longer retrieve the pet
- **THEN** the previous owner receives a 404 Not Found when attempting to access the pet

---

### Requirement: Adoption Workflow UI

The system SHALL provide a user interface for admins to manage the adoption workflow. The UI SHALL display available pets, allow owner assignment, and show adoption history.

#### Scenario: Admin views adoption candidates
- **WHEN** an admin navigates to the pets list with "available_for_adoption" filter
- **THEN** the UI displays all clinic-owned pets
- **THEN** the UI shows a visual indicator for available status
- **THEN** the UI provides an "Assign Owner" action button

#### Scenario: Admin assigns owner via UI
- **WHEN** an admin clicks "Assign Owner" on an available pet
- **THEN** the UI displays a modal with a user dropdown
- **THEN** the dropdown shows only users in the current tenant
- **THEN** the admin selects an owner and confirms
- **THEN** the frontend calls the adoption API endpoint
- **THEN** the UI updates to show the pet as owned

#### Scenario: Admin views adoption history
- **WHEN** an admin views a pet detail page for an owned pet
- **THEN** the UI displays the owner's name and contact information
- **THEN** the UI displays the adopted_at timestamp
- **THEN** the UI provides a "Transfer Ownership" or "Return to Clinic" action

---

### Requirement: Adoption Notifications (Future Enhancement)

The system MAY send notifications to the new owner when a pet is assigned to them. This is a future enhancement not required for MVP.

#### Scenario: Notify owner on adoption (future)
- **WHEN** an admin assigns a pet to an owner
- **THEN** the system MAY send an email or SMS to the new owner
- **THEN** the notification includes pet details and next steps

---

### Requirement: Adoption Audit Log

The system SHALL log all adoption-related events for compliance and auditing. Logs SHALL include the admin who performed the action, timestamp, and details of the change.

#### Scenario: Log adoption event
- **WHEN** an admin assigns an owner to a pet
- **THEN** the system logs the event with timestamp, admin_id, pet_id, and new owner_id
- **THEN** the log is stored permanently for audit purposes

#### Scenario: Log ownership transfer
- **WHEN** an admin transfers a pet to a different owner
- **THEN** the system logs the event with previous owner_id and new owner_id
- **THEN** the log includes the admin who performed the transfer

#### Scenario: Log return to clinic
- **WHEN** an admin removes an owner from a pet
- **THEN** the system logs the event with the previous owner_id
- **THEN** the log includes the reason (if provided)
