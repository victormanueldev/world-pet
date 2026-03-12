/**
 * useFilteredRoutes hook
 *
 * Filters route groups and routes based on the current user's role.
 * Used for auto-generating role-appropriate navigation menus.
 */
import { useMemo } from 'react';
import { useTenant } from '@/context/TenantContext';
import { routeGroups } from '@/routes/config';
import type { RouteGroup, RouteRole } from '@/routes/types';

/**
 * Get route groups filtered by current user's role
 *
 * @returns Array of route groups that the current user can access
 *
 * @example
 * ```tsx
 * const filteredRoutes = useFilteredRoutes();
 * return filteredRoutes.map(group => (
 *   <RouteGroup key={group.label} group={group} />
 * ));
 * ```
 */
export function useFilteredRoutes(): RouteGroup[] {
    const { tenant } = useTenant();
    const userRole = tenant?.role as RouteRole | undefined;

    return useMemo(() => {
        if (!userRole) {
            return [];
        }

        return routeGroups
            .filter((group) => group.roles.includes(userRole))
            .map((group) => ({
                ...group,
                routes: group.routes.filter((route) =>
                    route.roles.includes(userRole)
                ),
            }))
            .filter((group) => group.routes.length > 0);
    }, [userRole]);
}
