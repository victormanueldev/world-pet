/**
 * ProtectedRoute Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContext from '@/context/AuthContext';
import * as TenantContext from '@/context/TenantContext';

// Mock the useAuth hook
vi.mock('@/context/AuthContext', async () => {
    const actual = await vi.importActual('@/context/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

// Mock the useTenant hook
vi.mock('@/context/TenantContext', async () => {
    const actual = await vi.importActual('@/context/TenantContext');
    return {
        ...actual,
        useTenant: vi.fn(),
    };
});

const mockUseAuth = AuthContext.useAuth as ReturnType<typeof vi.fn>;
const mockUseTenant = TenantContext.useTenant as ReturnType<typeof vi.fn>;

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock for useTenant
        mockUseTenant.mockReturnValue({
            tenant: null,
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });
    });

    it('shows loading skeleton when auth is loading', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: true,
            user: null,
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('redirects to login when not authenticated', async () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            user: null,
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when authenticated', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'member', tenantId: 1, tenants: [{ id: 1, name: 'Test Clinic', slug: 'test', role: 'member' }] },
        });
        mockUseTenant.mockReturnValue({
            tenant: { id: 1, name: 'Test Clinic', slug: 'test', role: 'member' },
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/test/dashboard']}>
                <Routes>
                    <Route
                        path="/:slug/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('allows access when user has required role', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', tenantId: 1, tenants: [{ id: 1, name: 'Test Clinic', slug: 'test', role: 'admin' }] },
        });
        mockUseTenant.mockReturnValue({
            tenant: { id: 1, name: 'Test', slug: 'test', role: 'admin' },
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/test/dashboard']}>
                <Routes>
                    <Route
                        path="/:slug/dashboard"
                        element={
                            <ProtectedRoute requiredRoles={['admin']}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('redirects when user lacks required role', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 1, name: 'Member User', email: 'member@example.com', role: 'member', tenantId: 1, tenants: [{ id: 1, name: 'Test Clinic', slug: 'test', role: 'member' }] },
        });
        mockUseTenant.mockReturnValue({
            tenant: { id: 1, name: 'Test', slug: 'test', role: 'member' },
            isLoading: false,
            isValidating: false,
            error: null,
            refreshTenant: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/test/admin']}>
                <Routes>
                    <Route
                        path="/:slug/admin"
                        element={
                            <ProtectedRoute requiredRoles={['admin']}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/:slug/" element={<div>Dashboard</div>} />
                </Routes>
            </MemoryRouter>
        );

        // Role doesn't match, so should redirect to tenant root
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
});
