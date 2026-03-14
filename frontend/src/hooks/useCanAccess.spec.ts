/**
 * Tests for useCanAccess hook
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCanAccess } from './useCanAccess';
import * as TenantContext from '@/context/TenantContext';

// Mock the TenantContext
vi.mock('@/context/TenantContext');

describe('useCanAccess', () => {
    it('returns true when user has required admin role', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'admin' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useCanAccess(['admin']));
        expect(result.current).toBe(true);
    });

    it('returns true when user has required pet_owner role', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'pet_owner' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useCanAccess(['pet_owner']));
        expect(result.current).toBe(true);
    });

    it('returns false when user lacks required role', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'pet_owner' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useCanAccess(['admin']));
        expect(result.current).toBe(false);
    });

    it('returns true when user has one of multiple allowed roles', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: { role: 'pet_owner' } as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useCanAccess(['admin', 'pet_owner']));
        expect(result.current).toBe(true);
    });

    it('returns false when tenant is null', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: null,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useCanAccess(['admin']));
        expect(result.current).toBe(false);
    });

    it('returns false when tenant has no role', () => {
        vi.spyOn(TenantContext, 'useTenant').mockReturnValue({
            tenant: {} as any,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        const { result } = renderHook(() => useCanAccess(['admin']));
        expect(result.current).toBe(false);
    });
});
