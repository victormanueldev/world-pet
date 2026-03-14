/**
 * useCanAccess hook
 *
 * Determines if the current user has one of the required roles.
 * Used for conditional rendering of role-specific UI elements.
 */
import { useTenant } from '@/context/TenantContext';
import type { RouteRole } from '@/routes/types';

/**
 * Check if current user has access based on required roles
 *
 * @param requiredRoles - Array of roles that are allowed access
 * @returns true if user has one of the required roles, false otherwise
 *
 * @example
 * ```tsx
 * const canAccessAdmin = useCanAccess(['admin']);
 * return canAccessAdmin ? <AdminPanel /> : null;
 * ```
 */
export function useCanAccess(requiredRoles: RouteRole[]): boolean {
    const { tenant } = useTenant();

    if (!tenant || !tenant.role) {
        return false;
    }

    return requiredRoles.includes(tenant.role as RouteRole);
}
