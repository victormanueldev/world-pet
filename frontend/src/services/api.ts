/**
 * API Service
 *
 * Axios instance configured with base URL, authentication headers,
 * and interceptors for token refresh on 401 responses.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '@/lib/tokenStorage';

// API base URL - defaults to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Main API client instance
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;

/**
 * Queue of requests waiting for token refresh
 */
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Add request to queue waiting for token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
    refreshSubscribers.push(callback);
}

/**
 * Process queued requests after successful token refresh
 */
function onRefreshSuccess(newToken: string): void {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
}

/**
 * Reject queued requests on refresh failure
 */
function onRefreshError(): void {
    refreshSubscribers = [];
}

/**
 * Callback for handling session expiration (redirect to login)
 * This is set by the AuthContext to handle navigation
 */
let onSessionExpired: (() => void) | null = null;

/**
 * Register callback for session expiration
 */
export function setSessionExpiredHandler(handler: () => void): void {
    onSessionExpired = handler;
}

/**
 * Request interceptor - Add Authorization header
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle 401 errors with token refresh
 */
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Skip if no config or already retried
        if (!originalRequest || (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            const refreshToken = getRefreshToken();
            const accessToken = getAccessToken();

            // If no refresh token or access token isn't expired, session is truly invalid
            if (!refreshToken || (accessToken && !isTokenExpired(accessToken))) {
                clearTokens();
                onSessionExpired?.();
                return Promise.reject(error);
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken: string) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            // Start refresh process
            isRefreshing = true;
            (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;

            try {
                // Call refresh endpoint directly (bypass interceptors)
                const response = await axios.post<{ access_token: string; refresh_token: string }>(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data;
                setTokens(newAccessToken, newRefreshToken);

                // Update original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Process queued requests
                onRefreshSuccess(newAccessToken);
                isRefreshing = false;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                clearTokens();
                onRefreshError();
                isRefreshing = false;
                onSessionExpired?.();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Type-safe error extraction from Axios errors
 */
export interface ApiError {
    message: string;
    status?: number;
    detail?: string;
}

export function extractApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
        return {
            message: axiosError.response?.data?.detail || axiosError.response?.data?.message || axiosError.message,
            status: axiosError.response?.status,
            detail: axiosError.response?.data?.detail,
        };
    }
    if (error instanceof Error) {
        return { message: error.message };
    }
    return { message: 'An unexpected error occurred' };
}

export default api;
