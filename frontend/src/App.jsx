import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import LandingPage from './pages/Landing/LandingPage';

import Vehicles from './pages/Vehicles/Vehicles';
import Trips from './pages/Trips/Trips';
import LiveTrackingPage from './pages/Trips/LiveTrackingPage';
import Maintenance from './pages/Maintenance/Maintenance';
import Drivers from './pages/Drivers/Drivers';

import AdminControlCenter from './pages/Admin/AdminControlCenter';

// Finance Pages
import VehicleProfitabilityPage from './pages/Finance/VehicleProfitabilityPage';
import ExpenseIntelligencePage from './pages/Finance/ExpenseIntelligencePage';
import FinancialReportsPage from './pages/Finance/FinancialReportsPage';

function RoleProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function DynamicRoute({ defaultComponent, safetyOfficerComponent }) {
  const { user } = useAuth();
  if (user?.role === 'SAFETY_OFFICER') {
    return safetyOfficerComponent;
  }
  return defaultComponent;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users" element={<AdminControlCenter tab="users" hideTabs={true} />} />
            <Route path="/admin/permissions" element={<AdminControlCenter tab="permissions" hideTabs={true} />} />
            <Route path="/admin/audit" element={<AdminControlCenter tab="audit" hideTabs={true} />} />
            <Route path="/admin/security" element={<AdminControlCenter tab="security" hideTabs={true} />} />
            <Route path="/admin/settings" element={<AdminControlCenter tab="settings" hideTabs={true} />} />

            {/* Financial Analyst / Fleet Manager Routes */}
            <Route path="/fleet-roi" element={
              <RoleProtectedRoute allowedRoles={['FINANCIAL_ANALYST', 'FLEET_MANAGER']}>
                <VehicleProfitabilityPage />
              </RoleProtectedRoute>
            } />
            <Route path="/expenses" element={
              <RoleProtectedRoute allowedRoles={['FINANCIAL_ANALYST', 'FLEET_MANAGER']}>
                <ExpenseIntelligencePage />
              </RoleProtectedRoute>
            } />
            <Route path="/reports" element={
              <RoleProtectedRoute allowedRoles={['FINANCIAL_ANALYST', 'FLEET_MANAGER']}>
                <FinancialReportsPage />
              </RoleProtectedRoute>
            } />

            {/* Fleet Manager / Dynamic Routes */}
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/tracking" element={
              <RoleProtectedRoute allowedRoles={['DISPATCHER', 'FLEET_MANAGER', 'ADMIN']}>
                <LiveTrackingPage />
              </RoleProtectedRoute>
            } />
            <Route path="/trips" element={<DynamicRoute defaultComponent={<Trips />} safetyOfficerComponent={<Dashboard />} />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/drivers" element={<DynamicRoute defaultComponent={<Drivers />} safetyOfficerComponent={<Dashboard />} />} />
            
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Root route: Landing Page */}
          <Route path="/" element={<LandingPage />} />
          {/* Wildcard fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
