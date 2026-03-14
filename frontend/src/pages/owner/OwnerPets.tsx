/**
 * OwnerPets Page
 *
 * Pet owner interface for managing their own pets.
 * This is a placeholder component - full functionality to be implemented.
 */
import { PageHeader } from '@/components/layout/PageHeader';

export function OwnerPets() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="My Pets"
                subtitle="Manage your pets"
            />
            <div className="glass-card p-8 text-center">
                <p className="text-gray-400">Coming soon</p>
            </div>
        </div>
    );
}
