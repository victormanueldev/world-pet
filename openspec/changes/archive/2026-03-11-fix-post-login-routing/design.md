## Context

The multi-tenant path isolation was recently implemented to support tenant-specific URLs like `/happypaws/dashboard`. However, there are gaps in the routing guards that allow authenticated users to access routes without the required tenant slug.

Current issues:
1. Landing page (`/`) shows marketing content to authenticated users instead of redirecting to their tenant dashboard
2. Root `/login` and `/register` redirect authenticated users to `/` instead of their tenant dashboard
3. No explicit protection against navigating to root-level protected routes (e.g., hypothetical `/dashboard`)

## Goals / Non-Goals

**Goals:**
- Redirect authenticated users from landing page to their tenant dashboard
- Fix PublicRoute to redirect authenticated users to their tenant dashboard with proper slug
- Ensure all protected routes require valid tenant slug in URL
- Validate that the tenant slug in URL matches one of the user's accessible tenants

**Non-Goals:**
- Adding new protected routes (dashboard, pets, etc.) - just ensuring existing routes work correctly
- Backend changes - this is purely frontend routing
- Changing the tenant context validation logic in TenantContext (it's already correct)

## Decisions

### Decision 1: Landing page redirect approach
**Chosen:** Modify Landing.tsx to check auth state and redirect to tenant dashboard
**Rationale:** Simplest solution - just add auth check at the component level. No routing changes needed.

### Decision 2: PublicRoute redirect target
**Chosen:** Get user's first accessible tenant and redirect to `/{tenantSlug}/`
**Rationale:** The user object already contains the list of accessible tenants with slugs. Use the first tenant as the default redirect target.

### Decision 3: ProtectedRoute behavior for missing/invalid slug
**Chosen:** If no slug in URL or slug doesn't match user's tenants, redirect to first accessible tenant
**Rationale:** Matches the existing TenantContext behavior - provides smooth user experience by auto-redirecting to valid tenant.

## Risks / Trade-offs

- **Risk:** User has no tenants after login
  - **Mitigation:** Redirect to `/` (landing) if user has no tenants, which will show login option

- **Risk:** Race condition between auth load and component render
  - **Mitigation:** Use AuthLoadingSkeleton while auth is loading

- **Risk:** Multiple tenants - which one to redirect to?
  - **Mitigation:** Use the first tenant in the list (primary/default tenant)
