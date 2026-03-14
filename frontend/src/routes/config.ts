/**
 * Centralized route configuration with role-based access control
 */
import type { RouteGroup } from './types';
import { Dashboard } from '@/pages/Dashboard';
import {
    AdminAppointments,
    AdminPets,
    AdminVaccines,
    AdminSettings,
} from '@/pages/admin';
import {
    OwnerAppointments,
    OwnerPets,
    OwnerVaccines,
    OwnerProfile,
} from '@/pages/owner';

/**
 * Route groups organized by role and purpose
 * This configuration drives both routing and navigation generation
 */
export const routeGroups: RouteGroup[] = [
    // Shared routes accessible to all authenticated users
    {
        label: 'Shared',
        roles: ['admin', 'user'],
        routes: [
            {
                path: '/',
                roles: ['admin', 'user'],
                component: Dashboard,
                label: 'Dashboard',
                icon: 'home',
            },
        ],
    },

    // Administration routes - admin only
    {
        label: 'Administration',
        roles: ['admin'],
        routes: [
            {
                path: '/admin/appointments',
                roles: ['admin'],
                component: AdminAppointments,
                label: 'Appointments',
                icon: 'calendar',
            },
            {
                path: '/admin/pets',
                roles: ['admin'],
                component: AdminPets,
                label: 'Pets',
                icon: 'pets',
            },
            {
                path: '/admin/vaccines',
                roles: ['admin'],
                component: AdminVaccines,
                label: 'Vaccines',
                icon: 'syringe',
            },
            {
                path: '/admin/settings',
                roles: ['admin'],
                component: AdminSettings,
                label: 'Settings',
                icon: 'settings',
            },
        ],
    },

    // My Account routes - user role only
    {
        label: 'My Account',
        roles: ['user'],
        routes: [
            {
                path: '/owner/appointments',
                roles: ['user'],
                component: OwnerAppointments,
                label: 'Appointments',
                icon: 'calendar',
            },
            {
                path: '/owner/pets',
                roles: ['user'],
                component: OwnerPets,
                label: 'My Pets',
                icon: 'pets',
            },
            {
                path: '/owner/vaccines',
                roles: ['user'],
                component: OwnerVaccines,
                label: 'Vaccinations',
                icon: 'syringe',
            },
            {
                path: '/owner/profile',
                roles: ['user'],
                component: OwnerProfile,
                label: 'Profile',
                icon: 'user',
            },
        ],
    },
];
