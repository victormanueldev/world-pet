/**
 * Register Page
 *
 * User registration with email, name, password, and optional tenant.
 * Supports both root registration (/register) and tenant-specific registration (/:slug/register).
 * Features glassmorphism dark theme, form validation, and smooth animations.
 */
import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
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

export function Register() {
    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    // Tenant info for tenant-specific registration
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [isLoadingTenant, setIsLoadingTenant] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validation state
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

    // Validate name
    const validateName = (value: string): boolean => {
        if (!value.trim()) {
            setNameError('El nombre es requerido');
            return false;
        }
        if (value.trim().length < 2) {
            setNameError('El nombre debe tener al menos 2 caracteres');
            return false;
        }
        setNameError('');
        return true;
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
        if (value.length < 8) {
            setPasswordError('La contrasena debe tener al menos 8 caracteres');
            return false;
        }
        // Check for at least one uppercase, one lowercase, and one number
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        if (!hasUppercase || !hasLowercase || !hasNumber) {
            setPasswordError('Debe incluir mayusculas, minusculas y numeros');
            return false;
        }
        setPasswordError('');
        return true;
    };

    // Validate confirm password
    const validateConfirmPassword = (value: string): boolean => {
        if (!value) {
            setConfirmPasswordError('Confirma tu contrasena');
            return false;
        }
        if (value !== password) {
            setConfirmPasswordError('Las contrasenas no coinciden');
            return false;
        }
        setConfirmPasswordError('');
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        // Validate all fields
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmValid = validateConfirmPassword(confirmPassword);

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
            return;
        }

        setIsLoading(true);
        try {
            let result;
            
            if (tenantInfo) {
                // Use tenant-specific registration endpoint
                const response = await api.post(`/tenants/${tenantInfo.slug}/register`, {
                    name: name.trim(),
                    email: email.trim(),
                    password,
                });
                
                if (response.status === 201) {
                    setIsSuccess(true);
                    // Redirect to tenant login after success
                    setTimeout(() => {
                        navigate(`/${tenantInfo.slug}/login`);
                    }, 2000);
                }
                return;
            }

            // Use standard registration
            result = await register({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            if (result.success) {
                setIsSuccess(true);
                // Redirect to login after showing success message
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            // Error is handled by the API service
        } finally {
            setIsLoading(false);
        }
    };

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
                    {tenantInfo ? (
                        <>
                            <p className="text-brand-light mt-2">Registrate en {tenantInfo.name}</p>
                            <p className="text-text-muted text-sm mt-1">Crea tu cuenta de paciente</p>
                        </>
                    ) : (
                        <p className="text-text-secondary mt-1">Crea tu cuenta</p>
                    )}
                </motion.div>

                {/* Register card */}
                <motion.div variants={cardVariants} className="glass-card p-8">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            // Success view
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center py-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle size={32} className="text-status-success" />
                                </motion.div>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Cuenta creada exitosamente
                                </h2>
                                <p className="text-text-secondary">
                                    Redirigiendo al inicio de sesion...
                                </p>
                            </motion.div>
                        ) : (
                            // Register form view
                            <motion.form
                                key="register-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
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

                                {/* Name input */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Nombre completo
                                    </label>
                                    <motion.div
                                        variants={inputFocusVariants}
                                        initial="rest"
                                        whileFocus="focus"
                                        className="relative"
                                    >
                                        <User
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                        />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                if (nameError) validateName(e.target.value);
                                            }}
                                            onBlur={() => validateName(name)}
                                            placeholder="Tu nombre"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-white
                                                       placeholder:text-text-muted focus:ring-2 focus:ring-brand/50"
                                            autoComplete="name"
                                        />
                                    </motion.div>
                                    <AnimatePresence>
                                        {nameError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="text-xs text-status-error mt-1.5"
                                            >
                                                {nameError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

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
                                            placeholder="Minimo 8 caracteres"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-white
                                                       placeholder:text-text-muted focus:ring-2 focus:ring-brand/50"
                                            autoComplete="new-password"
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

                                {/* Confirm password input */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Confirmar contrasena
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
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (confirmPasswordError) validateConfirmPassword(e.target.value);
                                            }}
                                            onBlur={() => validateConfirmPassword(confirmPassword)}
                                            placeholder="Repite tu contrasena"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-white
                                                       placeholder:text-text-muted focus:ring-2 focus:ring-brand/50"
                                            autoComplete="new-password"
                                        />
                                    </motion.div>
                                    <AnimatePresence>
                                        {confirmPasswordError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="text-xs text-status-error mt-1.5"
                                            >
                                                {confirmPasswordError}
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
                                    className="w-full mt-2"
                                >
                                    Crear cuenta
                                </Button>

                                {/* Login link */}
                                <p className="text-center text-sm text-text-secondary">
                                    Ya tienes cuenta?{' '}
                                    <Link
                                        to={tenantInfo ? `/${tenantInfo.slug}/login` : '/login'}
                                        className="text-brand-light hover:text-brand-hover transition-colors"
                                    >
                                        Inicia sesion
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
