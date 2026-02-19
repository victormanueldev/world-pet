import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterAdminForm } from '@/components/auth/RegisterAdminForm';

export function RegisterAdminPage() {
    return (
        <AuthLayout
            title="Register your Clinic"
            subtitle="Start managing your clinic with World Pet"
        >
            <RegisterAdminForm />
        </AuthLayout>
    );
}
