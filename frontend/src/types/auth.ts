export type UserRole = 'owner' | 'admin' | 'superadmin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    tenantId: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string; // Used for subdomain/path resolution
    logoUrl?: string;
    primaryColor?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
