## Why

Pet management is the foundation of the World Pet platform. Currently, the system has authentication and multi-tenancy infrastructure but lacks the core business entities needed for veterinary clinic operations. Without a pets module, clinics cannot manage their primary asset (pets) or support the adoption workflow that distinguishes rescue/shelter operations from traditional clinics.

## What Changes

- Add complete Pet CRUD functionality with multi-tenant isolation
- Support optional owner assignment to enable pre-adoption workflow (clinic-owned pets)
- Implement production-ready AWS S3 photo storage
- Create role-based access control (owners see their pets, admins see all clinic pets)
- Implement soft delete pattern to preserve historical data
- Add pet status tracking (available_for_adoption, owned, inactive)
- Build frontend UI for both pet owners and clinic administrators
- Enable adoption workflow where admins can assign pets to owners

## Capabilities

### New Capabilities

- `pet-management`: Complete CRUD operations for pets including creation, listing, viewing, updating, and soft deletion with multi-tenant isolation and role-based access control
- `pet-photo-storage`: Secure photo upload and storage using AWS S3 with presigned URLs
- `pet-adoption`: Admin workflow to assign ownership of clinic-owned pets to registered users, tracking adoption dates and status transitions

### Modified Capabilities

<!-- No existing capabilities are being modified - this is a new module -->

## Impact

**Backend Changes:**
- New `pets` database table with tenant isolation and soft delete
- New database migration for pets schema
- New Pet SQLAlchemy model with relationships to User and Tenant
- New S3Service for AWS integration (presigned URLs, object management)
- New PetService for business logic (CRUD, RBAC, adoption workflow)
- New API endpoints: `/v1/pets/*` (8 endpoints total)
- AWS dependencies: boto3 for S3 client

**Frontend Changes:**
- New pet services API client (`src/services/pets.ts`)
- New pet components: PetForm, PetCard, PetList, PhotoUpload, PetFilters
- New owner routes: `/owner/pets`, `/owner/pets/new`, `/owner/pets/:id`, `/owner/pets/:id/edit`
- New admin routes: `/admin/pets`, `/admin/pets/new`, `/admin/pets/:id`
- Pet-related TypeScript types and enums
- Update route configuration to include pet pages
- Update sidebar navigation for both roles

**Infrastructure:**
- AWS S3 bucket for asset storage (per environment)
- IAM roles/policies for backend S3 access
- S3 lifecycle policies for deleted content archival

**No Breaking Changes**
