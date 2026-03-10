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
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading skeleton while checking auth state
    if (isLoading) {
        return <AuthLoadingSkeleton />;
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        // Check if there's a saved location to redirect to
        const from = (location.state as { from?: Location })?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
}
