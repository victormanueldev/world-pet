/**
 * Dashboard page — placeholder landing page.
 *
 * Will be replaced with real content once modules are built.
 */
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader } from "@/components/layout/PageHeader";

export function Dashboard() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <PageHeader
                title="Dashboard"
                subtitle="Bienvenido a World Pet — tu plataforma de gestión veterinaria."
            />

            {/* Placeholder stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Mascotas", "Citas pendientes", "Vacunas próximas"].map((label) => (
                    <motion.div
                        key={label}
                        variants={staggerItem}
                        className="glass-card p-6 flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                            <PawPrint size={18} className="text-brand-light" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">—</p>
                            <p className="text-sm text-text-secondary">{label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
