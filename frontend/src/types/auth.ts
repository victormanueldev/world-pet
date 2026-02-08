export interface User {
    id: string;
    email: string;
    name: string;
    role: 'client' | 'admin';
    photo?: string;
    phone?: string;
    address?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role_name: string;
}
