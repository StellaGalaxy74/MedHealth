import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientViewPage from './pages/PatientViewPage';

function HomeRedirect() {
  const { profile, loading } = useAuth();
  
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;
  
  if (profile.role === 'patient') {
    return <Navigate to="/patient/dashboard" replace />;
  } else {
    return <Navigate to="/doctor/dashboard" replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<HomeRedirect />} />
              
              {/* Patient Routes */}
              <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/upload" element={<PatientUpload />} />
                <Route path="/patient/timeline" element={<PatientTimeline />} />
              </Route>
              
              {/* Doctor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/patient/:id" element={<PatientViewPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
