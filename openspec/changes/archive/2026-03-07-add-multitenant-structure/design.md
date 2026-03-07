## Context

The World Pet application is currently a single-tenant system. We need to transform it into a multi-tenant architecture that can serve multiple organizations (tenants) from a single application instance. Each tenant should have isolated data, their own users, and configurable settings. This is a foundational change that will enable the platform to scale to serve different pet-related businesses or organizations.

## Goals / Non-Goals

**Goals:**
- Implement tenant model with isolation at database level
- Create tenant context extraction from requests (subdomain, header, JWT)
- Enable users to belong to multiple tenants with per-tenant roles
- Ensure all data queries are automatically scoped to the current tenant
- Add tenant switcher UI for frontend

**Non-Goals:**
- Billing/subscription management per tenant
- Tenant-specific theming/branding (beyond basic settings)
- Cross-tenant data sharing or federation
- Multi-region tenant placement
- White-labeling capabilities

## Decisions

### 1. Tenant Isolation Strategy: Foreign Key Isolation
**Decision**: Use foreign key-based tenant isolation (shared database, separate schemas)
**Rationale**: Simplest approach for PostgreSQL, allows cross-tenant queries for admin purposes, easier migrations
**Alternative**: Separate databases per tenant - more secure but operational complexity, harder to query across tenants

### 2. Tenant Identification: JWT Claim Primary
**Decision**: Primary tenant identification via JWT `tenant_id` claim, with header fallback for API testing
**Rationale**: JWT is already being implemented, tenant claim provides stateless tenant ID, header useful for debugging
**Alternative**: Subdomain-based - requires DNS configuration, harder to test locally

### 3. User-Tenant Association: Many-to-Many
**Decision**: Users can belong to multiple tenants, each with a role
**Rationale**: Allows users to work across organizations, common pattern in SaaS
**Alternative**: One user per tenant - simpler but limits cross-organization access

### 4. Default Tenant: Auto-Create on First Login
**Decision**: Create default tenant automatically when first user registers
**Rationale**: Simplifies onboarding for single-tenant deployments, no manual setup required
**Alternative**: Pre-create tenant - requires admin setup before use

### 5. Query Scoping: Base Repository Pattern
**Decision**: Implement tenant scoping at the repository/service layer
**Rationale**: Explicit is better than implicit, easier to audit, works with existing patterns
**Alternative**: Global filter/middleware - transparent but harder to debug, may accidentally leak data

## Risks / Trade-offs

- **[Risk] Data leakage**: Queries might accidentally return cross-tenant data
  → **Mitigation**: Add tenant_id to all data models, implement repository base class that always includes tenant_id filter, add integration tests that verify isolation

- **[Risk] Migration complexity**: Adding tenant_id to existing tables requires backfilling
  → **Mitigation**: Create migration that adds tenant_id with NOT NULL default, backfill with default tenant ID, then add FK constraint

- **[Risk] Performance**: Additional joins/where clauses on every query
  → **Mitigation**: Add database index on (tenant_id, table_id), use composite indexes for common query patterns

- **[Risk] User onboarding**: Existing users need tenant association
  → **Mitigation**: Create default tenant on first migration, associate all existing users with that tenant

- **[Risk] Testing**: Harder to test tenant isolation
  → **Mitigation**: Add database fixtures with multiple tenants, write integration tests that verify cross-tenant access is blocked

## Migration Plan

1. Create tenant table with default tenant
2. Add tenant_id column to user table with foreign key
3. Backfill existing users with default tenant
4. Update user service to require tenant context
5. Deploy backend with tenant isolation
6. Add frontend tenant context and switcher
7. Deploy frontend

**Rollback**: Reverse migrations to drop tenant_id columns, keep tenant table (can be used later)

## Open Questions

- Should we support tenant-specific pet types/categories?
- How to handle tenant deletion (soft delete, cascade, reassign)?
- Should tenants have their own API keys for external integration?
