import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState, AuthResponse, LoginCredentials, RegisterData } from '../types/auth';
import api from '../services/api';
import { AuthContext } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setState({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const initAuth = async () => {
            await checkAuth();
            if (isMounted) {
                // isLoading is already set in checkAuth
            }
        };
        initAuth();
        return () => { isMounted = false; };
    }, [checkAuth]);

    const login = async (credentials: LoginCredentials) => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        const { access_token, refresh_token, user } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        setState({
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const register = async (data: RegisterData) => {
        await api.post('/auth/register', data);
    };

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    const value = useMemo(() => ({
        ...state,
        login,
        register,
        logout
    }), [state, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
