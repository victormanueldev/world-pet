/**
 * Token Storage Utilities
 *
 * Secure handling of JWT tokens in localStorage.
 * Provides type-safe access and automatic JSON parsing.
 */

const ACCESS_TOKEN_KEY = 'world_pet_access_token';
const REFRESH_TOKEN_KEY = 'world_pet_refresh_token';

export interface StoredTokens {
    accessToken: string | null;
    refreshToken: string | null;
}

/**
 * Store the access token in localStorage
 */
export function setAccessToken(token: string): void {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
        console.error('Failed to store access token:', error);
    }
}

/**
 * Retrieve the access token from localStorage
 */
export function getAccessToken(): string | null {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to retrieve access token:', error);
        return null;
    }
}

/**
 * Store the refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
    try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
        console.error('Failed to store refresh token:', error);
    }
}

/**
 * Retrieve the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to retrieve refresh token:', error);
        return null;
    }
}

/**
 * Store both tokens at once
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
}

/**
 * Retrieve both tokens at once
 */
export function getTokens(): StoredTokens {
    return {
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
    };
}

/**
 * Clear all stored tokens (logout)
 */
export function clearTokens(): void {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to clear tokens:', error);
    }
}

/**
 * Check if user has stored tokens (may still be expired)
 */
export function hasStoredTokens(): boolean {
    return getAccessToken() !== null && getRefreshToken() !== null;
}

/**
 * Parse JWT token payload without verification (for client-side use only)
 * Returns null if token is invalid or parsing fails
 */
export function parseTokenPayload<T = Record<string, unknown>>(token: string): T | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded) as T;
    } catch {
        return null;
    }
}

/**
 * Check if a token is expired based on its exp claim
 * Returns true if expired or if parsing fails (fail-safe)
 */
export function isTokenExpired(token: string, bufferSeconds: number = 30): boolean {
    const payload = parseTokenPayload<{ exp?: number }>(token);
    if (!payload?.exp) {
        return true;
    }
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const bufferMs = bufferSeconds * 1000;
    return now >= expirationTime - bufferMs;
}

/**
 * Get the time until token expires in seconds
 * Returns 0 if token is already expired or invalid
 */
export function getTokenExpiresIn(token: string): number {
    const payload = parseTokenPayload<{ exp?: number }>(token);
    if (!payload?.exp) {
        return 0;
    }
    const expirationTime = payload.exp * 1000;
    const now = Date.now();
    const remaining = Math.max(0, expirationTime - now);
    return Math.floor(remaining / 1000);
}
