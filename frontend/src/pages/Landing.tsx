/**
 * Landing page for World Pet platform.
 *
 * This is the root page that unauthenticated users see when they
 * visit the platform. It shows marketing content and links to login/register.
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function Landing() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="py-20 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        World Pet
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        The modern platform for veterinary clinics to manage their patients,
                        appointments, and client relationships.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/login">
                            <Button variant="primary" size="lg">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="secondary" size="lg">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-16 border-t border-gray-800">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="text-3xl mb-4">🐾</div>
                            <h3 className="text-xl font-semibold mb-2">Pet Management</h3>
                            <p className="text-gray-400">
                                Keep track of all your patients with detailed profiles,
                                medical history, and vaccination records.
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-3xl mb-4">📅</div>
                            <h3 className="text-xl font-semibold mb-2">Appointments</h3>
                            <p className="text-gray-400">
                                Schedule and manage appointments with ease.
                                Automated reminders keep everyone on track.
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-3xl mb-4">🏥</div>
                            <h3 className="text-xl font-semibold mb-2">Clinic Portal</h3>
                            <p className="text-gray-400">
                                Give your clients access to register their pets
                                and book appointments online.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="py-8 border-t border-gray-800 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} World Pet. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
