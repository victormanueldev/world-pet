/**
 * Dashboard page — shared landing page for all users.
 *
 * Shows role-specific content based on user's role.
 * Admin users see system-wide stats, pet owners see their pet overview.
 */
import { motion } from "framer-motion";
import { PawPrint, Calendar, Syringe, Settings } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCanAccess } from "@/hooks/useCanAccess";

export function Dashboard() {
    const isAdmin = useCanAccess(['admin']);
    const isUser = useCanAccess(['user']);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <PageHeader
                title="Dashboard"
                subtitle="Welcome to World Pet — your veterinary management platform."
            />

            {/* Admin-specific widgets */}
            {isAdmin && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">System Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <PawPrint size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">Total Pets</p>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <Calendar size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">Appointments Today</p>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <Syringe size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">Vaccines Due</p>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <Settings size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">Active Users</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* User/Pet owner-specific widgets */}
            {isUser && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">My Pets Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <PawPrint size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">My Pets</p>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <Calendar size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">Upcoming Appointments</p>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={staggerItem}
                            className="glass-card p-6 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                                <Syringe size={18} className="text-brand-light" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">—</p>
                                <p className="text-sm text-text-secondary">Vaccines Due</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
