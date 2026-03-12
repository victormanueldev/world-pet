/**
 * App.tsx — Root route configuration.
 *
 * Routing structure:
 * - / : Landing page (public)
 * - /login : Root login (public)
 * - /register : Root register (public)
 * - /:slug/login : Tenant-specific login (public)
 * - /:slug/register : Tenant-specific registration (public)
 * - /:slug/* : Protected tenant routes
 */
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { Dashboard } from "@/pages/Dashboard";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";

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
                                    <Route path="/" element={<Dashboard />} />
                                </Routes>
                            </AppShell>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}
