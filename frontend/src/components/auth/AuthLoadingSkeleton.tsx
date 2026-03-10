/**
 * AuthLoadingSkeleton
 *
 * Loading skeleton displayed while checking authentication state.
 * Shows a centered spinner with the app branding.
 */
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';

export function AuthLoadingSkeleton() {
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: 'var(--color-bg-1)' }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                {/* Animated logo */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="w-16 h-16 rounded-xl bg-brand flex items-center justify-center shadow-glow"
                >
                    <PawPrint size={32} className="text-white" />
                </motion.div>

                {/* Loading text */}
                <p className="text-text-secondary text-sm">Cargando...</p>

                {/* Animated dots */}
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                            }}
                            className="w-2 h-2 rounded-full bg-brand"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
