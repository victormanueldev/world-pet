import { ReactNode } from 'react';
import { useTenant } from '@/context/TenantContext';
import { PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const { tenant } = useTenant();

    return (
        <div className="min-h-screen flex text-gray-900">
            {/* Left Side - Branding */}
            <div
                className="hidden lg:flex lg:w-1/2 relative bg-gray-900 text-white flex-col justify-between p-12"
                style={{
                    background: tenant?.primaryColor
                        ? `linear-gradient(135deg, ${tenant.primaryColor} 0%, #0f172a 100%)`
                        : 'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)'
                }}
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 text-white">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <PawPrint className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold">World Pet</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <blockquote className="text-2xl font-serif font-medium leading-relaxed">
                        "{tenant?.name || 'World Pet'} helps us keep track of everything our furry friends need. It's truly a game changer for our clinic."
                    </blockquote>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/20"></div>
                        <div>
                            <p className="font-semibold">Dr. Sarah Smith</p>
                            <p className="text-white/60 text-sm">Veterinarian</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-white/50">
                    &copy; {new Date().getFullYear()} {tenant?.name || 'World Pet Inc'}. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="bg-brand-500 p-2 rounded-lg">
                                <PawPrint className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
                        {subtitle && (
                            <p className="mt-2 text-sm text-gray-600">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="mt-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
