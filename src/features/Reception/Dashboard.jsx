import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { SearchContext } from "../Shared/Layout";
import PatientDetailsModal from "./components/PatientDetailsModal";
import {
  User,
  BedDouble,
  Users,
  CheckCircle,
  AlertCircle,
  UserPlus,
  DoorOpen,
  ChartBar,
  ArrowRight,
  ShieldCheck,
  Activity,
  ChevronRight,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  HandleDepartmentByBedId,
  formatPatientId,
  formatBedId,
} from "../APIS/Handler";
import { useData } from "../Shared/IContext";

// Import all the tab components
import AdmissionWizard from "./components/AdmissionWizard";
import BedManagement from "./components/BedManagement";
import DischargeMonitor from "./components/DischargeMonitor";
import AlertsPanel from "../Shared/alerts";
import ExecutivePage from "../Analysis/ExecutiveDashboard";

// ─── ENHANCED COMPONENTS ──────────────────────────────────────────────

const KpiCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3">
      <div
        className="rounded-2xl p-2.5 flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        {Icon && <Icon size={20} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">
          {label}
        </div>
        <div className="text-2xl font-black leading-none" style={{ color }}>
          {value}
        </div>
      </div>
    </div>
    <div className="mt-3 text-[10px] font-bold text-slate-400 tracking-tight border-t border-slate-50 pt-2">
      {sub}
    </div>
  </div>
);

const AdmittedPatientRow = ({ patient, onViewDetails }) => (
  <div
    className="group flex items-center gap-4 p-4 rounded-[1.5rem] border border-slate-100 mb-3 transition-all duration-300 cursor-pointer bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50"
    onClick={() => onViewDetails(patient)}
  >
    <div className="relative">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
          patient.status === "Critical"
            ? "bg-red-50 text-red-500"
            : patient.status === "Unstable"
              ? "bg-amber-50 text-amber-500"
              : "bg-emerald-50 text-emerald-500"
        }`}
      >
        <User size={24} />
      </div>
      <div
        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          patient.status === "Critical"
            ? "bg-red-500"
            : patient.status === "Unstable"
              ? "bg-amber-500"
              : "bg-emerald-500"
        }`}
      />
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
        {patient.patientName ||
          patient.fullName ||
          patient.name ||
          "Unknown Patient"}
      </h3>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {formatPatientId(patient.id)}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
          Bed {formatBedId(patient.bed || patient.bedId || "TBD")}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
          {HandleDepartmentByBedId(patient.bedId) || "General Ward"}
        </span>
      </div>
    </div>

    <div
      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
        patient.status === "Critical"
          ? "bg-red-50 text-red-700"
          : patient.status === "Unstable"
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {patient.status}
    </div>
    <ChevronRight
      size={16}
      className="text-slate-300 group-hover:text-blue-400 transition-colors"
    />
  </div>
);

const DischargeRow = ({ patient, onDischarge, onViewDetails }) => (
  <div className="group flex items-center gap-4 p-4 rounded-[1.5rem] border border-slate-100 mb-3 bg-white hover:border-emerald-200 transition-all duration-300">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
      <CheckCircle size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-black text-slate-900 flex items-center truncate">
        {patient.patientName ||
          patient.fullName ||
          patient.name ||
          "Unknown Patient"}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Bed {formatBedId(patient.bed || patient.bedId || "TBD")}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
          Cleared
        </span>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        className="text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
        onClick={onDischarge}
      >
        Discharge
      </button>
      <button
        className="text-[10px] px-3 py-2 rounded-xl font-black uppercase tracking-widest transition-all border border-slate-200 text-slate-500 hover:bg-slate-50"
        onClick={onViewDetails}
      >
        View
      </button>
    </div>
  </div>
);

const QuickBtn = ({ icon: Icon, label, onClick, color }) => (
  <button
    className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
    onClick={onClick}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 flex-shrink-0"
      style={{ background: `${color}15`, color }}
    >
      <Icon size={18} />
    </div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-600">
      {label}
    </span>
  </button>
);

// ─── MAIN OVERVIEW TAB ───────────────────────────────────────────────

