import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    PawPrint,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: PawPrint, label: 'Pets', path: '/pets' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {!isSidebarOpen && window.innerWidth < 1024 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(true)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 40,
                            display: window.innerWidth < 1024 ? 'block' : 'none'
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '80px',
                backgroundColor: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                position: window.innerWidth < 1024 ? 'fixed' : 'relative',
                height: '100vh',
                left: 0,
                transform: window.innerWidth < 1024 && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
            }}>
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        backgroundColor: 'var(--primary)',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'white'
                    }}>
                        <PawPrint size={24} />
                    </div>
                    {isSidebarOpen && <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>World Pet</span>}
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.875rem 1rem',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: '0.5rem',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                fontWeight: isActive ? 600 : 500,
                                transition: 'all 0.2s ease',
                                textDecoration: 'none'
                            })}
                        >
                            <item.icon size={20} />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            width: '100%',
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-lg)',
                            color: '#ef4444',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header */}
                <header style={{
                    height: '70px',
                    backgroundColor: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', display: window.innerWidth < 768 ? 'none' : 'block' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.5rem 1rem 0.5rem 2.5rem',
                                    width: '240px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ textAlign: 'right', display: window.innerWidth < 768 ? 'none' : 'block' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{user?.name || 'Admin User'}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{user?.role || 'Administrator'}</p>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <UserIcon size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
