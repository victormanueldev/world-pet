import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TenantProvider } from '@/context/TenantContext';
import { AuthProvider } from '@/context/AuthContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { RegisterAdminPage } from '@/pages/auth/RegisterAdminPage';
import { Heart, Activity, Calendar } from 'lucide-react';
import { Dashboard } from '@/pages/Dashboard';

// Moved Dashboard to its own file or keep it here if simple for now
// For clarity, I'll keep the dashboard component here for now as in previous step, 
// but in a real app it should be in pages/Dashboard.tsx
// To match the import above, I should create the file.

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/admin" element={<RegisterAdminPage />} />

            {/* Protected Routes (Placeholder for now) */}
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* Add more protected routes here */}
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
