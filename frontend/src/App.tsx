/**
 * App.tsx — Root route configuration.
 *
 * Wraps all routes in the AppShell layout and uses AnimatePresence
 * for smooth page transitions when the route changes.
 */
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/pages/Dashboard";

export default function App() {
    return (
        <AppShell>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                </Routes>
            </AnimatePresence>
        </AppShell>
    );
}
