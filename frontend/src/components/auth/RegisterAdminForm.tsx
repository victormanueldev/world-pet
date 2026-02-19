import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAdminSchema, type RegisterAdminFormData } from '@/lib/validators';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterAdminForm() {
    const { register, isLoading } = useAuth();

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterAdminFormData>({
        resolver: zodResolver(registerAdminSchema),
    });

    const onSubmit = async (data: RegisterAdminFormData) => {
        try {
            await register(data);
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Clinic Information</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">Clinic Name</label>
                        <input
                            {...registerField('clinicName')}
                            type="text"
                            className={`input mt-1 ${errors.clinicName ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Happy Paws Clinic"
                        />
                        {errors.clinicName && <p className="mt-1 text-sm text-red-600">{errors.clinicName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Subdomain</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                {...registerField('subdomain')}
                                type="text"
                                className={`input rounded-r-none ${errors.subdomain ? 'border-red-500 z-10 focus:ring-red-500' : ''}`}
                                placeholder="happy-paws"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                .worldpet.com
                            </span>
                        </div>
                        {errors.subdomain && <p className="mt-1 text-sm text-red-600">{errors.subdomain.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Administrator Information</h3>
                <div>
                    <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        {...registerField('adminName')}
                        type="text"
                        className={`input mt-1 ${errors.adminName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.adminName && <p className="mt-1 text-sm text-red-600">{errors.adminName.message}</p>}
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
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        {...registerField('phone')}
                        type="tel"
                        className={`input mt-1 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
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
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register Clinic'}
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
