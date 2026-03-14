/**
 * Route configuration types for role-based access control
 */
import type { ComponentType } from 'react';

/**
 * User roles supported in the application
 * Must match backend roles: 'admin' and 'user'
 */
export type RouteRole = 'admin' | 'user';

/**
 * Individual route definition
 */
export interface RouteDefinition {
    /** Route path (relative to tenant slug) */
    path: string;
    /** Roles allowed to access this route */
    roles: RouteRole[];
    /** React component to render for this route */
    component: ComponentType;
    /** Display label for navigation */
    label: string;
    /** Optional icon identifier for navigation */
    icon?: string;
}

/**
 * Route group for organizing related routes in navigation
 */
export interface RouteGroup {
    /** Group label (e.g., "Administration", "My Account") */
    label: string;
    /** Roles that can see this group */
    roles: RouteRole[];
    /** Routes within this group */
    routes: RouteDefinition[];
}
