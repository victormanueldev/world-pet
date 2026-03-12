/**
 * Sidebar — glass panel navigation for the App Shell.
 *
 * Auto-generates navigation from centralized route configuration.
 * Active route is highlighted using react-router-dom's NavLink.
 * Shows user menu when authenticated.
 */
import { NavLink, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
    LayoutDashboard,
    PawPrint,
    CalendarClock,
    Syringe,
    Settings,
    User,
    type LucideIcon,
} from "lucide-react";
import { TenantSwitcher } from "../tenant/TenantSwitcher";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { useFilteredRoutes } from "@/hooks/useFilteredRoutes";

// ----- Icon mapping --------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
    home: LayoutDashboard,
    calendar: CalendarClock,
    pets: PawPrint,
    syringe: Syringe,
    settings: Settings,
    user: User,
};

// ----- Component -----------------------------------------------------------

export function Sidebar() {
    const { isAuthenticated } = useAuth();
    const { slug } = useParams<{ slug: string }>();
    const filteredRouteGroups = useFilteredRoutes();

    return (
        <aside className="glass-panel flex flex-col w-64 min-h-screen p-4">
            {/* Logo / branding */}
            <div className="flex items-center gap-3 px-2 py-4 mb-4">
                <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center shadow-glow">
                    <PawPrint size={18} className="text-white" />
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">
                    World Pet
                </span>
            </div>

            {/* Tenant Switcher - only show when authenticated */}
            {isAuthenticated && (
                <div className="px-2 mb-4">
                    <TenantSwitcher />
                </div>
            )}

            {/* Auto-generated navigation from route configuration */}
            <nav className="flex-1 space-y-4">
                {filteredRouteGroups.map((group) => (
                    <div key={group.label}>
                        {/* Group label (except for Shared) */}
                        {group.label !== 'Shared' && (
                            <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                {group.label}
                            </div>
                        )}

                        {/* Routes within the group */}
                        <div className="space-y-1">
                            {group.routes.map((route) => {
                                const Icon = route.icon ? ICON_MAP[route.icon] : LayoutDashboard;
                                const to = slug ? `/${slug}${route.path}` : route.path;

                                return (
                                    <NavLink key={route.path} to={to} end={route.path === '/'}>
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
                                                {route.label}
                                            </motion.div>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User menu - only show when authenticated */}
            {isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <UserMenu />
                </div>
            )}
        </aside>
    );
}
