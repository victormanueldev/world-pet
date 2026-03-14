/**
 * UserMenu
 *
 * Displays the current user info and provides logout functionality.
 * Shows user avatar, name, role, and a dropdown with logout option.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
    const { user, logout } = useAuth();
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

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    if (!user) {
        return null;
    }

    // Get user initials for avatar
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Get role display text
    const roleDisplay = user.role === 'admin' ? 'Administrador' : 'Miembro';

    return (
        <div ref={menuRef} className="relative">
            {/* User button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg
                           bg-white/5 hover:bg-white/10 border border-white/10
                           hover:border-white/20 transition-colors"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center">
                    <span className="text-sm font-medium text-brand-light">{initials}</span>
                </div>

                {/* User info */}
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">{roleDisplay}</p>
                </div>

                {/* Chevron */}
                <ChevronDown
                    size={16}
                    className={`text-text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </motion.button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full left-0 right-0 mb-2 py-1
                                   bg-neutral-bg3 rounded-lg border border-white/10
                                   shadow-xl overflow-hidden z-50"
                    >
                        {/* User email */}
                        <div className="px-3 py-2 border-b border-white/10">
                            <p className="text-xs text-text-muted">Conectado como</p>
                            <p className="text-sm text-white truncate">{user.email}</p>
                        </div>

                        {/* Profile link (placeholder for future) */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // TODO: Navigate to profile page when implemented
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2
                                       text-sm text-text-secondary hover:text-white
                                       hover:bg-white/5 transition-colors"
                        >
                            <User size={16} />
                            Mi perfil
                        </button>

                        {/* Logout button */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2
                                       text-sm text-status-error hover:bg-status-error/10
                                       transition-colors"
                        >
                            <LogOut size={16} />
                            Cerrar sesion
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
