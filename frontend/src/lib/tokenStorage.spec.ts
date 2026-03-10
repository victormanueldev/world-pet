/**
 * Token Storage Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    setAccessToken,
    getAccessToken,
    setRefreshToken,
    getRefreshToken,
    setTokens,
    getTokens,
    clearTokens,
    hasStoredTokens,
    parseTokenPayload,
    isTokenExpired,
    getTokenExpiresIn,
} from './tokenStorage';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('tokenStorage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('setAccessToken / getAccessToken', () => {
        it('stores and retrieves access token', () => {
            setAccessToken('test-access-token');
            expect(getAccessToken()).toBe('test-access-token');
        });

        it('returns null when no token is stored', () => {
            expect(getAccessToken()).toBeNull();
        });
    });

    describe('setRefreshToken / getRefreshToken', () => {
        it('stores and retrieves refresh token', () => {
            setRefreshToken('test-refresh-token');
            expect(getRefreshToken()).toBe('test-refresh-token');
        });

        it('returns null when no token is stored', () => {
            expect(getRefreshToken()).toBeNull();
        });
    });

    describe('setTokens / getTokens', () => {
        it('stores both tokens at once', () => {
            setTokens('access-123', 'refresh-456');
            const tokens = getTokens();
            expect(tokens.accessToken).toBe('access-123');
            expect(tokens.refreshToken).toBe('refresh-456');
        });
    });

    describe('clearTokens', () => {
        it('removes all stored tokens', () => {
            setTokens('access', 'refresh');
            clearTokens();
            expect(getAccessToken()).toBeNull();
            expect(getRefreshToken()).toBeNull();
        });
    });

    describe('hasStoredTokens', () => {
        it('returns false when no tokens are stored', () => {
            expect(hasStoredTokens()).toBe(false);
        });

        it('returns false when only access token is stored', () => {
            setAccessToken('access');
            expect(hasStoredTokens()).toBe(false);
        });

        it('returns false when only refresh token is stored', () => {
            setRefreshToken('refresh');
            expect(hasStoredTokens()).toBe(false);
        });

        it('returns true when both tokens are stored', () => {
            setTokens('access', 'refresh');
            expect(hasStoredTokens()).toBe(true);
        });
    });

    describe('parseTokenPayload', () => {
        it('parses valid JWT payload', () => {
            // Create a test JWT with payload { sub: "123", exp: 9999999999 }
            const payload = btoa(JSON.stringify({ sub: '123', exp: 9999999999 }));
            const token = `header.${payload}.signature`;
            
            const result = parseTokenPayload<{ sub: string; exp: number }>(token);
            expect(result).toEqual({ sub: '123', exp: 9999999999 });
        });

        it('returns null for invalid token format', () => {
            expect(parseTokenPayload('invalid')).toBeNull();
            expect(parseTokenPayload('too.many.parts.here')).toBeNull();
        });

        it('returns null for invalid JSON payload', () => {
            const token = 'header.notvalidbase64!@#.signature';
            expect(parseTokenPayload(token)).toBeNull();
        });
    });

    describe('isTokenExpired', () => {
        it('returns true for token with past expiration', () => {
            const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
            const payload = btoa(JSON.stringify({ exp: pastExp }));
            const token = `header.${payload}.signature`;
            
            expect(isTokenExpired(token)).toBe(true);
        });

        it('returns false for token with future expiration', () => {
            const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const payload = btoa(JSON.stringify({ exp: futureExp }));
            const token = `header.${payload}.signature`;
            
            expect(isTokenExpired(token)).toBe(false);
        });

        it('returns true when within buffer period', () => {
            const almostExpired = Math.floor(Date.now() / 1000) + 15; // 15 seconds from now
            const payload = btoa(JSON.stringify({ exp: almostExpired }));
            const token = `header.${payload}.signature`;
            
            expect(isTokenExpired(token, 30)).toBe(true); // 30 second buffer
        });

        it('returns true for invalid token', () => {
            expect(isTokenExpired('invalid')).toBe(true);
        });
    });

    describe('getTokenExpiresIn', () => {
        it('returns seconds until expiration', () => {
            const futureExp = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
            const payload = btoa(JSON.stringify({ exp: futureExp }));
            const token = `header.${payload}.signature`;
            
            const expiresIn = getTokenExpiresIn(token);
            expect(expiresIn).toBeGreaterThan(290);
            expect(expiresIn).toBeLessThanOrEqual(300);
        });

        it('returns 0 for expired token', () => {
            const pastExp = Math.floor(Date.now() / 1000) - 3600;
            const payload = btoa(JSON.stringify({ exp: pastExp }));
            const token = `header.${payload}.signature`;
            
            expect(getTokenExpiresIn(token)).toBe(0);
        });

        it('returns 0 for invalid token', () => {
            expect(getTokenExpiresIn('invalid')).toBe(0);
        });
    });
});
