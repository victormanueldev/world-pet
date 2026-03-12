/**
 * App.tsx — Root route configuration.
 *
 * Routing structure:
 * - / : Landing page (public)
 * - /login : Root login (public)
 * - /register : Root register (public)
 * - /:slug/login : Tenant-specific login (public)
 * - /:slug/register : Tenant-specific registration (public)
 * - /:slug/* : Protected tenant routes (role-based)
 */
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { Dashboard } from "@/pages/Dashboard";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import {
    AdminAppointments,
    AdminPets,
    AdminVaccines,
    AdminSettings,
} from "@/pages/admin";
import {
    OwnerAppointments,
    OwnerPets,
    OwnerVaccines,
    OwnerProfile,
} from "@/pages/owner";

export default function App() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                {/* Root landing page */}
                <Route path="/" element={<Landing />} />

                {/* Root auth routes - redirect to dashboard if authenticated */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Tenant-specific public routes */}
                <Route
                    path="/:slug/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/:slug/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Protected tenant routes */}
                <Route
                    path="/:slug/*"
                    element={
                        <ProtectedRoute>
                            <AppShell>
                                <Routes>
                                    {/* Shared dashboard */}
                                    <Route path="/" element={<Dashboard />} />

                                    {/* Admin routes */}
                                    <Route
                                        path="/admin/*"
                                        element={
                                            <ProtectedRoute requiredRoles={['admin']}>
                                                <Routes>
                                                    <Route path="appointments" element={<AdminAppointments />} />
                                                    <Route path="pets" element={<AdminPets />} />
                                                    <Route path="vaccines" element={<AdminVaccines />} />
                                                    <Route path="settings" element={<AdminSettings />} />
                                                </Routes>
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Pet owner routes */}
                                    <Route
                                        path="/owner/*"
                                        element={
                                            <ProtectedRoute requiredRoles={['pet_owner']}>
                                                <Routes>
                                                    <Route path="appointments" element={<OwnerAppointments />} />
                                                    <Route path="pets" element={<OwnerPets />} />
                                                    <Route path="vaccines" element={<OwnerVaccines />} />
                                                    <Route path="profile" element={<OwnerProfile />} />
                                                </Routes>
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </AppShell>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}
