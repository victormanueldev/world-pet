/**
 * AppShell — root layout component.
 *
 * Renders the Sidebar alongside a scrollable main content area.
 * All authenticated pages should be wrapped in this shell.
 */
import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex min-h-screen" style={{ background: "var(--color-bg-1)" }}>
            {/* Sticky glass sidebar */}
            <div className="sticky top-0 h-screen shrink-0">
                <Sidebar />
            </div>

            {/* Main scrollable area */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
