## Why

The application currently operates as a single-tenant system, limiting its ability to serve multiple organizations independently. As the platform grows, we need to support multiple tenants (organizations) with isolated data, allowing each organization to manage their own users, pets, and settings within the same application instance.

## What Changes

- **New**: Tenant model with database schema (id, name, slug, settings, created_at, updated_at)
- **New**: Tenant isolation at database level using foreign keys
- **New**: Tenant context for API requests (extract tenant from subdomain, header, or JWT)
- **New**: Tenant-aware queries - all data operations scoped to current tenant
- **New**: Tenant registration/enabled check middleware
- **New**: Frontend tenant switcher for users with access to multiple tenants

## Capabilities

### New Capabilities
- `tenant-management`: Create, read, update, delete tenants with admin controls
- `tenant-isolation`: Data isolation ensuring users can only access their tenant's data
- `tenant-context`: Tenant identification from requests (subdomain, header, JWT claim)
- `multi-tenant-users`: User association with tenants (users can belong to multiple tenants with different roles)

### Modified Capabilities
- (none - this is a foundational feature for future multi-tenant capabilities)

## Impact

- **Backend**: New `app/models/tenant.py`, migration for tenant table, updates to user model for tenant association
- **API**: All existing endpoints need to be made tenant-aware (or scoped to tenant)
- **Frontend**: New tenant switcher component, tenant context provider
- **Database**: New `tenant` table, add `tenant_id` foreign key to existing tables (user, pet, etc.)
- **Security**: Tenant isolation validation on all data operations
