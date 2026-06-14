import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import React, { useState } from "react";

import AuthPage from "./features/AuthPage";
import AuthProvider, { useAuth } from "./features/Auth/AuthProvider";
import { IProvider } from "./features/Shared/IContext";

// Reception
import ReceptionLayout from "./features/Shared/Layout";
import PatientDetailsModal from "./features/Reception/components/PatientDetailsModal";
import ReceptionDashboard from "./features/Reception/Dashboard";

//nurse
import NurseDashboard from "./features/Nurse/Dashboard";
import NursePatientDetails from "./features/Nurse/PaitentDetail";
import NurseLayout from "./features/Nurse/components/navbar";

// Doctor
import DoctorDashboard from "./features/Doctor/Dashboard";
import PatientDetail from "./features/Doctor/PatientDetail";
import DoctorLayout from "./features/Shared/Layout";

// Shared
import TasksPage from "./features/Shared/tasks";
import AlertsPage from "./features/Shared/alerts";

// Analysis
import ExecutiveDashboard from "./features/Analysis/ExecutiveDashboard";
import ClinicalDashboard from "./features/Analysis/ClinicalDashboard";
import OperationsDashboard from "./features/Analysis/OperationsDashboard";

// Admin
import AdminDashboard from "./features/Admin/pages/Dashboard";
import WardHeatmap from "./features/Admin/pages/WardHeatmap";
import PatientDetails from "./features/Admin/pages/PatientDetails";
import ClinicalAlerts from "./features/Admin/pages/ClinicalAlerts";
import StaffActivity from "./features/Admin/pages/StaffActivity";
import IncidentLogs from "./features/Admin/pages/IncidentLogs";
import UserManagement from "./features/Admin/pages/UserManagement";
import RolesPermissions from "./features/Admin/pages/RolesPermissions";
import Settings from "./features/Admin/pages/Settings";
import WardPerformance from "./features/Admin/pages/WardPerformance";
import ISBARReviews from "./features/Admin/pages/ISBARReviews";
import { Sidebar, Navbar } from "./features/Admin/components/Layout";

// ─── Placeholder ────────────────────────────────────────────────────────────
const Patients = () => (
  <div style={{ padding: "40px" }}>
    <h2>All Patients Detailed View</h2>
  </div>
);

// ─── Auth Guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth?.user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Role Guard ──────────────────────────────────────────────────────────────
function RequireRole({ roles, children }) {
  const auth = useAuth();
  const role = auth?.user?.role?.toLowerCase();
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

// ─── Role-Aware Dashboard ────────────────────────────────────────────────────
function RoleAwareDashboard() {
  const auth = useAuth();
  const role = auth?.user?.role?.toLowerCase();

  if (role === "receptionist") return <ReceptionDashboard />;
  if (role === "doctor") return <DoctorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  if (role === "nurse") return <NurseDashboard />;
  return <DoctorDashboard />;
}

// ─── Admin Layout ────────────────────────────────────────────────────────────
// Standalone layout that uses <Outlet /> so React Router can inject child routes.
function AdminLayout() {
  const auth = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        user={auth.user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={auth.user} onLogout={auth.logout} />
        <main className="flex-1 overflow-auto">
          {/* ✅ Outlet renders the matched child route */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Role-Aware Layout ───────────────────────────────────────────────────────
// Wraps all protected routes. Each layout must render <Outlet /> internally.
// ReceptionLayout / DoctorLayout are expected to already use <Outlet />.
function RoleAwareLayout() {
  const auth = useAuth();
  const role = auth?.user?.role?.toLowerCase();

  if (role === "admin") return <AdminLayout />;
  if (role === "nurse") return <NurseLayout />;

  // ReceptionLayout and DoctorLayout must render <Outlet /> inside them.
  const Layout = role === "receptionist" ? ReceptionLayout : DoctorLayout;
  return <Layout user={auth.user} />;
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthPage defaultMode="login" />} />
            <Route
              path="/register"
              element={<AuthPage defaultMode="register" />}
            />

            {/* Protected shell — RoleAwareLayout renders <Outlet /> inside */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <RoleAwareLayout />
                </RequireAuth>
              }
            >
              {/* Default & dashboard */}
              <Route index element={<RoleAwareDashboard />} />
              <Route path="dashboard" element={<RoleAwareDashboard />} />

              {/* Shared */}
              <Route path="patients" element={<Patients />} />
              <Route path="TasksPage" element={<TasksPage />} />
              <Route path="AlertsPage" element={<AlertsPage />} />

              {/* Doctor */}
              <Route path="doctor" element={<DoctorDashboard />} />
              <Route path="patients/:id" element={<PatientDetail />} />

              {/* nurse */}
              <Route path="nurse" element={<NurseDashboard />} />
              <Route
                path="/nurse/patient/:id"
                element={<NursePatientDetails />}
              />

              {/* Reception */}
              <Route path="reception" element={<ReceptionDashboard />} />
              <Route path="patient/:id" element={<PatientDetailsModal />} />
              <Route path="reception-tasks" element={<ReceptionDashboard />} />
              <Route path="admission" element={<ReceptionDashboard />} />
              <Route path="beds" element={<ReceptionDashboard />} />
              <Route path="discharge" element={<ReceptionDashboard />} />
              <Route path="alerts" element={<ReceptionDashboard />} />

              {/* Analytics */}
              <Route path="executive" element={<ExecutiveDashboard />} />
              <Route path="clinical" element={<ClinicalDashboard />} />
              <Route path="operations" element={<OperationsDashboard />} />

              {/* Admin — nested so they inherit AdminLayout's Outlet */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/heatmap" element={<WardHeatmap />} />
              <Route
                path="admin/patient/:patientId"
                element={<PatientDetails />}
              />
              <Route path="admin/alerts" element={<ClinicalAlerts />} />
              <Route path="admin/staff" element={<StaffActivity />} />
              <Route path="admin/incidents" element={<IncidentLogs />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/roles" element={<RolesPermissions />} />
              <Route path="admin/settings" element={<Settings />} />
              <Route
                path="admin/ward-performance"
                element={<WardPerformance />}
              />
              <Route path="admin/isbar" element={<ISBARReviews />} />

              {/* Fallback inside app */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* Global fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </IProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
