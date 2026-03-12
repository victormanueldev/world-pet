/**
 * ProtectedRoute
 *
 * Wrapper component that requires authentication to access children.
 * Validates tenant access based on URL slug.
 * Redirects to login if user is not authenticated.
 */
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/context/TenantContext';
import { AuthLoadingSkeleton } from './AuthLoadingSkeleton';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Optional: Required role(s) to access this route */
    requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { tenant, isLoading: tenantLoading, error: tenantError } = useTenant();
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();

    // Show loading skeleton while checking auth state
    if (isLoading || tenantLoading) {
        return <AuthLoadingSkeleton />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If there's a slug in the URL, validate tenant access
    if (slug && tenantError) {
        // User doesn't have access to this tenant - redirect to their primary tenant
        if (user?.tenants && user.tenants.length > 0) {
            const primaryTenant = user.tenants[0];
            return <Navigate to={`/${primaryTenant.slug}/`} replace />;
        }
        // No tenants - redirect to root
        return <Navigate to="/" replace />;
    }

    // Check role-based access if required
    if (requiredRoles && requiredRoles.length > 0 && user && tenant) {
        const hasRequiredRole = requiredRoles.includes(tenant.role);
        if (!hasRequiredRole) {
            // User doesn't have required role - redirect to dashboard
            return <Navigate to={`/${slug}/`} replace />;
        }
    }

    return <>{children}</>;
}
