/**
 * ProtectedRoute
 *
 * Wrapper component that requires authentication to access children.
 * Redirects to login if user is not authenticated.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthLoadingSkeleton } from './AuthLoadingSkeleton';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Optional: Required role(s) to access this route */
    requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Show loading skeleton while checking auth state
    if (isLoading) {
        return <AuthLoadingSkeleton />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if required
    if (requiredRoles && requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (!hasRequiredRole) {
            // User doesn't have required role - redirect to dashboard
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
}
