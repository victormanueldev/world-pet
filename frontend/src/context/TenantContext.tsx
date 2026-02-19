import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Tenant } from '../types/auth';

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate tenant resolution based on subdomain or query param
        const resolveTenant = async () => {
            // In a real app, we'd parse window.location.hostname
            // For dev, we'll check a query param ?tenant=clinic-a or default to a mock
            const params = new URLSearchParams(window.location.search);
            const tenantSlug = params.get('tenant') || 'default-clinic';

            // Mock API call
            setTimeout(() => {
                if (tenantSlug === 'admin') {
                    setTenant({
                        id: 'platform',
                        name: 'World Pet Platform',
                        slug: 'admin',
                        primaryColor: '#8251EE', // Platform brand
                    });
                } else {
                    setTenant({
                        id: '1',
                        name: 'Happy Paws Clinic',
                        slug: 'happy-paws',
                        primaryColor: '#14b8a6', // Clinic brand
                    });
                }
                setIsLoading(false);
            }, 500);
        };

        resolveTenant();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
