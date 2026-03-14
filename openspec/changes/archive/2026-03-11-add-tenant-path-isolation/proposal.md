## Why

Multi-tenant pet management platform needs a way for pet owners to access their specific clinic directly via URL. Currently, tenants are identified via JWT claims or X-Tenant-ID header, which works for authenticated API access but doesn't provide a discoverable URL for pet owners to register or access their clinic. Adding path-based tenant isolation enables pet owners to visit their clinic's unique URL (e.g., `worldpet.app/happypaws`) to register pets, book appointments, and access their dashboard.

## What Changes

- **New**: URL-based tenant resolution - extract tenant slug from URL path and resolve to tenant ID
- **New**: Tenant-specific registration endpoint - `POST /tenants/{slug}/register` that implicitly uses tenant from URL
- **New**: Tenant info public endpoint - `GET /tenants/{slug}` returns clinic name/branding info (no auth required)
- **New**: Frontend routing changes to support `/:slug/*` pattern for tenant-scoped pages
- **New**: Root domain landing page at `/` with marketing content and auth links
- **New**: Frontend tenant sync - validate that JWT tenant matches URL slug, redirect if mismatch
- **Modified**: Login flow to redirect authenticated users to their tenant path after login

## Capabilities

### New Capabilities

- `tenant-path-resolution`: Resolve tenant context from URL path (slug) for both authenticated and public routes
- `tenant-public-info`: Expose public tenant information (name, branding) via API without authentication
- `tenant-registration`: Allow pet owner registration at tenant-specific URL without explicit tenant_id

### Modified Capabilities

- `tenant-context`: Add URL path as a source of tenant identification alongside existing JWT claims and X-Tenant-ID header
- `multi-tenant-users`: After login, redirect users to their tenant path instead of generic dashboard

## Impact

- **Backend**: New dependencies for slug-based tenant resolution, new public tenant endpoints
- **Frontend**: Routing changes to support tenant paths, new landing page, tenant synchronization logic
- **Database**: No schema changes required - Tenant model already has `slug` field
- **Breaking**: None - this is additive functionality that doesn't change existing behavior
