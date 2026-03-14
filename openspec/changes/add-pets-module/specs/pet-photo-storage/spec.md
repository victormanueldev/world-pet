## ADDED Requirements

### Requirement: Generate Presigned Upload URL

The system SHALL provide authenticated users with presigned S3 upload URLs for pet photos. The system SHALL enforce file size and type constraints. Presigned URLs SHALL expire after a defined time period.

#### Scenario: Request presigned URL for valid photo
- **WHEN** an authenticated user requests a presigned upload URL with valid parameters (filename, content_type, file_size)
- **THEN** the system generates a presigned S3 POST URL with expiration
- **THEN** the system returns the upload URL, form fields, and S3 object key
- **THEN** the system includes the CloudFront CDN URL for the photo
- **THEN** the system returns the response with a 200 status code

#### Scenario: Request presigned URL with file too large
- **WHEN** a user requests a presigned upload URL with file_size exceeding 5MB
- **THEN** the system rejects the request with a 400 Bad Request error
- **THEN** the system returns an error message indicating the file size limit

#### Scenario: Request presigned URL with invalid content type
- **WHEN** a user requests a presigned upload URL with content_type not matching image MIME types
- **THEN** the system rejects the request with a 400 Bad Request error
- **THEN** the system returns an error message indicating allowed content types (image/jpeg, image/png, image/webp)

#### Scenario: Unauthenticated presigned URL request
- **WHEN** an unauthenticated user requests a presigned upload URL
- **THEN** the system rejects the request with a 401 Unauthorized error

#### Scenario: Presigned URL structure
- **WHEN** a presigned URL is generated
- **THEN** the S3 object key follows the pattern: pets/{tenant_id}/{pet_id}/{timestamp}_{filename}
- **THEN** the presigned URL includes policy and signature fields
- **THEN** the presigned URL includes content-length-range condition (max 5MB)
- **THEN** the presigned URL includes content-type condition

#### Scenario: Presigned URL expiration
- **WHEN** a presigned URL is generated
- **THEN** the URL expires after 5 minutes
- **THEN** upload attempts after expiration are rejected by S3 with 403 Forbidden

---

### Requirement: Direct S3 Upload

The system SHALL allow clients to upload photos directly to S3 using presigned URLs. The system SHALL not proxy file uploads through the backend. S3 SHALL validate upload constraints defined in the presigned policy.

#### Scenario: Successful direct upload to S3
- **WHEN** a client uploads a photo to S3 using a valid presigned URL
- **THEN** S3 validates the policy signature
- **THEN** S3 validates the file size is within the allowed range
- **THEN** S3 validates the content type matches the policy
- **THEN** S3 stores the object at the specified key
- **THEN** S3 returns a 204 No Content response

#### Scenario: Upload exceeds size limit
- **WHEN** a client uploads a file larger than 5MB using a presigned URL
- **THEN** S3 rejects the upload with a 400 EntityTooLarge error

#### Scenario: Upload with wrong content type
- **WHEN** a client uploads a file with content type different from the presigned policy
- **THEN** S3 rejects the upload with a 403 AccessDenied error

#### Scenario: Upload with expired presigned URL
- **WHEN** a client attempts to upload after the presigned URL has expired
- **THEN** S3 rejects the upload with a 403 AccessDenied error

---

### Requirement: Verify Photo Exists Before Pet Creation

The system SHALL verify that an S3 object exists before associating it with a pet record. The system SHALL reject pet creation if the referenced photo_key does not exist in S3.

#### Scenario: Create pet with valid photo_key
- **WHEN** a user creates a pet with a photo_key parameter
- **THEN** the system calls S3 HeadObject to verify the object exists
- **THEN** the system generates a CloudFront signed URL for the photo
- **THEN** the system saves the pet with photo_key and photo_url
- **THEN** the system returns the created pet with a 201 status code

