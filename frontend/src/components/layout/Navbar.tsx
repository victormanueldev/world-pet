import { PawPrint, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-brand-500 p-2 rounded-lg">
                                <PawPrint className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                                World Pet
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/pets" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                            My Pets
                        </Link>
                        <Link to="/appointments" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                            Appointments
                        </Link>
                        <button className="btn-primary flex items-center gap-2">
                            <User size={18} />
                            <span>Sign In</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 animate-slide-up">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/pets"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
                        >
                            My Pets
                        </Link>
                        <Link
                            to="/appointments"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
                        >
                            Appointments
                        </Link>
                        <button className="w-full text-left px-3 py-2 text-base font-medium text-brand-600 hover:bg-brand-50 rounded-md">
                            Sign In
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
