import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppLayout    from './components/layout/AppLayout';
import LandingPage  from './pages/LandingPage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HealthPage   from './pages/HealthPage';
import ActivityPage from './pages/ActivityPage';
import DietPage     from './pages/DietPage';
import GoalsPage    from './pages/GoalsPage';
import AlertsPage   from './pages/AlertsPage';
import ProfilePage  from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background:'#1E293B', color:'#F8FAFC', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' },
            success: { iconTheme:{ primary:'#00D4AA', secondary:'#0F172A' } },
            error:   { iconTheme:{ primary:'#EF4444', secondary:'#0F172A' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage/>}  />
          <Route path="/login"    element={<LoginPage/>}    />
          <Route path="/register" element={<RegisterPage/>} />

          {/* Protected (AppLayout handles auth guard) */}
          <Route element={<AppLayout/>}>
            <Route path="/dashboard" element={<DashboardPage/>} />
            <Route path="/health"    element={<HealthPage/>}    />
            <Route path="/activity"  element={<ActivityPage/>}  />
            <Route path="/diet"      element={<DietPage/>}      />
            <Route path="/goals"     element={<GoalsPage/>}     />
            <Route path="/alerts"    element={<AlertsPage/>}    />
            <Route path="/profile"   element={<ProfilePage/>}   />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