#### Scenario: Create pet with non-existent photo_key
- **WHEN** a user creates a pet with a photo_key that doesn't exist in S3
- **THEN** the system returns a 400 Bad Request error
- **THEN** the system returns an error message "Photo not found in storage"

#### Scenario: Create pet without photo
- **WHEN** a user creates a pet without providing a photo_key
- **THEN** the system creates the pet with photo_key and photo_url as null
- **THEN** the system returns the created pet with a 201 status code

---

### Requirement: CloudFront CDN Delivery

The system SHALL serve all pet photos through CloudFront CDN. The system SHALL generate CloudFront URLs for photo access. Photo URLs SHALL be globally cached for performance.

#### Scenario: Generate CloudFront URL for photo
- **WHEN** a pet is created or retrieved with a photo
- **THEN** the system generates a CloudFront URL from the S3 object key
- **THEN** the URL uses the format: https://{cloudfront_domain}/{s3_key}
- **THEN** the URL is returned in the pet's photo_url field

#### Scenario: Access photo via CloudFront
- **WHEN** a client requests a photo via the CloudFront URL
- **THEN** CloudFront serves the image from edge cache (if cached)
- **THEN** CloudFront fetches from S3 origin (if not cached)
- **THEN** CloudFront returns the image with a 200 status code
- **THEN** CloudFront sets cache headers for long-term caching (1 year)

#### Scenario: Access non-existent photo
- **WHEN** a client requests a CloudFront URL for a deleted or non-existent photo
- **THEN** CloudFront returns a 404 Not Found error

---

### Requirement: Photo Replacement

The system SHALL allow users to replace a pet's photo. The system SHALL delete the old photo from S3 when a new photo is uploaded. The system SHALL prevent orphaned photos in S3.

#### Scenario: Update pet with new photo
- **WHEN** a user updates a pet with a new photo_key
- **THEN** the system verifies the new photo exists in S3
- **THEN** the system deletes the old photo from S3 (if it exists)
- **THEN** the system updates the pet with the new photo_key and photo_url
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Remove photo from pet
- **WHEN** a user updates a pet with photo_key set to null
- **THEN** the system deletes the existing photo from S3
- **THEN** the system sets photo_key and photo_url to null
- **THEN** the system returns the updated pet with a 200 status code

#### Scenario: Update pet without changing photo
- **WHEN** a user updates a pet without providing a photo_key parameter
- **THEN** the system preserves the existing photo_key and photo_url
- **THEN** the system does not delete any S3 objects
- **THEN** the system returns the updated pet with a 200 status code

---

### Requirement: Soft Delete Photo Archival

The system SHALL tag S3 photos as deleted when a pet is soft deleted. The system SHALL NOT immediately delete photos. S3 lifecycle policies SHALL transition deleted photos to Glacier and eventually delete them.

#### Scenario: Soft delete pet with photo
- **WHEN** an admin soft deletes a pet that has a photo
- **THEN** the system sets the pet's deleted_at timestamp
- **THEN** the system tags the S3 object with "deleted=true"
- **THEN** the system does NOT delete the S3 object immediately
- **THEN** the S3 lifecycle policy transitions the object to Glacier after 30 days
- **THEN** the S3 lifecycle policy permanently deletes the object after 365 days

#### Scenario: Soft delete pet without photo
- **WHEN** an admin soft deletes a pet that has no photo
- **THEN** the system sets the pet's deleted_at timestamp
- **THEN** the system does not attempt S3 operations

---

### Requirement: Orphaned Photo Cleanup

The system SHALL identify and clean up orphaned S3 photos (photos uploaded but not associated with any pet). The system SHALL tag orphaned photos and delete them after a retention period.

#### Scenario: Identify orphaned photos
- **WHEN** a background job scans for orphaned photos
- **THEN** the system lists all S3 objects in the pets/ prefix
- **THEN** the system queries the database for all photo_keys
- **THEN** the system identifies S3 objects not referenced in the database
- **THEN** the system tags orphaned objects older than 24 hours

