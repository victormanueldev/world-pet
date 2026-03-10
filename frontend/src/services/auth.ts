/**
 * Auth Service
 *
 * API calls for authentication: login, register, refresh, logout, and profile.
 */
import { api, extractApiError, type ApiError } from './api';
import { setTokens, clearTokens } from '@/lib/tokenStorage';

// ----- Types ---------------------------------------------------------------

export interface UserTenant {
    id: number;
    name: string;
    slug: string;
    role: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    tenantId: number | null;
    tenants: UserTenant[];
}

export interface LoginRequest {
    email: string;
    password: string;
    tenantId?: number;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user: User;
    /** If user belongs to multiple tenants, this lists them for selection */
    availableTenants?: UserTenant[];
}

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    tenantId?: number;
}

export interface RegisterResponse {
    id: number;
    email: string;
    name: string;
    message: string;
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
}

export interface AuthResult<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

// ----- API Calls -----------------------------------------------------------

/**
 * Login with email and password
 * If user belongs to multiple tenants and no tenantId provided,
 * returns availableTenants for user to select
 */
export async function login(request: LoginRequest): Promise<AuthResult<LoginResponse>> {
    try {
        const response = await api.post<{
            access_token: string;
            refresh_token: string;
            token_type: string;
            user: {
                id: number;
                email: string;
                name: string;
                role: string;
                tenant_id: number | null;
                tenants: Array<{ id: number; name: string; slug: string; role: string }>;
            };
            available_tenants?: Array<{ id: number; name: string; slug: string; role: string }>;
        }>('/auth/login', {
            email: request.email,
            password: request.password,
            tenant_id: request.tenantId,
        });

        const { access_token, refresh_token, token_type, user, available_tenants } = response.data;

        // Store tokens if login is complete (not multi-tenant selection)
        if (!available_tenants) {
            setTokens(access_token, refresh_token);
        }

        return {
            success: true,
            data: {
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenType: token_type,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenant_id,
                    tenants: user.tenants.map((t) => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        role: t.role,
                    })),
                },
                availableTenants: available_tenants?.map((t) => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    role: t.role,
                })),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: extractApiError(error),
        };
    }
}

/**
 * Register a new user
 */
export async function register(request: RegisterRequest): Promise<AuthResult<RegisterResponse>> {
    try {
        const response = await api.post<{
            id: number;
            email: string;
            name: string;
            message: string;
        }>('/auth/register', {
            email: request.email,
            name: request.name,
            password: request.password,
            tenant_id: request.tenantId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: extractApiError(error),
        };
    }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResult<RefreshResponse>> {
    try {
        const response = await api.post<{
            access_token: string;
            refresh_token: string;
            token_type: string;
        }>('/auth/refresh', {
            refresh_token: refreshToken,
        });

        const { access_token, refresh_token, token_type } = response.data;

        // Store new tokens
        setTokens(access_token, refresh_token);

        return {
            success: true,
            data: {
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenType: token_type,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: extractApiError(error),
        };
    }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<AuthResult<User>> {
    try {
        const response = await api.get<{
            id: number;
            email: string;
            name: string;
            role: string;
            tenant_id: number | null;
            tenants: Array<{ id: number; name: string; slug: string; role: string }>;
        }>('/auth/me');

        return {
            success: true,
            data: {
                id: response.data.id,
                email: response.data.email,
                name: response.data.name,
                role: response.data.role,
                tenantId: response.data.tenant_id,
                tenants: response.data.tenants.map((t) => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    role: t.role,
                })),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: extractApiError(error),
        };
    }
}

/**
 * Logout - clear local tokens
 * Note: This is client-side only as the backend uses stateless JWTs
 */
export function logout(): void {
    clearTokens();
}
