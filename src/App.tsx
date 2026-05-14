import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ServiceForm } from './components/ServiceForm';
import { ServiceDetails } from './components/ServiceDetails';
import { AdminPanel } from './components/AdminPanel';
import { BrandSelect } from './components/BrandSelect';
import { ServiceList } from './components/ServiceList';
import { VehicleCategorySelect } from './components/VehicleCategorySelect';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-slate-500">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/new" 
            element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit/:id" 
            element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/service/:id" 
            element={
              <ProtectedRoute>
                <ServiceDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/category/:type" 
            element={
              <ProtectedRoute>
                <VehicleCategorySelect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/brands/:type/:category" 
            element={
              <ProtectedRoute>
                <BrandSelect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/records/:type/:category/:make" 
            element={
              <ProtectedRoute>
                <ServiceList />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
