## Context

World Pet currently has a solid foundation with multi-tenant architecture, JWT authentication, and role-based access control. However, the core business entities (pets, appointments, vaccines) are not yet implemented. This design focuses exclusively on the Pet module as the foundation for all future clinic operations.

**Current State:**
- Backend: FastAPI with PostgreSQL, SQLAlchemy ORM, Alembic migrations
- Multi-tenancy: Explicit tenant_id pattern with UserTenant association
- Auth: JWT tokens with refresh, role-based access (admin/user)
- Frontend: React + TypeScript, Tailwind CSS, dark glassmorphism theme, Framer Motion
- No file storage solution exists yet

**Key Stakeholders:**
- Pet Owners: Need to manage their pets, upload photos, view details
- Clinic Admins: Need to manage all pets, support adoption workflows, assign owners
- Future modules: Appointments and vaccines will depend on Pet as a foreign key

**Constraints:**
- Must use AWS as cloud provider
- Must be production-ready from day one
- Must support adoption workflow (pets without owners)
- Must maintain existing RBAC patterns
- Must follow existing code patterns (service layer, Pydantic schemas)

## Goals / Non-Goals

**Goals:**
- Implement complete Pet CRUD with multi-tenant isolation
- Enable secure photo upload using AWS S3 with presigned URLs
- Support optional ownership (clinic-owned pets for adoption)
- Implement soft delete to preserve historical data
- Build role-based UI (owner vs admin experiences)
- Establish patterns for future S3 usage (vaccines, reports, etc.)
- Create reusable photo upload component for frontend
- Follow existing architecture patterns consistently

**Non-Goals:**
- Appointment scheduling (separate change)
- Vaccine tracking (separate change)
- Nutrition logging (separate change)
- Bulk import/export of pets
- Advanced image processing (thumbnails, watermarks) - CloudFront can handle basic transforms
- Multi-photo galleries (one photo per pet for MVP)
- Social features (pet profiles, sharing)

## Decisions

### Decision 1: Explicit tenant_id in Pet Model

**Choice:** Add `tenant_id` directly to the `pets` table as a foreign key to `tenants`.

**Alternatives Considered:**
- Implicit tenancy via owner's UserTenant relationship
- Tenant context from request only (not in model)

**Rationale:**
- **Performance:** Direct tenant filtering in queries (`WHERE tenant_id = ?`) uses indexes efficiently without joins
- **Data isolation:** Explicit column makes tenant boundaries clear for auditing and compliance
- **Consistency:** Matches existing pattern seen in `user_tenants` table
- **Adoption workflow:** When `owner_id` is NULL, we still need tenant ownership
- **Query simplicity:** `SELECT * FROM pets WHERE tenant_id = ? AND owner_id = ?` vs multi-join through UserTenant

**Trade-off:** Slight data redundancy (tenant_id stored even when owner exists), but gains in query performance and clarity.

---

### Decision 2: Optional owner_id with Status Field

**Choice:** Make `owner_id` nullable and add `status` enum field (`available_for_adoption`, `owned`, `inactive`).

**Alternatives Considered:**
- Required owner_id (creates placeholder "clinic" user)
- Separate `clinic_pets` and `owned_pets` tables
- Boolean `is_adopted` flag only

**Rationale:**
- **Real-world workflow:** Shelters/rescues create pet records before adoption
- **Data integrity:** NULL clearly represents "no owner yet" vs fake user
- **Status tracking:** Enum provides richer lifecycle states than boolean
- **Database constraint:** Can enforce `owner_id NOT NULL` when `status = 'owned'` via CHECK constraint
- **Audit trail:** `adopted_at` timestamp provides adoption history

**Trade-off:** Nullable foreign key requires careful handling in queries and UI, but reflects business reality.

---

### Decision 3: AWS S3 with Presigned URLs (Not Direct Upload to Backend)

**Choice:** Backend generates presigned POST URLs; frontend uploads directly to S3.

**Alternatives Considered:**
- Frontend sends base64 to backend, backend uploads to S3
- Backend proxies multipart upload to S3
- Store in database as BYTEA

**Rationale:**
- **Scalability:** Offloads upload traffic from backend servers to S3
- **Performance:** No backend bottleneck, leverages AWS global infrastructure
- **Security:** Presigned URLs expire (5 min), include size/type constraints
- **Cost:** No egress fees through backend, S3 storage is cheap
- **Best practice:** AWS-recommended pattern for client uploads
- **Future-proof:** Lambda@Edge can add transforms (resize, watermark) later

**Implementation Pattern:**
1. Frontend: Request presigned URL from `POST /v1/pets/upload-url`
2. Backend: Generates presigned POST with boto3, returns URL + fields
3. Frontend: Uploads file directly to S3 using presigned URL
4. Frontend: Sends `photo_key` to `POST /v1/pets` to create pet
5. Backend: Verifies S3 object exists, generates CloudFront signed URL

**Trade-off:** More complex client logic, but massive scalability and performance gains.

---

