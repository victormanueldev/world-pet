/**
 * Tests for useFilteredRoutes hook
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFilteredRoutes } from './useFilteredRoutes';
import * as TenantContext from '@/context/TenantContext';

// Mock the TenantContext
vi.mock('@/context/TenantContext');

describe('useFilteredRoutes', () => {
    it('returns admin routes for admin user', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'admin' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useFilteredRoutes());
        const groups = result.current;

        // Should include Shared and Administration groups
        expect(groups.length).toBeGreaterThan(0);
        const groupLabels = groups.map((g) => g.label);
        expect(groupLabels).toContain('Shared');
        expect(groupLabels).toContain('Administration');
        expect(groupLabels).not.toContain('My Account');
    });

    it('returns pet_owner routes for pet_owner user', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'pet_owner' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useFilteredRoutes());
        const groups = result.current;

        // Should include Shared and My Account groups
        expect(groups.length).toBeGreaterThan(0);
        const groupLabels = groups.map((g) => g.label);
        expect(groupLabels).toContain('Shared');
        expect(groupLabels).toContain('My Account');
        expect(groupLabels).not.toContain('Administration');
    });

    it('filters routes within groups by user role', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'admin' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useFilteredRoutes());
        const groups = result.current;

        // All routes in all groups should allow admin role
        groups.forEach((group) => {
            group.routes.forEach((route) => {
                expect(route.roles).toContain('admin');
            });
        });
    });

    it('returns empty array when tenant is null', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: null,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useFilteredRoutes());
        expect(result.current).toEqual([]);
    });

    it('returns empty array when tenant has no role', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: {} as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useFilteredRoutes());
        expect(result.current).toEqual([]);
    });

    it('excludes groups with no accessible routes', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'admin' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useFilteredRoutes());
        const groups = result.current;

        // All returned groups should have at least one route
        groups.forEach((group) => {
            expect(group.routes.length).toBeGreaterThan(0);
        });
    });
});
