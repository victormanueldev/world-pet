import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterOwnerForm } from '@/components/auth/RegisterOwnerForm';
import { Link } from 'react-router-dom';

export function RegisterPage() {
    return (
        <AuthLayout
            title="Create an account"
            subtitle="Join World Pet to manage your furry friends"
        >
            <RegisterOwnerForm />
            <div className="mt-8 text-center text-sm text-gray-500">
                Are you a clinic administrator?{' '}
                <Link to="/register/admin" className="font-medium text-brand-600 hover:text-brand-500">
                    Register your clinic here
                </Link>
            </div>
        </AuthLayout>
    );
}
