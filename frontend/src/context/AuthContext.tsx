import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
    login: (email: string) => Promise<void>;
    logout: () => void;
    register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string) => {
        setIsLoading(true);
        // Mock login
        setTimeout(() => {
            setUser({
                id: '1',
                email,
                name: 'John Doe',
                role: 'owner',
                tenantId: '1',
            });
            setIsLoading(false);
        }, 1000);
    };

    const register = async (data: any) => {
        setIsLoading(true);
        // Mock register
        setTimeout(() => {
            console.log('Registered', data);
            setUser({
                id: '2',
                email: data.email,
                name: data.fullName,
                role: 'owner',
                tenantId: '1'
            });
            setIsLoading(false);
        }, 1000);
    }

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}
