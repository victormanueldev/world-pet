/**
 * Login Page
 *
 * User authentication with email/password and optional tenant selection.
 * Supports both root login (/login) and tenant-specific login (/:slug/login).
 * Features glassmorphism dark theme, form validation, and smooth animations.
 */
import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Mail, Lock, ChevronRight, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { api } from '@/services/api';

// ----- Animation Variants --------------------------------------------------

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

const inputFocusVariants = {
    rest: { scale: 1 },
    focus: { scale: 1.01 },
};

// ----- Component -----------------------------------------------------------

interface TenantInfo {
    id: number;
    name: string;
    slug: string;
}

export function Login() {
    const { login, selectTenant, pendingTenants, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { slug } = useParams<{ slug: string }>();

    // Tenant info for tenant-specific login
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [isLoadingTenant, setIsLoadingTenant] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Validation state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Fetch tenant info if slug is present
    useEffect(() => {
        if (!slug) {
            setTenantInfo(null);
            return;
        }

        const fetchTenant = async () => {
            setIsLoadingTenant(true);
            try {
                const response = await api.get<TenantInfo>(`/tenants/${slug}`);
                setTenantInfo(response.data);
            } catch {
                setTenantInfo(null);
            } finally {
                setIsLoadingTenant(false);
            }
        };

        fetchTenant();
    }, [slug]);

    // Determine redirect path after successful login
    const getRedirectPath = (): string => {
        // If there was a saved location, use that
        const from = location.state?.from;
        if (from) {
            return from.pathname;
        }
        // If user has a tenant, redirect to tenant dashboard
        // (will be handled by the login response)
        return '/';
    };

    // Validate email format
    const validateEmail = (value: string): boolean => {
        if (!value.trim()) {
            setEmailError('El correo es requerido');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Ingresa un correo valido');
            return false;
        }
        setEmailError('');
        return true;
    };

    // Validate password
    const validatePassword = (value: string): boolean => {
        if (!value) {
            setPasswordError('La contrasena es requerida');
            return false;
        }
        if (value.length < 6) {
            setPasswordError('La contrasena debe tener al menos 6 caracteres');
            return false;
        }
        setPasswordError('');
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        // Validate all fields
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await login({ 
                email, 
                password,
                // If logging in at a specific tenant, pass the tenant ID
                ...(tenantInfo && { tenantId: tenantInfo.id }),
            });
            
            // If login successful and user has tenants, redirect to first tenant's dashboard
            if (result.success && result.data?.user) {
                const redirectPath = getRedirectPath();
                if (redirectPath === '/' && result.data.user.tenants?.length > 0) {
                    const primaryTenant = result.data.user.tenants[0];
                    navigate(`/${primaryTenant.slug}/`, { replace: true });
                } else if (redirectPath !== '/') {
                    navigate(redirectPath, { replace: true });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle tenant selection
    const handleTenantSelect = async (tenantId: number) => {
        setIsLoading(true);
        try {
            const result = await selectTenant(tenantId);
            if (result.success && result.data?.user) {
                const primaryTenant = result.data.user.tenants?.[0];
                if (primaryTenant) {
                    navigate(`/${primaryTenant.slug}/`, { replace: true });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Show tenant-specific branding
    const pageTitle = tenantInfo 
        ? `Inicia sesion en ${tenantInfo.name}` 
        : 'Inicia sesion en tu cuenta';
    const pageSubtitle = tenantInfo
        ? 'Accede a tu cuenta de paciente'
        : '';

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--color-bg-1)' }}
        >
            {/* Background gradient overlay */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 0%, rgba(130, 81, 238, 0.15) 0%, transparent 60%)',
                }}
            />

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                {/* Logo and branding */}
                <motion.div variants={staggerItem} className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-glow">
                            <PawPrint size={24} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-semibold text-white">World Pet</h1>
                    <p className="text-text-secondary mt-1">{pageTitle}</p>
                    {pageSubtitle && (
                        <p className="text-text-muted text-sm mt-1">{pageSubtitle}</p>
                    )}
                </motion.div>

                {/* Login card */}
                <motion.div variants={cardVariants} className="glass-card p-8">
                    <AnimatePresence mode="wait">
                        {pendingTenants && pendingTenants.length > 0 ? (
                            // Tenant selection view
                            <motion.div
                                key="tenant-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <Building2 size={24} className="text-brand-light" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            Selecciona tu organizacion
                                        </h2>
                                        <p className="text-sm text-text-secondary">
                                            Perteneces a multiples organizaciones
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {pendingTenants.map((tenant) => (
                                        <motion.button
                                            key={tenant.id}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTenantSelect(tenant.id)}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg
                                                       bg-white/5 border border-white/10 hover:bg-white/10
                                                       hover:border-white/20 transition-colors disabled:opacity-50"
                                        >
                                            <div className="text-left">
                                                <p className="font-medium text-white">{tenant.name}</p>
                                                <p className="text-xs text-text-muted">
                                                    Rol: {tenant.role}
                                                </p>
                                            </div>
                                            <ChevronRight size={18} className="text-text-muted" />
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            // Login form view
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Global error message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2 px-4 py-3 rounded-lg
                                                       bg-status-error/10 border border-status-error/30"
                                        >
                                            <AlertCircle size={18} className="text-status-error shrink-0" />
                                            <p className="text-sm text-status-error">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email input */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Correo electronico
                                    </label>
                                    <motion.div
                                        variants={inputFocusVariants}
                                        initial="rest"
                                        whileFocus="focus"
                                        className="relative"
                                    >
                                        <Mail
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (emailError) validateEmail(e.target.value);
                                            }}
                                            onBlur={() => validateEmail(email)}
                                            placeholder="tu@correo.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-white
                                                       placeholder:text-text-muted focus:ring-2 focus:ring-brand/50"
                                            autoComplete="email"
                                        />
                                    </motion.div>
                                    <AnimatePresence>
                                        {emailError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="text-xs text-status-error mt-1.5"
                                            >
                                                {emailError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Password input */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Contrasena
                                    </label>
                                    <motion.div
                                        variants={inputFocusVariants}
                                        initial="rest"
                                        whileFocus="focus"
                                        className="relative"
                                    >
                                        <Lock
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                        />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (passwordError) validatePassword(e.target.value);
                                            }}
                                            onBlur={() => validatePassword(password)}
                                            placeholder="Tu contrasena"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-white
                                                       placeholder:text-text-muted focus:ring-2 focus:ring-brand/50"
                                            autoComplete="current-password"
                                        />
                                    </motion.div>
                                    <AnimatePresence>
                                        {passwordError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="text-xs text-status-error mt-1.5"
                                            >
                                                {passwordError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Submit button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={isLoading}
                                    className="w-full"
                                >
                                    Iniciar sesion
                                </Button>

                                {/* Register link */}
                                <p className="text-center text-sm text-text-secondary">
                                    No tienes cuenta?{' '}
                                    <Link
                                        to="/register"
                                        className="text-brand-light hover:text-brand-hover transition-colors"
                                    >
                                        Registrate
                                    </Link>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}
