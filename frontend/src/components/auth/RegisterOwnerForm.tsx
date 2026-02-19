import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerOwnerSchema, type RegisterOwnerFormData } from '@/lib/validators';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterOwnerForm() {
    const { register, isLoading } = useAuth();

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterOwnerFormData>({
        resolver: zodResolver(registerOwnerSchema),
    });

    const onSubmit = async (data: RegisterOwnerFormData) => {
        try {
            await register(data);
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    {...registerField('fullName')}
                    type="text"
                    className={`input mt-1 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                    {...registerField('email')}
                    type="email"
                    className={`input mt-1 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                    {...registerField('phone')}
                    type="tel"
                    className={`input mt-1 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        {...registerField('password')}
                        type="password"
                        className={`input mt-1 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                        {...registerField('confirmPassword')}
                        type="password"
                        className={`input mt-1 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                </button>
            </div>

            <div className="mt-6 text-center text-sm">
                <span className="text-gray-500">Already have an account?</span>{' '}
                <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                    Sign in
                </Link>
            </div>
        </form>
    );
}