### Decision 4: Soft Delete with S3 Lifecycle Archival

**Choice:** Set `deleted_at` timestamp, tag S3 objects as deleted, use lifecycle policy to archive.

**Alternatives Considered:**
- Hard delete (permanent removal)
- Move to `deleted_pets` table
- Keep forever (no cleanup)

**Rationale:**
- **Data recovery:** Accidental deletions can be reversed
- **Audit compliance:** Maintain history for regulatory requirements
- **Relationships:** Preserve foreign key integrity (appointments/vaccines reference pet_id)
- **Cost optimization:** S3 Glacier is 90% cheaper than standard storage
- **Automatic cleanup:** Lifecycle policies are fire-and-forget

**S3 Lifecycle Policy:**
```
Rule: Archive Deleted Pets
- Filter: Tag deleted=true
- Transition to Glacier: 30 days after deletion
- Permanent delete: 365 days after deletion
```

**Database Pattern:**
- Default queries: `WHERE deleted_at IS NULL`
- Index: Partial index on `deleted_at IS NULL` for performance
- Admin view: Can see deleted pets, undelete if needed

**Trade-off:** Storage cost for deleted data, but minimal with Glacier and essential for production.

---

### Decision 6: Hardcoded Species Enum (Not Dynamic Table)

**Choice:** Use SQLAlchemy Enum with values: `dog`, `cat`, `bird`, `rabbit`, `other`.

**Alternatives Considered:**
- Separate `species` table with admin CRUD
- Free-text field with suggestions

**Rationale:**
- **Simplicity:** No joins, no admin UI, no migration for new species
- **Type safety:** Frontend and backend validate against same enum
- **Sufficient for MVP:** 5 species cover 95% of vet clinic cases
- **Performance:** Enum is stored as VARCHAR in PostgreSQL, indexed efficiently
- **Future migration:** Easy to switch to table later if needed without breaking API

**Migration Path (if needed later):**
1. Create `species` table, populate with enum values
2. Add `species_id` to pets, backfill from species string
3. Update API to accept both `species` string and `species_id`
4. Deprecate species string field

**Trade-off:** Hard to add new species without code deployment, but acceptable for MVP scope.

---

### Decision 7: Single Photo per Pet (Not Gallery)

**Choice:** `photo_url` and `photo_key` as nullable string fields (0 or 1 photo).

**Alternatives Considered:**
- One-to-many `pet_photos` table
- Array of photo_urls (PostgreSQL array type)
- JSON field with photo metadata

**Rationale:**
- **MVP scope:** One photo sufficient for pet identification
- **Simplicity:** No joins, no complex UI for photo management
- **Database design:** Easier to enforce constraints, clearer schema
- **Photo replacement:** User uploads new photo, old one is deleted

**Future Migration Path:**
If multi-photo support needed:
1. Create `pet_photos` table (pet_id, photo_key, is_primary, sort_order)
2. Migrate existing `photo_key` to new table with `is_primary=true`
3. Keep `photo_url` as computed field (primary photo URL)
4. Update API to accept multiple photos

**Trade-off:** No photo gallery in MVP, but clean simple implementation.

---

### Decision 8: Separate Pet Services for Owner and Admin

**Choice:** Single `PetService` class with role-based filtering, not separate services.

**Alternatives Considered:**
- `OwnerPetService` and `AdminPetService` classes
- Separate routers for `/owner/pets` and `/admin/pets`

**Rationale:**
- **DRY principle:** Avoid duplicating business logic
- **Consistency:** Single source of truth for pet operations
- **RBAC in service layer:** Service methods accept `user_role` parameter
- **Testing:** One service to test with different role scenarios
- **Existing pattern:** Matches current `UserService` and `TenantService` patterns

**Implementation Pattern:**
```python
def list_pets(
    tenant_id: UUID,
    user_id: UUID,
    user_role: str,  # "admin" or "user"
    filters: PetFilters
) -> List[Pet]:
    query = db.query(Pet).filter(Pet.tenant_id == tenant_id)
    
    # RBAC filtering
    if user_role == "user":
        query = query.filter(Pet.owner_id == user_id)
    # Admin sees all pets in tenant
    
    return query.all()
```

**Trade-off:** Service methods have conditional logic based on role, but much cleaner than duplicating services.

---

### Decision 9: S3 Folder Structure by Tenant and Pet

**Choice:** `pets/{tenant_id}/{pet_id}/{timestamp}_{filename}.{ext}`

**Alternatives Considered:**
- Flat structure: `pets/{uuid}.jpg`
- By date: `pets/2026/03/14/{uuid}.jpg`
- By tenant only: `pets/{tenant_id}/{uuid}.jpg`

**Rationale:**
- **Tenant isolation:** Easy to migrate tenant's data or enforce quotas
- **Pet grouping:** If we add multi-photo later, all photos are together
- **Collision avoidance:** Timestamp + original filename prevents overwrites
- **Debugging:** Structure is human-readable in AWS Console
- **Lifecycle policies:** Can target entire tenant folder