#### Scenario: Delete orphaned photos
- **WHEN** an S3 lifecycle policy runs on orphaned objects
- **THEN** the system deletes objects tagged with "orphaned=true" after 90 days

#### Scenario: Photo upload without pet creation
- **WHEN** a user uploads a photo but never creates a pet
- **THEN** the photo remains in S3 untagged for 24 hours
- **THEN** the background job tags it as orphaned
- **THEN** the lifecycle policy deletes it after 90 days

---

### Requirement: S3 Bucket Configuration

The system SHALL use a private S3 bucket for photo storage. The bucket SHALL enforce CORS policies for direct uploads. The bucket SHALL use lifecycle policies for cost optimization.

#### Scenario: S3 bucket privacy
- **WHEN** the S3 bucket is configured
- **THEN** the bucket blocks all public access
- **THEN** the bucket requires presigned URLs or CloudFront OAI for access

#### Scenario: CORS configuration
- **WHEN** a client uploads via presigned URL
- **THEN** S3 allows requests from the frontend domain
- **THEN** S3 allows PUT and POST methods
- **THEN** S3 allows required headers (Content-Type, etc.)
- **THEN** S3 sets CORS headers in the response

#### Scenario: Lifecycle policies
- **WHEN** S3 lifecycle policies run
- **THEN** objects tagged "deleted=true" transition to Glacier after 30 days
- **THEN** objects tagged "deleted=true" are permanently deleted after 365 days
- **THEN** objects tagged "orphaned=true" are deleted after 90 days

#### Scenario: Versioning enabled
- **WHEN** an object is overwritten or deleted
- **THEN** S3 preserves the previous version
- **THEN** administrators can recover accidentally deleted photos

#### Scenario: Encryption at rest
- **WHEN** a photo is stored in S3
- **THEN** S3 encrypts the object using AES-256
- **THEN** S3 manages encryption keys automatically (S3-managed keys)

---

### Requirement: Error Handling for S3 Operations

The system SHALL handle S3 service errors gracefully. The system SHALL provide clear error messages when S3 operations fail.

#### Scenario: S3 service unavailable during presigned URL generation
- **WHEN** S3 is unavailable while generating a presigned URL
- **THEN** the system returns a 503 Service Unavailable error
- **THEN** the system returns an error message indicating photo upload is temporarily unavailable

#### Scenario: S3 service unavailable during photo verification
- **WHEN** S3 is unavailable while verifying a photo exists
- **THEN** the system returns a 503 Service Unavailable error
- **THEN** the system advises the user to retry later

#### Scenario: S3 object deletion fails
- **WHEN** S3 fails to delete an old photo during pet update
- **THEN** the system logs the error
- **THEN** the system continues with the pet update
- **THEN** the system does not block the user operation

#### Scenario: CloudFront unavailable
- **WHEN** CloudFront is unavailable while serving a photo
- **THEN** the client receives a CloudFront error (502/503)
- **THEN** the frontend displays a placeholder image
- **THEN** the system allows the user to retry

---

### Requirement: Photo Metadata

The system SHALL store photo metadata in the database. The system SHALL track both the S3 object key and the CloudFront URL.

#### Scenario: Store photo metadata
- **WHEN** a pet is created or updated with a photo
- **THEN** the system stores photo_key (S3 object key)
- **THEN** the system stores photo_url (CloudFront URL)
- **THEN** both fields are nullable (pet may have no photo)

#### Scenario: Retrieve pet with photo
- **WHEN** a pet with a photo is retrieved
- **THEN** the response includes photo_url for display
- **THEN** the response includes photo_key for reference

#### Scenario: Retrieve pet without photo
- **WHEN** a pet without a photo is retrieved
- **THEN** the response includes photo_url as null
- **THEN** the response includes photo_key as null
- **THEN** the frontend displays a placeholder image
