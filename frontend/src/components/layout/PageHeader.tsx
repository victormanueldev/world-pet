/**
 * PageHeader — consistent page-level header.
 *
 * Displays a page title and optional subtitle/actions slot.
 */
import { type ReactNode } from "react";

interface PageHeaderProps {
    /** Main page title */
    title: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Optional right-side action slot (e.g., buttons) */
    actions?: ReactNode;
}

/**
 * PageHeader component
 *
 * @example
 * <PageHeader
 *   title="Mis Mascotas"
 *   subtitle="Gestiona los perfiles de tus mascotas"
 *   actions={<Button>Agregar mascota</Button>}
 * />
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-white">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}
