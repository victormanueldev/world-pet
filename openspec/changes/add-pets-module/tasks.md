## 1. AWS Infrastructure Setup

- [ ] 1.0 Create the CloudFormation file to define the AWS resources
- [ ] 1.1 Add the S3 bucket for pet photos (world-pet-assets-{env})
- [ ] 1.2 Configure S3 bucket CORS policy for direct uploads
- [ ] 1.3 Configure S3 lifecycle policies (deleted photos to Glacier, orphaned cleanup)
- [ ] 1.4 Enable S3 versioning for photo recovery
- [ ] 1.5 Create IAM role/policy for backend S3 access (PutObject, GetObject, DeleteObject, PutObjectTagging)
- [ ] 1.6 Add AWS configuration to backend .env (S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)

## 2. Backend - Database Schema

- [x] 2.1 Create Alembic migration for pets table with all fields (id, tenant_id, owner_id, name, species, breed, sex, birth_date, weight, sterilized, status, photo_url, photo_key, adopted_at, deleted_at, created_at, updated_at, created_by, updated_by)
- [x] 2.2 Add foreign key constraints (tenant_id → tenants, owner_id → users nullable)
- [x] 2.3 Add CHECK constraints (status enum, sex enum, species enum, status+owner_id consistency)
- [x] 2.4 Add indexes (tenant_id, owner_id, status, tenant_id+status, name full-text search)
- [x] 2.5 Add partial indexes for soft delete (WHERE deleted_at IS NULL)
- [x] 2.6 Create trigger for updated_at auto-update
- [x] 2.7 Run migration on development database
- [ ] 2.8 Verify schema with sample data

## 3. Backend - Models and Schemas

- [x] 3.1 Create Pet SQLAlchemy model (app/models/pet.py) with all fields and relationships
- [x] 3.2 Add relationship to User model (owner relationship)
- [x] 3.3 Add relationship to Tenant model
- [x] 3.4 Create Pydantic schemas (app/schemas/pet.py): PetBase, PetCreate, PetUpdate, PetInDB, PetResponse
- [x] 3.5 Create enum classes for Species, Sex, PetStatus
- [x] 3.6 Create PresignedUploadRequest and PresignedUploadResponse schemas
- [x] 3.7 Create PetFilters schema for list endpoint query parameters
- [x] 3.8 Create PaginatedPetResponse schema

## 4. Backend - S3 Service

- [x] 4.1 Create S3Service class (app/services/s3_service.py)
- [x] 4.2 Implement generate_upload_presigned_url method (with size/type validation)
- [x] 4.3 Implement verify_object_exists method (HeadObject)
- [x] 4.4 Implement delete_object method
- [x] 4.5 Implement tag_object method (for deleted/orphaned tags)
- [x] 4.6 Add error handling for S3 client exceptions
- [ ] 4.7 Write unit tests for S3Service

## 5. Backend - Pet Service

- [x] 5.1 Create PetService class (app/services/pet_service.py)
- [x] 5.2 Implement create_pet method with RBAC (owner auto-set for users, optional for admins)
- [x] 5.3 Implement list_pets method with role-based filtering (owners see own, admins see all)
- [x] 5.4 Implement get_pet method with RBAC validation
- [x] 5.5 Implement update_pet method with RBAC and photo replacement logic
- [x] 5.6 Implement soft_delete_pet method (admin only, tag S3 photos)
- [x] 5.7 Implement adopt_pet method (admin assigns owner, sets status, records adopted_at)
- [x] 5.8 Add photo verification in create/update methods (verify S3 object exists)
- [x] 5.9 Add tenant_id filtering to all queries
- [x] 5.10 Add audit trail fields (created_by, updated_by) to all operations
- [ ] 5.11 Write unit tests for PetService (all RBAC scenarios, adoption workflow, photo handling)

## 6. Backend - API Endpoints

