/**
 * App.tsx — Root route configuration.
 *
 * Wraps all routes in the AppShell layout and uses AnimatePresence
 * for smooth page transitions when the route changes.
 * Protected routes require authentication, public routes redirect
 * authenticated users away.
 */
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { Dashboard } from "@/pages/Dashboard";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";

export default function App() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                {/* Public routes - redirect to dashboard if authenticated */}
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

                {/* Protected routes - require authentication */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <AppShell>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    {/* Add more protected routes here */}
                                </Routes>
                            </AppShell>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}
