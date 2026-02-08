import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { AuthContext } from './context/auth-context';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/layout/AdminLayout';
import PetProfile from './pages/PetProfile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = React.useContext(AuthContext);

  if (auth?.isLoading) return <div>Loading...</div>;
  if (!auth?.isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout>
                <Navigate to="/dashboard" />
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminLayout>
                <div className="premium-card">
                  <h1>Admin Dashboard</h1>
                  <p>Welcome to the World Pet administration panel.</p>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/pets" element={
            <ProtectedRoute>
              <AdminLayout>
                <PetProfile />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
