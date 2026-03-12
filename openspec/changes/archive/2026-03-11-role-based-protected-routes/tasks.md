## 1. Route Configuration Foundation

- [x] 1.1 Create `frontend/src/routes/types.ts` with RouteRole, RouteDefinition, and RouteGroup types
- [x] 1.2 Create `frontend/src/routes/config.ts` with centralized route configuration
- [x] 1.3 Define route groups for Shared, Administration, and My Account sections
- [x] 1.4 Configure all route paths, roles, labels, and icons in route config

## 2. Role-Based Access Hooks

- [x] 2.1 Create `frontend/src/hooks/useCanAccess.ts` hook that checks current user role against required roles
- [x] 2.2 Create `frontend/src/hooks/useFilteredRoutes.ts` hook that filters route groups by user role
- [x] 2.3 Add unit tests for `useCanAccess` hook covering admin, pet_owner, and multiple roles scenarios
- [x] 2.4 Add unit tests for `useFilteredRoutes` hook covering role filtering logic

## 3. Admin Page Components

- [x] 3.1 Create `frontend/src/pages/admin/AdminAppointments.tsx` placeholder component
- [x] 3.2 Create `frontend/src/pages/admin/AdminPets.tsx` placeholder component
- [x] 3.3 Create `frontend/src/pages/admin/AdminVaccines.tsx` placeholder component
- [x] 3.4 Create `frontend/src/pages/admin/AdminSettings.tsx` placeholder component
- [x] 3.5 Create `frontend/src/pages/admin/index.ts` barrel export for admin pages

## 4. Owner Page Components

- [x] 4.1 Create `frontend/src/pages/owner/OwnerAppointments.tsx` placeholder component
- [x] 4.2 Create `frontend/src/pages/owner/OwnerPets.tsx` placeholder component
- [x] 4.3 Create `frontend/src/pages/owner/OwnerVaccines.tsx` placeholder component
- [x] 4.4 Create `frontend/src/pages/owner/OwnerProfile.tsx` placeholder component
- [x] 4.5 Create `frontend/src/pages/owner/index.ts` barrel export for owner pages

## 5. Route Integration

- [x] 5.1 Update `frontend/src/App.tsx` to import route configuration
- [x] 5.2 Add nested route structure for `/:slug/admin/*` with ProtectedRoute requiring admin role
- [x] 5.3 Add nested route structure for `/:slug/owner/*` with ProtectedRoute requiring pet_owner role
- [x] 5.4 Wire up all admin page components to their routes
- [x] 5.5 Wire up all owner page components to their routes

## 6. Navigation Auto-Generation

- [x] 6.1 Update `frontend/src/components/layout/Sidebar.tsx` to use useFilteredRoutes hook
- [x] 6.2 Implement route group rendering with section labels (Administration, My Account)
- [x] 6.3 Implement navigation item rendering from filtered routes with icons and labels
- [x] 6.4 Add active route highlighting based on current path
- [x] 6.5 Test navigation visibility for admin users (shows Administration section)
- [x] 6.6 Test navigation visibility for pet_owner users (shows My Account section)

## 7. Dashboard Role-Specific Widgets

- [x] 7.1 Update `frontend/src/pages/Dashboard.tsx` to use useCanAccess for conditional rendering
- [x] 7.2 Add role-specific content placeholders for admin users
- [x] 7.3 Add role-specific content placeholders for pet_owner users

## 8. Testing and Validation

- [x] 8.1 Test admin user can access all admin routes
- [x] 8.2 Test admin user is redirected when accessing owner routes
- [x] 8.3 Test pet_owner user can access all owner routes
- [x] 8.4 Test pet_owner user is redirected when accessing admin routes
- [x] 8.5 Test shared dashboard is accessible to both roles
- [x] 8.6 Test navigation renders correct sections for each role
- [x] 8.7 Verify TypeScript compilation passes with strict mode
- [x] 8.8 Run existing frontend tests to ensure no regressions
