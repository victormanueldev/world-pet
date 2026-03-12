## Context

The World Pet platform is a multi-tenant system where each veterinary clinic is a tenant. Currently, tenant context is determined through:
1. JWT token claims (tenant_id embedded at login)
2. X-Tenant-ID header (for tenant switching)

This works for authenticated users but provides no discoverable URL for pet owners to find and access their specific clinic. Pet owners need a shareable URL like `worldpet.app/happypaws` to register their pets, view appointments, and access their clinic's services.

**Current Constraints:**
- Tenant model already has `slug` field for unique tenant identifiers
- Authentication system uses JWT with tenant_id claims
- Frontend uses React Router with flat route structure (`/login`, `/register`, `/*`)

**Stakeholders:**
- Pet owners (external users registering pets)
- Clinic staff (admin users managing tenants)
- Platform operators (managing multi-tenant infrastructure)

## Goals / Non-Goals

**Goals:**
1. Enable URL-based tenant access via path (e.g., `/happypaws/dashboard`)
2. Allow pet owner registration at tenant-specific URLs without explicitly specifying tenant_id
3. Provide public tenant information (clinic name) without authentication
4. Redirect authenticated users to their tenant path after login
5. Validate tenant access: ensure JWT tenant matches URL slug

**Non-Goals:**
- Subdomain-based tenant isolation (e.g., `happypaws.worldpet.app`)
- Custom domain support (e.g., `happypaws.com` → `worldpet.app/happypaws`)
- Multi-tenant dashboards where users belong to multiple clinics (out of scope - users select one tenant at login)
- White-labeling beyond basic tenant name/branding

## Decisions

### Decision 1: URL Path vs. Subdomain for Tenant Isolation

**Decision:** Use URL path (`/happypaws/*`) instead of subdomain (`happypaws.worldpet.app`)

**Rationale:**
- Simpler infrastructure (no wildcard DNS or SSL certificates needed)
- Easier frontend routing (single React Router configuration)
- Can migrate to subdomain later as premium feature
- Cookie/security handling is simpler with single domain

**Alternatives Considered:**
- Subdomain: More professional branding, easier custom domain migration later, but requires wildcard SSL/DNS
- Path: Simpler, faster to implement, meets current requirements

### Decision 2: Tenant Context Priority

**Decision:** JWT tenant_id takes precedence over URL path for authenticated requests

**Rationale:**
- Existing JWT-based auth already works reliably
- URL path serves as navigation/bookmarking mechanism
- Prevents tenant confusion: if JWT says "tenant_id: 1" but URL is `/happypaws`, user sees redirect prompt
- Simpler backend: existing auth dependencies remain unchanged

**Request Flow:**
```
1. User visits /happypaws/pets
2. Frontend extracts slug = "happypaws"
3. Frontend checks: JWT tenant_id → tenant with slug "happypaws"?
4. If match: proceed with request (JWT provides tenant context to API)
5. If mismatch: redirect to correct tenant path or show tenant switcher
```

### Decision 3: Public Tenant Info Endpoint

**Decision:** Create `GET /api/v1/tenants/{slug}` as public endpoint

**Rationale:**
- Allows frontend to fetch clinic name for display on login/register pages at tenant URL
- No sensitive information exposed (just name, slug)
- Enables tenant discovery without authentication

**Data Exposed:**
- Tenant name (for display)
- Tenant slug (for verification)
- (Future: logo URL, primary color for branding)

### Decision 4: Tenant-Specific Registration

**Decision:** Create `POST /api/v1/tenants/{slug}/register` endpoint

**Rationale:**
- Pet owners register at their clinic's URL
- Tenant is implicit from URL path, not from request body
- Simplifies registration form (no tenant selection needed)

**Alternative:** Keep existing `/auth/register` with implicit tenant from context
- Rejected: Would require changes to auth flow; explicit endpoint is cleaner

### Decision 5: Frontend Routing Structure

**Decision:** Use nested routing with slug parameter

```
/                      → Landing page (marketing)
/login                 → Root login (tenant selection if multi-tenant)
/register              → Root register (tenant selection or "find your clinic")
/:slug/login           → Tenant-specific login (pre-fills tenant)
/:slug/register        → Tenant-specific registration (tenant implicit)
/:slug/*               → Protected tenant routes (dashboard, pets, etc.)
```

**Rationale:**
- Clear separation between root (platform) and tenant (clinic) spaces
- URL is bookmarkable and shareable
- React Router's path params handle elegantly

## Risks / Trade-offs

### Risk: User Mismatch Between URL and JWT

**Scenario:** User has JWT for "tenant_id: 1" (City Vets) but visits `/happypaws/pets`

**Mitigation:** 
- Frontend detects mismatch and redirects to correct path OR shows "switch clinic?" prompt
- Seamless for single-tenant users (always redirect to their tenant)
- Multi-tenant users get explicit choice

### Risk: Login Redirect Loop

**Scenario:** User with multiple tenants logs in, gets redirected to `/tenantA/dashboard`, but wants `/tenantB`

**Mitigation:**
- Multi-tenant login already returns available_tenants list
- After login, show tenant selector if user has multiple tenants
- User picks tenant → redirect to that tenant's path

### Risk: SEO / Indexing

**Scenario:** Search engines index tenant-specific pages incorrectly

**Mitigation:**
- Use canonical URLs
- Add robots.txt rules per tenant if needed
- Frontend: noindex header for tenant pages initially

### Trade-off: Simplicity vs. Flexibility

**Trade-off:** Path-based is simpler than subdomain but less "white-label"

**Acceptance:** Current requirements don't demand full white-label. Path provides 80% of value with 20% complexity. Subdomain can be added later.

## Migration Plan

**Phase 1: Backend Changes**
1. Add `tenant_path_resolution` dependency to extract and validate tenant from URL slug
2. Create public `GET /tenants/{slug}` endpoint
3. Create `POST /tenants/{slug}/register` endpoint

**Phase 2: Frontend Routing**
1. Update React Router to support `/:slug/*` pattern
2. Create Landing page component
3. Update PublicRoute and ProtectedRoute to handle slug context

**Phase 3: Tenant Sync**
1. Add TenantProvider to sync URL slug with JWT tenant
2. Add redirect logic for mismatched tenant
3. Update login flow to redirect to tenant path

**Rollback:** Since this is additive, rollback is simple:
- Revert frontend routing changes
- Remove new endpoints
- Existing JWT/header auth continues to work

## Open Questions

1. **Landing Page Content**: What should the root `/` landing page contain beyond "Login" and "Register" buttons?
   - Suggestion: Basic marketing copy + feature highlights + "For Clinics" admin link

2. **Tenant Branding**: How much branding per tenant beyond name?
   - Decision: Start with just name display. Logo/color can be phase 2.

3. **Admin Access**: Should clinic admins also access via `/clinicSlug/admin` or keep separate admin portal?
   - Decision: Keep simple - admin access via same `/clinicSlug/*` routes, role-based access control handles permissions
