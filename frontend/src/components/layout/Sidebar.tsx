/**
 * Sidebar — glass panel navigation for the App Shell.
 *
 * Renders top-level navigation links for the World Pet app.
 * Active route is highlighted using react-router-dom's NavLink.
 */
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
    LayoutDashboard,
    PawPrint,
    CalendarClock,
    Scissors,
    Apple,
    Syringe,
    Settings,
    type LucideIcon,
} from "lucide-react";

// ----- Nav items -----------------------------------------------------------

interface NavItem {
    label: string;
    to: string;
    icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Mascotas", to: "/pets", icon: PawPrint },
    { label: "Citas", to: "/appointments", icon: CalendarClock },
    { label: "Peluquería", to: "/grooming", icon: Scissors },
    { label: "Alimentación", to: "/nutrition", icon: Apple },
    { label: "Vacunas", to: "/vaccines", icon: Syringe },
    { label: "Configuración", to: "/settings", icon: Settings },
];

// ----- Component -----------------------------------------------------------

export function Sidebar() {
    return (
        <aside className="glass-panel flex flex-col w-64 min-h-screen p-4">
            {/* Logo / branding */}
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
                <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center shadow-glow">
                    <PawPrint size={18} className="text-white" />
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">
                    World Pet
                </span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
                    <NavLink key={to} to={to} end={to === "/"}>
                        {({ isActive }) => (
                            <motion.div
                                whileHover={{ x: 3 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium",
                                    "transition-colors duration-150 cursor-pointer",
                                    isActive
                                        ? "bg-brand-subtle text-brand-light"
                                        : "text-text-secondary hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon
                                    size={16}
                                    className={clsx(
                                        isActive ? "text-brand-light" : "text-text-muted"
                                    )}
                                />
                                {label}
                            </motion.div>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
