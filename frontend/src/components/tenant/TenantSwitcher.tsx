/**
 * TenantSwitcher
 *
 * Dropdown for switching between tenants the user has access to.
 * Integrates with tenant context to show current tenant and switch between tenants.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/hooks/useAuth';

export function TenantSwitcher() {
    const { tenant } = useTenant();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle tenant switch - navigate to new tenant path
    const handleTenantSwitch = (targetSlug: string) => {
        setIsOpen(false);
        navigate(`/${targetSlug}/`);
    };

    // Don't render if not authenticated or user has no tenants
    if (!isAuthenticated || !user?.tenants || user.tenants.length === 0) {
        return null;
    }

    // Get current tenant from URL or user context
    const currentTenant = tenant || user.tenants.find((t) => t.slug === slug) || user.tenants[0];

    // Don't show switcher if user only has one tenant
    if (user.tenants.length === 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Building2 size={16} className="text-text-muted" />
                <span className="text-sm font-medium text-white truncate">
                    {currentTenant?.name || user.tenants[0].name}
                </span>
            </div>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
                           bg-white/5 hover:bg-white/10 border border-white/10
                           hover:border-white/20 transition-colors"
            >
                <Building2 size={16} className="text-text-muted shrink-0" />
                <span className="text-sm font-medium text-white truncate flex-1 text-left">
                    {currentTenant?.name || 'Seleccionar'}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-0 right-0 mt-2 py-1
                                   bg-neutral-bg3 rounded-lg border border-white/10
                                   shadow-xl overflow-hidden z-50"
                    >
                        {user.tenants.map((tenantItem) => (
                            <button
                                key={tenantItem.id}
                                onClick={() => handleTenantSwitch(tenantItem.slug)}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${currentTenant?.id === tenantItem.id
                                    ? 'text-brand-light bg-brand-subtle'
                                    : 'text-white hover:bg-white/5'
                                    }`}
                            >
                                <p className="font-medium truncate">{tenantItem.name}</p>
                                <p className="text-xs text-text-muted">Rol: {tenantItem.role}</p>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
