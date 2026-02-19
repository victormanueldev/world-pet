import { Heart, Activity, Calendar } from 'lucide-react';

export function Dashboard() {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, Pet Lover! 🐾</h1>
                <p className="text-gray-500 mt-2">Here's what's happening with your furry friends today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-brand-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Pets</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">3</h3>
                        </div>
                        <div className="bg-brand-100 p-2 rounded-lg">
                            <Heart className="text-brand-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-accent-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Upcoming Visits</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">2</h3>
                        </div>
                        <div className="bg-accent-100 p-2 rounded-lg">
                            <Calendar className="text-accent-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-blue-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Health Status</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">Good</h3>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Activity className="text-blue-600" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50">
                        <p className="text-sm text-gray-500">This Week</p>
                    </div>
                    <div className="p-8 text-center text-gray-400">
                        No recent activity to show.
                    </div>
                </div>
            </div>
        </div>
    );
}
