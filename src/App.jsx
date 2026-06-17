import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthPage from "./features/AuthPage";
import AuthProvider, { useAuth } from "./features/Auth/AuthProvider";
import { SignalRProvider } from "./features/APIS/useSignalR.jsx";
import { IProvider } from "./features/Shared/IContext";

// Reception
import ReceptionLayout from "./features/Shared/Layout";
import PatientDetailsModal from "./features/Reception/components/PatientDetailsModal";
import ReceptionDashboard from "./features/Reception/Dashboard";

// Nurse
import NotFound from "./features/Nurse/pages/NotFound";
import NurseDashboard from "./features/Nurse/pages/Dashboard";
import NursePatientDetails from "./features/Nurse/pages/PatientDetails";
import MedicationAdmin from "./features/Nurse/pages/MedicationAdmin";
import Alerts from "./features/Nurse/pages/Alerts";
import ISBARPage from "./features/Nurse/pages/ISBARPage";
import VitalSignsEntry from "./features/Nurse/pages/VitalSignsEntry";
import NurseNavbar from "./features/Nurse/components/Navbar";
import ErrorBoundary from "./features/Nurse/components/ErrorBoundary";
import { ThemeProvider } from "./features/Nurse/contexts/ThemeContext";
import { TooltipProvider } from "./features/Nurse/components/ui/tooltip";

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
import AdminPatientDetails from "./features/Admin/pages/PatientDetails";
import ClinicalAlerts from "./features/Admin/pages/ClinicalAlerts";
import StaffActivity from "./features/Admin/pages/StaffActivity";
import IncidentLogs from "./features/Admin/pages/IncidentLogs";
import UserManagement from "./features/Admin/pages/UserManagement";
import RolesPermissions from "./features/Admin/pages/RolesPermissions";
import Settings from "./features/Admin/pages/Settings";
import WardPerformance from "./features/Admin/pages/WardPerformance";
import ISBARReviews from "./features/Admin/pages/ISBARReviews";
import { Sidebar, Navbar } from "./features/Admin/components/Layout";

const queryClient = new QueryClient();

// ─── Placeholder ─────────────────────────────────────────────────────────────
const Patients = () => (
  <div style={{ padding: "40px" }}>
    <h2>All Patients Detailed View</h2>
  </div>
);

// ─── Auth Guard ───────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth?.user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
// Used ONCE — as the route element for /admin/*
// RoleAwareLayout will NOT render this; admin users hit the /admin route tree.
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Nurse Layout ─────────────────────────────────────────────────────────────
// NurseNavbar MUST render <Outlet /> internally for child pages to appear.
function NurseLayout() {
  return <NurseNavbar />;
}

// ─── Role-Aware Dashboard ─────────────────────────────────────────────────────
function RoleAwareDashboard() {
  const auth = useAuth();
  const role = auth?.user?.role?.toLowerCase();

  if (role === "receptionist") return <ReceptionDashboard />;
  if (role === "doctor") return <DoctorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  if (role === "nurse") return <NurseDashboard />;
  return <DoctorDashboard />;
}

// ─── Role-Aware Layout ────────────────────────────────────────────────────────
// This is the shell for non-admin, non-nurse roles.
// Admin and Nurse have their own dedicated route trees below.
function RoleAwareLayout() {
  const auth = useAuth();
  const role = auth?.user?.role?.toLowerCase();

  // Admin and nurse are handled by their own layout routes — redirect to root
  // so they land in the correct route tree.
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "nurse") return <Navigate to="/nurse" replace />;

  const Layout = role === "receptionist" ? ReceptionLayout : DoctorLayout;
  return <Layout user={auth.user} />;
}

