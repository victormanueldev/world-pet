/**
 * PublicRoute
 *
 * Wrapper component for public routes like login/register.
 * Redirects authenticated users to the dashboard.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthLoadingSkeleton } from './AuthLoadingSkeleton';

interface PublicRouteProps {
    children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Show loading skeleton while checking auth state
    if (isLoading) {
        return <AuthLoadingSkeleton />;
    }

    // Redirect to tenant dashboard if already authenticated
    if (isAuthenticated) {
        if (user?.tenants && user.tenants.length > 0) {
            const primaryTenant = user.tenants[0];
            return <Navigate to={`/${primaryTenant.slug}/`} replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
