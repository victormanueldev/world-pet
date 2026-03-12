## 1. Landing Page Auth Redirect

- [x] 1.1 Add auth check to Landing.tsx to redirect authenticated users to tenant dashboard

## 2. PublicRoute Auth Redirect

- [x] 2.1 Update PublicRoute to get user's first accessible tenant and redirect to `/{slug}/`

## 3. ProtectedRoute Slug Validation

- [x] 3.1 Update ProtectedRoute to redirect to tenant dashboard if no slug in URL
- [x] 3.2 Update ProtectedRoute to redirect to valid tenant if slug doesn't match user's tenants

## 4. Login Page Post-Login Redirect

- [x] 4.1 Ensure Login.tsx redirects to `/{tenantSlug}/` after successful login (not `/`)

## 5. Testing

- [x] 5.1 Run frontend tests to verify no regressions
- [x] 5.2 Verify manually that authenticated users are redirected correctly
