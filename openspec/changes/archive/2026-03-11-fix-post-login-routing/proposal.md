## Why

Currently, after a pet owner logs in, the system allows navigation to protected routes like `/dashboard`, `/pets`, etc. without requiring the tenant `:slug` in the URL (e.g., `/happypaws/dashboard` vs `/dashboard`). This breaks the multi-tenant path isolation that was recently implemented and creates a security concern where users could potentially access the wrong tenant's data.

## What Changes

- Update frontend routing to enforce tenant slug prefix on all protected routes
- Redirect logged-in users away from `/login` and `/register` to their tenant's dashboard
- Add route guards that validate tenant context before allowing access to protected pages
- Update ProtectedRoute component to require valid tenant slug in URL

## Capabilities

### New Capabilities

- `tenant-route-guards`: Enforce tenant slug prefix on all protected routes with automatic redirects

### Modified Capabilities

- `tenant-context`: Modify to validate slug matches logged-in user's tenant
- `multi-tenant-users`: Modify post-login routing to include tenant slug in redirect

## Impact

- Frontend: Updated routing configuration, ProtectedRoute component, Login page redirect logic
- Affects: App.tsx routing, ProtectedRoute.tsx, Login.tsx, TenantContext.tsx
