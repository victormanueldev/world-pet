/**
 * Auth Context
 *
 * Provides authentication state and methods throughout the application.
 * Handles login, logout, registration, token refresh, and user state.
 */
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAccessToken,
    getRefreshToken,
    clearTokens,
    isTokenExpired,
    getTokenExpiresIn,
} from '@/lib/tokenStorage';
import {
    login as apiLogin,
    register as apiRegister,
    refreshTokens,
    getCurrentUser,
    logout as apiLogout,
    type User,
    type UserTenant,
    type LoginRequest,
    type RegisterRequest,
    type AuthResult,
    type LoginResponse,
    type RegisterResponse,
} from '@/services/auth';
import { setSessionExpiredHandler } from '@/services/api';

// ----- Types ---------------------------------------------------------------

export interface AuthState {
    /** Currently authenticated user, or null if not authenticated */
    user: User | null;
    /** Whether auth state is being initialized (checking stored tokens) */
    isLoading: boolean;
    /** Whether user is authenticated */
    isAuthenticated: boolean;
    /** Error message from last auth operation */
    error: string | null;
    /** Multi-tenant: tenants available for selection after login */
    pendingTenants: UserTenant[] | null;
}

export interface AuthContextType extends AuthState {
    /** Login with email/password, optionally selecting a tenant */
    login: (request: LoginRequest) => Promise<AuthResult<LoginResponse>>;
    /** Complete login by selecting a tenant (for multi-tenant users) */
    selectTenant: (tenantId: number) => Promise<AuthResult<LoginResponse>>;
    /** Register a new user */
    register: (request: RegisterRequest) => Promise<AuthResult<RegisterResponse>>;
    /** Logout and clear session */
    logout: () => void;
    /** Clear any auth errors */
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----- Constants -----------------------------------------------------------

/** Time before token expiry to trigger refresh (in seconds) */
const REFRESH_BUFFER_SECONDS = 60;

/** Minimum time between refresh attempts (in ms) */
const MIN_REFRESH_INTERVAL_MS = 5000;

// ----- Provider Component --------------------------------------------------

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate();

    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingTenants, setPendingTenants] = useState<UserTenant[] | null>(null);
    const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);

    // Derived state
    const isAuthenticated = user !== null;

    // Handle session expiration (redirect to login)
    const handleSessionExpired = useCallback(() => {
        setUser(null);
        setPendingTenants(null);
        setPendingCredentials(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    // Register session expired handler with API service
    useEffect(() => {
        setSessionExpiredHandler(handleSessionExpired);
    }, [handleSessionExpired]);

    // Initialize auth state from stored tokens
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            // No stored tokens
            if (!accessToken || !refreshToken) {
                setIsLoading(false);
                return;
            }

            // Check if access token is expired
            if (isTokenExpired(accessToken, REFRESH_BUFFER_SECONDS)) {
                // Try to refresh
                const result = await refreshTokens(refreshToken);
                if (!result.success) {
                    // Refresh failed - clear and redirect to login
                    clearTokens();
                    setIsLoading(false);
                    return;
                }
            }

            // Fetch current user
            const userResult = await getCurrentUser();
            if (userResult.success && userResult.data) {
                setUser(userResult.data);
            } else {
                // Failed to get user - clear tokens
                clearTokens();
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    // Set up automatic token refresh before expiry
    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const accessToken = getAccessToken();
        if (!accessToken) {
            return;
        }

        const expiresIn = getTokenExpiresIn(accessToken);
        const refreshIn = Math.max(
            (expiresIn - REFRESH_BUFFER_SECONDS) * 1000,
            MIN_REFRESH_INTERVAL_MS
        );

        const timeoutId = setTimeout(async () => {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                const result = await refreshTokens(refreshToken);
                if (!result.success) {
                    handleSessionExpired();
                }
            }
        }, refreshIn);

        return () => clearTimeout(timeoutId);
    }, [isAuthenticated, user, handleSessionExpired]);

    // Login handler
    const login = useCallback(async (request: LoginRequest): Promise<AuthResult<LoginResponse>> => {
        setError(null);
        setPendingTenants(null);

        const result = await apiLogin(request);

        if (!result.success) {
            setError(result.error?.message || 'Login failed');
            return result;
        }

        if (result.data?.availableTenants && result.data.availableTenants.length > 0) {
            // Multi-tenant user - store tenants for selection
            setPendingTenants(result.data.availableTenants);
            setPendingCredentials({ email: request.email, password: request.password });
            return result;
        }

        // Single tenant or tenant already selected - set user
        if (result.data?.user) {
            setUser(result.data.user);
        }

        return result;
    }, []);

    // Select tenant for multi-tenant login
    const selectTenant = useCallback(async (tenantId: number): Promise<AuthResult<LoginResponse>> => {
        if (!pendingCredentials) {
            return {
                success: false,
                error: { message: 'No pending login' },
            };
        }

        const result = await apiLogin({
            email: pendingCredentials.email,
            password: pendingCredentials.password,
            tenantId,
        });

        if (result.success && result.data?.user) {
            setUser(result.data.user);
            setPendingTenants(null);
            setPendingCredentials(null);
        } else {
            setError(result.error?.message || 'Failed to select tenant');
        }

        return result;
    }, [pendingCredentials]);

    // Register handler
    const register = useCallback(async (request: RegisterRequest): Promise<AuthResult<RegisterResponse>> => {
        setError(null);
        const result = await apiRegister(request);

        if (!result.success) {
            setError(result.error?.message || 'Registration failed');
        }

        return result;
    }, []);

    // Logout handler
    const logout = useCallback(() => {
        apiLogout();
        setUser(null);
        setPendingTenants(null);
        setPendingCredentials(null);
        setError(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Context value
    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        error,
        pendingTenants,
        login,
        selectTenant,
        register,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----- Hook ----------------------------------------------------------------

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Export types for external use
export type { User, UserTenant, LoginRequest, RegisterRequest };