- [x] 6.1 Create pets router (app/api/v1/endpoints/pets.py)
- [x] 6.2 Implement POST /v1/pets/upload-url endpoint (generate presigned S3 URL)
- [x] 6.3 Implement POST /v1/pets endpoint (create pet)
- [x] 6.4 Implement GET /v1/pets endpoint (list with filters, pagination, RBAC)
- [x] 6.5 Implement GET /v1/pets/{pet_id} endpoint (retrieve single pet with RBAC)
- [x] 6.6 Implement PUT /v1/pets/{pet_id} endpoint (update pet with RBAC)
- [x] 6.7 Implement PATCH /v1/pets/{pet_id}/adopt endpoint (admin-only adoption)
- [x] 6.8 Implement DELETE /v1/pets/{pet_id} endpoint (admin-only soft delete)
- [x] 6.9 Add dependency injection for PetService and S3Service
- [x] 6.10 Add proper error handling (404, 403, 400, 422, 503)
- [x] 6.11 Register pets router in main app
- [ ] 6.12 Write API integration tests (all endpoints, RBAC, tenant isolation)

## 7. Backend - Configuration and Dependencies

- [x] 7.1 Add boto3 to pyproject.toml dependencies
- [x] 7.2 Update app/core/config.py with S3 settings (bucket name, AWS region)
- [x] 7.3 Add AWS credential loading (from env or IAM role)
- [x] 7.4 Install dependencies (uv sync)

## 8. Backend - Testing

- [ ] 8.1 Write PetService unit tests (create, list, get, update, delete, adopt)
- [ ] 8.2 Write S3Service unit tests (mock boto3 client)
- [ ] 8.3 Write API integration tests (all endpoints with different roles)
- [ ] 8.4 Test multi-tenant isolation (cross-tenant access blocked)
- [ ] 8.5 Test adoption workflow (available → owned → returned)
- [ ] 8.6 Test photo upload/replacement/deletion
- [ ] 8.7 Test soft delete and S3 tagging
- [ ] 8.8 Run all tests and ensure 100% pass rate

## 9. Frontend - Types and Services

- [ ] 9.1 Create TypeScript types (src/types/pet.ts): Pet, PetCreate, PetUpdate, PetSpecies, PetSex, PetStatus
- [ ] 9.2 Create PresignedUploadResponse type
- [ ] 9.3 Create pet API service (src/services/pets.ts)
- [ ] 9.4 Implement getUploadUrl method
- [ ] 9.5 Implement uploadToS3 method (direct upload with presigned URL)
- [ ] 9.6 Implement createPet method
- [ ] 9.7 Implement listPets method (with filter parameters)
- [ ] 9.8 Implement getPet method
- [ ] 9.9 Implement updatePet method
- [ ] 9.10 Implement adoptPet method
- [ ] 9.11 Implement deletePet method
- [ ] 9.12 Add error handling and type safety

## 10. Frontend - Reusable Components

- [ ] 10.1 Create PhotoUpload component (src/components/pets/PhotoUpload.tsx) with drag-drop, preview, validation
- [ ] 10.2 Create PetForm component (src/components/pets/PetForm.tsx) with all fields, validation, photo upload
- [ ] 10.3 Create PetCard component (src/components/pets/PetCard.tsx) for grid/list display
- [ ] 10.4 Create PetFilters component (src/components/pets/PetFilters.tsx) for admin search/filter UI
- [ ] 10.5 Create PetList component (src/components/pets/PetList.tsx) for displaying pet grid/table
- [ ] 10.6 Create PetDetailHeader component (src/components/pets/PetDetailHeader.tsx) with photo, name, age, species
- [ ] 10.7 Create AdoptPetModal component (src/components/pets/AdoptPetModal.tsx) for admin owner assignment
- [ ] 10.8 Add dark theme styling with glassmorphism to all components
- [ ] 10.9 Add Framer Motion animations to components

## 11. Frontend - Owner Pages

- [ ] 11.1 Create PetsPage (src/pages/owner/pets/PetsPage.tsx) - list owner's pets
- [ ] 11.2 Create AddPetPage (src/pages/owner/pets/AddPetPage.tsx) - create new pet with form
- [ ] 11.3 Create EditPetPage (src/pages/owner/pets/EditPetPage.tsx) - edit existing pet
- [ ] 11.4 Create PetDetailPage (src/pages/owner/pets/PetDetailPage.tsx) - view pet details with tabs
- [ ] 11.5 Add empty state UI for no pets
- [ ] 11.6 Add loading states and skeletons
- [ ] 11.7 Add error handling and retry logic
- [ ] 11.8 Add success/error toast notifications

