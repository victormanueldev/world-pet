## Context

The frontend currently has a basic `ProtectedRoute` component that checks authentication and tenant access, with rudimentary support for role-based access via an optional `requiredRoles` prop. However, routes are hardcoded in `App.tsx`, navigation is manually maintained in `Sidebar.tsx`, and there's no centralized system for managing role-based route access.

The backend already implements role-based access control using the `require_role()` dependency, which validates user roles per tenant from the `user_tenant` table. The frontend needs to mirror this capability for UX purposes (hiding unavailable routes, redirecting unauthorized access) while the backend continues to be the source of truth for security.

Current roles: `admin` and `pet_owner` (stored in `tenant.role` in frontend context).

## Goals / Non-Goals

**Goals:**
- Create a single source of truth for route definitions with role requirements
- Auto-generate navigation menus from route configuration (grouped by role sections)
- Provide reusable hooks (`useCanAccess`, `useFilteredRoutes`) for role-based rendering
- Implement distinct route hierarchies: `/admin/*` for admins, `/owner/*` for pet owners
- Maintain type safety across route configuration and navigation
- Keep the backend as the security source of truth (frontend is UX-only)

**Non-Goals:**
- Implementing actual security enforcement in frontend (backend already handles this)
- Building the full functionality of admin/owner pages (placeholder components only)
- Supporting dynamic role assignment or role hierarchies (fixed: admin, pet_owner)
- Migrating existing dashboard functionality (dashboard remains shared between roles)
- Supporting more than two roles in this iteration

## Decisions

### 1. Centralized Route Configuration

**Decision:** Create `frontend/src/routes/config.ts` with route groups containing route definitions.

**Rationale:** 
- Single source of truth prevents drift between routes, navigation, and role checks
- Type-safe configuration catches errors at compile time
- Easy to extend with new routes without touching multiple files
- Enables auto-generation of navigation, breadcrumbs, and access control

**Alternative considered:** Keep routes in `App.tsx` and manually sync with navigation
- Rejected: Error-prone, duplication, hard to maintain as routes grow

**Structure:**
```typescript
type RouteRole = 'admin' | 'pet_owner';

type RouteDefinition = {
  path: string;
  roles: RouteRole[];
  component: React.ComponentType;
  label: string;
  icon?: string;
}

type RouteGroup = {
  label: string;
  roles: RouteRole[];
  routes: RouteDefinition[];
}
```

### 2. Route Hierarchy Pattern

**Decision:** Use separate path prefixes for role-specific routes:
- Admin routes: `/:slug/admin/*`
- Pet owner routes: `/:slug/owner/*`
- Shared routes: `/:slug/` (dashboard)

**Rationale:**
- Clear separation makes role boundaries obvious
- Easier to reason about and test (no role branching inside components)
- Aligns with backend patterns where endpoints are often separated by role
- URL structure self-documents access requirements

**Alternative considered:** Same routes with role-based view switching
- Rejected: Component complexity increases, harder to test, confusing UX (URL doesn't indicate access level)

### 3. Navigation Auto-Generation

**Decision:** Build navigation from route configuration using `useFilteredRoutes()` hook that filters by current user role.

**Rationale:**
- Navigation always stays in sync with actual route definitions
- No manual updates needed when adding routes
- Role filtering happens in one place (DRY)

**Structure:**
- Sidebar component consumes `useFilteredRoutes()`
- Renders route groups as sections ("Administration", "My Account")
- Each group shows only if user role matches group roles

### 4. Component-Level Access Control

**Decision:** Provide `useCanAccess(roles: RouteRole[]): boolean` hook for conditional rendering within components.

**Rationale:**
- Consistent API for role checking throughout the app
- Encapsulates role logic (single source: `tenant.role`)
- Enables hiding/showing UI elements beyond routes (buttons, sections, etc.)

**Example usage:**
```typescript
{useCanAccess(['admin']) && <AdminOnlyButton />}
```

### 5. Placeholder Pages Strategy

**Decision:** Create minimal placeholder components for all 8 admin/owner routes. Each shows a page header and "Coming soon" message.

**Rationale:**
- Establishes routing structure without blocking on full implementations
- Allows navigation testing end-to-end
- Teams can build out pages independently after routing is in place

**Components to create:**
- `AdminAppointments`, `AdminPets`, `AdminVaccines`, `AdminSettings`
- `OwnerAppointments`, `OwnerPets`, `OwnerVaccines`, `OwnerProfile`

### 6. Dashboard Handling

**Decision:** Keep dashboard at `/:slug/` (root of protected area), accessible to both roles. Use `useCanAccess` to show role-specific widgets inside the shared component.

**Rationale:**
- Both roles need a landing page after login
- Shared dashboard can surface common info (welcome banner, quick stats)
- Role-specific widgets provide tailored experience without route duplication

**Alternative considered:** Separate dashboards per role
- Rejected: Duplication, harder to share common dashboard components, URLs become ambiguous

### 7. TypeScript Strategy

**Decision:** Define `RouteRole` as a string union type, export all route types from `routes/types.ts`, use strict typing in configuration and hooks.

**Rationale:**
- Type safety prevents typos in role names
- Auto-completion in IDEs when specifying roles
- Compile-time errors if role configuration is invalid

## Risks / Trade-offs

**[Risk: Route configuration becomes bloated]**
→ **Mitigation:** Keep configuration focused on routing only. Move page-specific metadata (descriptions, help text) to page components. Consider splitting config if it exceeds 200 lines.

**[Risk: Frontend role checks can be bypassed]**
→ **Mitigation:** Document clearly that frontend checks are UX-only. Backend must enforce all security with `require_role()`. Frontend just hides UI and redirects for better UX.

**[Risk: Navigation performance with many routes]**
→ **Mitigation:** Route filtering is memoized in hook. Only recalculates when user/tenant changes. Unlikely to be an issue with <20 routes.

**[Trade-off: Placeholder pages vs waiting for full implementations]**
→ **Decision:** Use placeholders to unblock routing work. Teams can iterate on individual pages without blocking the overall structure.

**[Trade-off: Centralized config vs co-located with pages]**
→ **Decision:** Choose centralized for easier overview and navigation generation. Individual pages can still have their own route metadata if needed.

## Migration Plan

1. Create route configuration and types
2. Build hooks (`useCanAccess`, `useFilteredRoutes`)
3. Create placeholder page components
4. Update `App.tsx` to use route configuration
5. Refactor `Sidebar.tsx` to auto-generate from routes
6. Test role-based access and navigation
7. Deploy (no backend changes needed)

**Rollback strategy:** 
- Route configuration is additive (doesn't break existing routes)
- If critical issue found, revert `App.tsx` and `Sidebar.tsx` to previous hardcoded versions
- No data migration or backend changes required

## Open Questions

None - design is ready for implementation.