const DashboardOverview = ({
  patients,
  alerts,
  handleAdmit,
  handleDischarge,
  handleView,
  handleQuickAction,
  loading,
}) => {
  const searchTerm = useContext(SearchContext)?.searchTerm || "";
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const filteredPatients = patients.filter((p) => {
    if (!searchTerm) return true;
    return `${p.fullName || p.name || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const admittedPatients = filteredPatients.filter((p) => p.bedId);
  const openAlerts = alerts.length;
  const dischargePatients = patients
    .filter((p) => p.flowStatus === "Stable")
    .sort((a, b) => {
      const left = new Date(a.admittedAt).getTime() || 0;
      const right = new Date(b.admittedAt).getTime() || 0;
      return left - right;
    });

  const handleViewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };
  if (loading && patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <RefreshCw size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
          Loading Data...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <KpiCard
          label="Total Admitted"
          value={admittedPatients.length}
          sub="Currently in ward"
          icon={Users}
          color="#3b82f6"
        />
        <KpiCard
          label="Ready To Discharge"
          value={dischargePatients.length}
          sub="Medically cleared"
          icon={DoorOpen}
          color="#10b981"
        />
        <KpiCard
          label="Active Alerts"
          value={openAlerts}
          sub="Requires attention"
          icon={AlertCircle}
          color="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT COLUMN - ADMITTED PATIENTS */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">
                  Admitted Patients
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Real-time ward status
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {admittedPatients.length} ACTIVE
              </div>
            </div>

            <div className="space-y-1">
              {admittedPatients.length > 0 ? (
                admittedPatients
                  .slice(-6)
                  .reverse()
                  .map((patient) => (
                    <AdmittedPatientRow
                      key={patient.id}
                      patient={patient}
                      onViewDetails={handleViewPatientDetails}
                    />
                  ))
              ) : (
                <div className="py-10 text-center">
                  <Activity size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                    No patients admitted
                  </p>
                </div>
              )}
            </div>

            <button
              className="w-full mt-6 py-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
              onClick={() => handleQuickAction("beds")}
            >
              View All Ward Records <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - ACTIONS & DISCHARGE */}
        <div className="xl:col-span-5 space-y-8">
          {/* QUICK ACTIONS */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-slate-900 text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickBtn
                icon={UserPlus}
                label="New Admission"
                color="#3b82f6"
                onClick={() => handleQuickAction("admission")}
              />
              <QuickBtn
                icon={BedDouble}
                label="Bed Map"
                color="#3b82f6"
                onClick={() => handleQuickAction("beds")}
              />
              <QuickBtn
                icon={AlertCircle}
                label="Active Alerts"
                color="#3b82f6"
                onClick={() => handleQuickAction("alerts")}
              />
              <QuickBtn
                icon={ChartBar}
                label="Daily Reports"
                color="#3b82f6"
                onClick={() => handleQuickAction("reports")}
              />
              <QuickBtn
                icon={DoorOpen}
                label="Discharges"
                color="#3b82f6"
                onClick={() => handleQuickAction("discharge")}
              />
              <QuickBtn
                icon={ShieldCheck}
                label="Activity Logs"
                color="#3b82f6"
                onClick={() => handleQuickAction("logs")}
              />
            </div>
          </div>

          {/* DISCHARGE MONITOR */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                  Discharge Queue
                </h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Medically Cleared
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                {dischargePatients.length}
              </div>
            </div>

            <div className="space-y-1">
              {dischargePatients.length > 0 ? (
                dischargePatients
                  .slice(0, 3)
                  .map((patient) => (
                    <DischargeRow
                      key={patient.id}
                      patient={patient}
                      onDischarge={() => handleDischarge(patient)}
                      onViewDetails={() => handleViewPatientDetails(patient)}
                    />
                  ))
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <CheckCircle
                    size={32}
                    className="mx-auto text-slate-200 mb-2"
                  />
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    Queue is clear
                  </p>
                </div>
              )}
              <button
                className="w-full mt-6 py-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => handleQuickAction("discharge")}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
      />
    </div>
  );
};

// ─── RECEPTION DASHBOARD SHELL ───────────────────────────────

export default function ReceptionDashboard() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    patients,
    patientsLoading,
    alerts,
    alertsLoading,
    searchTerm,
    setSearchTerm,
    filteredPatients,
    refreshData,
    isDoctor,
    isReceptionist,
    userRole,
  } = useData();

  // FIX: Ensure data is fetched on mount
  useEffect(() => {
    if (refreshData) {
      refreshData();
    }
  }, []);

  const handleAdmit = (patient) => {
    navigate("/admission", { state: { patient } });
  };

  const handleDischarge = (patient) => {
    navigate("/discharge", { state: { patient } });
  };

  const handleView = (patient) => {
    console.log("Reviewing patient:", patient);
  };

  const handleQuickAction = (action) => {
    navigate(`/${action}`);
  };

  const currentPath = location.pathname.replace(/^\//, "") || "dashboard";
  const currentTab = ["reception", "reception-tasks"].includes(currentPath)
    ? "dashboard"
    : currentPath;

  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardOverview
            patients={patients}
            alerts={alerts}
            handleAdmit={handleAdmit}
            handleDischarge={handleDischarge}
            handleView={handleView}
            handleQuickAction={handleQuickAction}
            loading={patientsLoading || alertsLoading}
          />
        );
      case "admission":
        return <AdmissionWizard />;
      case "beds":
        return <BedManagement />;
      case "discharge":
        return <DischargeMonitor />;
      case "alerts":
        return (
          <AlertsPanel alerts={alerts} loading={<RefreshCw size={13} />} />
        );
      case "Analytics":
        return <ExecutivePage />;
      default:
        return (
          <DashboardOverview
            patients={patients}
            alerts={alerts}
            handleQuickAction={handleQuickAction}
            loading={patientsLoading || alertsLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-[1600px]">{renderTabContent()}</div>
    </div>
  );
}