**Example:**
```
pets/
  abc-clinic-uuid/
    pet-123-uuid/
      1678492800_max.jpg
      1678493000_max_updated.jpg
    pet-456-uuid/
      1678494000_bella.jpg
```

**Trade-off:** Deeper folder hierarchy, but much better organization and maintainability.

---

### Decision 10: Photo Upload Flow - Verify After Upload

**Choice:** Backend verifies S3 object exists when creating pet with `photo_key`.

**Alternatives Considered:**
- Trust frontend, don't verify
- Callback from S3 to backend after upload
- Frontend confirms upload, backend trusts it

**Rationale:**
- **Security:** Prevents malicious photo_key values pointing to non-existent/wrong objects
- **Data integrity:** Ensures pet.photo_url is always valid
- **Simple implementation:** Single S3 HeadObject API call
- **Error handling:** Clear error if upload failed: "Photo not found in storage"

**Flow:**
1. Frontend requests presigned URL → Backend returns URL + photo_key
2. Frontend uploads to S3 → S3 returns 204 No Content
3. Frontend sends photo_key to create pet → Backend calls HeadObject
4. If exists: Backend saves pet with photo_url; If not: Returns 400 error

**Edge Case - Orphaned Files:**
If frontend uploads but never creates pet, file is orphaned.
**Solution:** Background job (cron) scans for S3 objects not referenced in DB, tags as `orphaned=true`, lifecycle policy deletes after 90 days.

**Trade-off:** Extra S3 API call per pet creation with photo, but essential for data integrity.

## Risks / Trade-offs

### Risk 1: AWS S3 Cost Escalation
**Risk:** High-resolution photos with many pets could lead to unexpected S3 storage costs.

**Mitigation:**
- Enforce 5MB file size limit in presigned URL conditions
- Frontend validates file size before upload
- S3 lifecycle policies transition old/deleted photos to Glacier (90% cheaper)
- Monitor S3 usage with AWS CloudWatch alerts
- Document recommended photo sizes in UI (1200x1200px max)

---

### Risk 2: Orphaned S3 Files
**Risk:** User uploads photo but doesn't complete pet creation, leaving orphaned files in S3.

**Mitigation:**
- Background cleanup job runs daily, finds S3 objects not in DB
- Tag orphaned files, lifecycle policy deletes after 90 days
- Presigned URLs expire in 5 minutes (limits abandoned uploads)
- Log orphaned file rate to detect frontend issues

---

### Risk 3: Concurrent Adoption Conflict
**Risk:** Two admins try to adopt the same pet to different owners simultaneously.

**Mitigation:**
- Database transaction with `SELECT FOR UPDATE` on pet row
- Second request gets 409 Conflict response
- Frontend shows optimistic UI with refresh on conflict
- Audit log records both attempts for review

---

### Risk 4: Broken Foreign Keys After Soft Delete
**Risk:** Future modules (appointments, vaccines) reference pet_id - soft delete could break queries.

**Mitigation:**
- ALL queries on pets include `WHERE deleted_at IS NULL` by default
- SQLAlchemy default filter on Pet model
- Appointments/vaccines can still JOIN to deleted pets for history
- Admin "restore pet" feature to undelete if needed

---

### Risk 5: Large File Upload Failures
**Risk:** 5MB photo upload over slow connection fails, user loses progress.

**Mitigation:**
- Frontend shows upload progress bar
- Presigned POST supports resumable uploads (though complex)
- Clear error messages with retry button
- Consider image compression in frontend before upload (future enhancement)

---

### Risk 6: Database Migration Failure
**Risk:** Alembic migration fails in production, leaving schema inconsistent.

**Mitigation:**
- Test migration on production-like dataset locally
- Backup database before migration
- Migration is additive (new table, no existing table changes)
- Rollback plan: Drop pets table, revert migration
- Run migration during low-traffic window

---

## Open Questions

1. **Photo Signed URLs:** Should pet photos require authentication to view, or publicly accessible?
   - **Recommendation:** Public for MVP (pets aren't sensitive), add signed URLs if customer requests privacy

2. **S3 Bucket Per Environment:** Separate buckets for dev/staging/prod, or single bucket with folder prefixes?
   - **Recommendation:** Separate buckets (`world-pet-assets-dev`, `world-pet-assets-prod`) for clean isolation and cost tracking

3. **Weight Units:** Always kilograms, or support pounds with conversion?
   - **Recommendation:** Store as kilograms (decimal), frontend can display in user's preferred unit (future setting)

4. **Breed Validation:** Free text or validate against breed list per species?
   - **Recommendation:** Free text for MVP, add breed autocomplete in future enhancement

5. **Pet Age Display:** Calculate from birth_date or let it be approximate/unknown?
   - **Recommendation:** Calculate age if birth_date exists, show "Unknown" if NULL, format as "X years, Y months"

6. **Deletion by Owner:** Should pet owners be able to delete their own pets (soft delete)?
   - **Recommendation:** No - only admins can delete. Prevents accidental data loss by users.
