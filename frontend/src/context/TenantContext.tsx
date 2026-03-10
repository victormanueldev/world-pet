/**
 * Tenant Context
 *
 * Provides tenant context based on URL path slug.
 * Validates that the JWT tenant matches the URL slug.
 */
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, type UserTenant } from '@/context/AuthContext';
import { getCurrentUser } from '@/services/auth';

export interface TenantInfo {
    id: number;
    name: string;
    slug: string;
    role: string;
}

export interface TenantState {
    tenant: TenantInfo | null;
    isLoading: boolean;
    isValidating: boolean;
    error: string | null;
}

export interface TenantContextType extends TenantState {
    refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
    children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateAndSetTenant = useCallback(async () => {
        if (!slug) {
            setTenant(null);
            setIsLoading(false);
            return;
        }

        if (!isAuthenticated || !user) {
            setIsLoading(false);
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Find tenant in user's tenant list that matches the slug
            const matchingTenant = user.tenants.find((t: UserTenant) => t.slug === slug);

            if (matchingTenant) {
                setTenant({
                    id: matchingTenant.id,
                    name: matchingTenant.name,
                    slug: matchingTenant.slug,
                    role: matchingTenant.role,
                });
            } else {
                // No matching tenant - redirect to correct path or show error
                const primaryTenant = user.tenants[0];
                if (primaryTenant) {
                    // Redirect to the correct tenant path
                    navigate(`/${primaryTenant.slug}/`, { replace: true });
                } else {
                    setError('You do not have access to this clinic');
                }
            }
        } catch {
            setError('Failed to validate tenant');
        } finally {
            setIsLoading(false);
            setIsValidating(false);
        }
    }, [slug, isAuthenticated, user, navigate]);

    // Initial validation
    useEffect(() => {
        validateAndSetTenant();
    }, [validateAndSetTenant]);

    // Refresh tenant info from server
    const refreshTenant = useCallback(async () => {
        if (!isAuthenticated) {
            return;
        }

        setIsValidating(true);
        try {
            const result = await getCurrentUser();
            if (result.success && result.data) {
                // Find tenant matching current slug
                if (slug) {
                    const matchingTenant = result.data.tenants.find((t: UserTenant) => t.slug === slug);
                    if (matchingTenant) {
                        setTenant({
                            id: matchingTenant.id,
                            name: matchingTenant.name,
                            slug: matchingTenant.slug,
                            role: matchingTenant.role,
                        });
                    }
                }
            }
        } finally {
            setIsValidating(false);
        }
    }, [isAuthenticated, slug]);

    const value: TenantContextType = {
        tenant,
        isLoading,
        isValidating,
        error,
        refreshTenant,
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant(): TenantContextType {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
