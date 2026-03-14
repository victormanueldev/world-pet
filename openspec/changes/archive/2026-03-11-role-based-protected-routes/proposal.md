## Why

The application currently has basic route protection based on authentication, but lacks role-based access control for different user types (admin vs pet_owner). Users need distinct interfaces and capabilities: admins manage appointments, pets, vaccine catalogs, and system settings, while pet owners manage their own pets, view vaccination records, and handle their profiles. Without role-based routing, we cannot provide appropriate UX or prevent unauthorized access to admin functionality.

## What Changes

- Implement centralized route configuration with role-based access control
- Create separate route hierarchies for admin (`/admin/*`) and pet owner (`/owner/*`) capabilities
- Build navigation components that auto-generate menus based on user role
- Add `useCanAccess` and `useFilteredRoutes` hooks for role-based rendering
- Extend existing `ProtectedRoute` component to work with centralized route config
- Create placeholder page components for all admin and pet owner routes
- Implement grouped navigation sidebar with "Administration" and "My Account" sections

## Capabilities

### New Capabilities
- `role-based-routing`: Centralized route configuration system that defines routes with role requirements, auto-generates navigation, and provides utilities for role-based access control
- `admin-appointment-management`: Admin interface for managing all appointments across the system
- `admin-pet-management`: Admin interface for CRUD operations on all pets and assigning owners
- `admin-vaccine-catalog`: Admin interface for managing vaccine catalog and power options
- `admin-settings`: System-wide settings management for administrators
- `owner-appointment-access`: Pet owner interface for viewing and requesting appointments
- `owner-pet-management`: Pet owner interface for managing their own pets
- `owner-vaccine-registry`: Pet owner interface for viewing their pets' vaccination records
- `owner-profile-management`: Pet owner profile management interface

### Modified Capabilities
- `tenant-route-guards`: Extend to support role-based route protection using centralized route configuration

## Impact

- **Frontend Routes**: Complete restructure of protected routes under `/:slug/` to use role-based hierarchies
- **Navigation**: Sidebar component becomes auto-generated from route configuration
- **Components**: New page components for 8 distinct admin/owner routes plus shared dashboard
- **Hooks**: New composables for role checking and route filtering
- **Types**: New TypeScript types for route configuration, roles, and navigation
- **User Experience**: Clear separation between admin and pet owner interfaces with role-appropriate navigation