## 12. Frontend - Admin Pages

- [ ] 12.1 Create PetsPage admin version (src/pages/admin/pets/PetsPage.tsx) - list all clinic pets with filters
- [ ] 12.2 Create AddPetPage admin version (src/pages/admin/pets/AddPetPage.tsx) - create pet with optional owner
- [ ] 12.3 Create PetDetailPage admin version (src/pages/admin/pets/PetDetailPage.tsx) - with admin actions
- [ ] 12.4 Add "Assign Owner" functionality (AdoptPetModal integration)
- [ ] 12.5 Add "Change Status" functionality
- [ ] 12.6 Add "Delete Pet" confirmation dialog
- [ ] 12.7 Add filter UI (status, species, owner, search)
- [ ] 12.8 Add pagination controls
- [ ] 12.9 Add "Available for Adoption" quick filter

## 13. Frontend - Routing and Navigation

- [ ] 13.1 Add owner pet routes to route config (/:slug/owner/pets, /new, /:id, /:id/edit)
- [ ] 13.2 Add admin pet routes to route config (/:slug/admin/pets, /new, /:id)
- [ ] 13.3 Update sidebar navigation to include "Pets" for both roles
- [ ] 13.4 Add route guards (owner can't access admin routes)
- [ ] 13.5 Update route configuration with role-based visibility

## 14. Frontend - Photo Upload Flow

- [ ] 14.1 Implement photo selection and client-side validation (size < 5MB, image types only)
- [ ] 14.2 Implement preview with thumbnail
- [ ] 14.3 Implement request presigned URL from backend
- [ ] 14.4 Implement direct upload to S3 with progress indicator
- [ ] 14.5 Implement error handling (expired URL, S3 errors, size exceeded)
- [ ] 14.6 Implement photo replacement flow (delete old, upload new)
- [ ] 14.7 Add loading states during upload
- [ ] 14.8 Add retry logic for failed uploads

## 15. Frontend - Testing

- [ ] 15.1 Write PetForm component tests (render, validation, submission)
- [ ] 15.2 Write PetCard component tests (display, click navigation)
- [ ] 15.3 Write PhotoUpload component tests (file selection, validation, upload)
- [ ] 15.4 Write PetList component tests (empty state, populated list)
- [ ] 15.5 Write PetFilters component tests (filter changes, search)
- [ ] 15.6 Run all frontend tests and ensure pass

## 16. Integration Testing

- [ ] 16.1 Test complete owner flow: create pet with photo → view list → view detail → edit → update photo
- [ ] 16.2 Test complete admin flow: create clinic pet → list available → assign owner → view owned pet
- [ ] 16.3 Test adoption workflow: clinic creates pet → admin assigns owner → owner sees new pet
- [ ] 16.4 Test multi-tenant isolation: user A can't see user B's pets
- [ ] 16.5 Test photo upload end-to-end: presigned URL → S3 upload → create pet → view in CloudFront
- [ ] 16.6 Test soft delete: admin deletes → pet disappears from lists → S3 tagged
- [ ] 16.7 Test RBAC: owner can't access admin endpoints, owner can't delete pet
- [ ] 16.8 Test error scenarios: S3 unavailable, invalid data, network failures

## 17. Documentation and Cleanup

- [ ] 17.1 Update API documentation (OpenAPI/Swagger) with new endpoints
- [ ] 17.2 Add code comments to complex logic (S3 presigned URLs, RBAC filtering, adoption workflow)
- [ ] 17.3 Update README with S3/CloudFront setup instructions
- [ ] 17.4 Document environment variables needed for deployment
- [ ] 17.5 Run linters (backend: ruff, mypy; frontend: eslint, tsc)
- [ ] 17.6 Fix any linting errors
- [ ] 17.7 Format code (backend: ruff format; frontend: prettier)
