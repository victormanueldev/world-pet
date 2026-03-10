/**
 * useAuth hook re-export
 *
 * Convenient access to auth context from hooks directory.
 */
export { AuthProvider, useAuth } from '@/context/AuthContext';
export type {
    AuthContextType,
    AuthState,
    User,
    UserTenant,
    LoginRequest,
    RegisterRequest,
} from '@/context/AuthContext';
