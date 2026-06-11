import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DoctorLayout from './components/All/Layout';
import ReceptionLayout from './components/All/Layout';
import DoctorDashboard from './pages/Doctor/Dashboard';
import ReceptionDashboard from './pages/Reception/Dashboard';
import PatientDetail from './pages/Doctor/PatientDetail';
import DoctorTasks from './pages/Doctor/tasks';
import DoctorAlertsPage from './components/All/alerts';
import AuthPage from './pages/AuthPage';
import AuthProvider, { useAuth } from './auth/AuthProvider';
import { IProvider } from './components/All/IContext';

// analysis

import ExecutiveDashboard from "./pages/Analysis/ExecutiveDashboard";
import ClinicalDashboard from "./pages/Analysis/ClinicalDashboard";
import OperationsDashboard from "./pages/Analysis/OperationsDashboard";
import PatientDetailsModal from './components/Reception/PatientDetailsModal';


const Patients = () => <div style={{ padding: '40px' }}><h2>All Patients Detailed View</h2></div>;

function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleAwareDashboard() {
  const auth = useAuth();
  if (auth.user?.role?.toLowerCase() === 'receptionist') {
    return <ReceptionDashboard />;
  }
  return <DoctorDashboard />;
}

function RoleAwareLayout() {
  const auth = useAuth();
  if (auth.user?.role?.toLowerCase() === 'receptionist') {
    return <ReceptionLayout />;
  }
  return <DoctorLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IProvider>
        <Routes>
          <Route path="/login" element={<AuthPage defaultMode="login" />} />
          <Route path="/register" element={<AuthPage defaultMode="register" />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <RoleAwareLayout />
              </RequireAuth>
            }
          >
            <Route index element={<RoleAwareDashboard />} />
            <Route path="dashboard" element={<RoleAwareDashboard />} />
            <Route path="doctor" element={<DoctorDashboard />} />
            <Route path="reception" element={<ReceptionDashboard />} />
            <Route path="reception-tasks" element={<ReceptionDashboard />} />
            <Route path="admission" element={<ReceptionDashboard />} />
            <Route path="beds" element={<ReceptionDashboard />} />
            <Route path="discharge" element={<ReceptionDashboard />} />
            <Route path="alerts" element={<ReceptionDashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="TasksPage" element={<DoctorTasks />} />
            <Route path="DoctorAlertsPage" element={<DoctorAlertsPage />} />

            {/* Analytics */}
            <Route path="executive" element={<ExecutiveDashboard />} />
            <Route path="clinical" element={<ClinicalDashboard />} />
            <Route path="operations" element={<OperationsDashboard />} />

          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </IProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