// ─── SignalR Bridge ───────────────────────────────────────────────────────────
function SignalRBridge({ children }) {
  const { token } = useAuth();
  return <SignalRProvider token={token}>{children}</SignalRProvider>;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SignalRBridge>
            <IProvider>
              <ErrorBoundary>
                <ThemeProvider defaultTheme="light" switchable={true}>
                  <TooltipProvider>
                    <Routes>
                      {/* ── Public ─────────────────────────────────────────── */}
                      <Route
                        path="/login"
                        element={<AuthPage defaultMode="login" />}
                      />
                      <Route
                        path="/register"
                        element={<AuthPage defaultMode="register" />}
                      />

                      {/* ── Admin route tree (own layout, no RoleAwareLayout) ─ */}
                      <Route
                        path="/admin"
                        element={
                          <RequireAuth>
                            <AdminLayout />
                          </RequireAuth>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="heatmap" element={<WardHeatmap />} />
                        <Route
                          path="patient/:patientId"
                          element={<AdminPatientDetails />}
                        />
                        <Route path="alerts" element={<ClinicalAlerts />} />
                        <Route path="staff" element={<StaffActivity />} />
                        <Route path="incidents" element={<IncidentLogs />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="roles" element={<RolesPermissions />} />
                        <Route path="settings" element={<Settings />} />
                        <Route
                          path="ward-performance"
                          element={<WardPerformance />}
                        />
                        <Route path="isbar" element={<ISBARReviews />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      {/* ── Nurse route tree (own layout, no RoleAwareLayout) ── */}
                      <Route
                        path="/nurse"
                        element={
                          <RequireAuth>
                            <NurseLayout />
                          </RequireAuth>
                        }
                      >
                        <Route index element={<NurseDashboard />} />
                        <Route path="alerts" element={<Alerts />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route
                          path="patient/:id"
                          element={<NursePatientDetails />}
                        />
                        <Route
                          path="patient/:id/medication/:medicationId"
                          element={<MedicationAdmin />}
                        />
                        <Route
                          path="patient/:id/isbar"
                          element={<ISBARPage />}
                        />
                        <Route
                          path="patient/:id/vitals"
                          element={<VitalSignsEntry />}
                        />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      {/* ── Receptionist / Doctor shell ────────────────────── */}
                      <Route
                        path="/"
                        element={
                          <RequireAuth>
                            <RoleAwareLayout />
                          </RequireAuth>
                        }
                      >
                        {/* Default dashboard per role */}
                        <Route index element={<RoleAwareDashboard />} />
                        <Route
                          path="dashboard"
                          element={<RoleAwareDashboard />}
                        />

                        {/* Shared */}
                        <Route path="patients" element={<Patients />} />
                        <Route path="TasksPage" element={<TasksPage />} />
                        <Route path="AlertsPage" element={<AlertsPage />} />

                        {/* Doctor */}
                        <Route path="doctor" element={<DoctorDashboard />} />
                        <Route
                          path="patients/:id"
                          element={<PatientDetail />}
                        />

                        {/* Reception */}
                        <Route
                          path="reception"
                          element={<ReceptionDashboard />}
                        />
                        <Route
                          path="reception/patient/:id"
                          element={<PatientDetailsModal />}
                        />
                        <Route
                          path="reception-tasks"
                          element={<ReceptionDashboard />}
                        />
                        <Route
                          path="admission"
                          element={<ReceptionDashboard />}
                        />
                        <Route path="beds" element={<ReceptionDashboard />} />
                        <Route
                          path="discharge"
                          element={<ReceptionDashboard />}
                        />
                        <Route path="alerts" element={<AlertsPage />} />

                        {/* Analytics */}
                        <Route
                          path="executive"
                          element={<ExecutiveDashboard />}
                        />
                        <Route
                          path="clinical"
                          element={<ClinicalDashboard />}
                        />
                        <Route
                          path="operations"
                          element={<OperationsDashboard />}
                        />

                        {/* Fallback */}
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      {/* Global fallback */}
                      <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                      />
                    </Routes>
                  </TooltipProvider>
                </ThemeProvider>
              </ErrorBoundary>
            </IProvider>
          </SignalRBridge>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
