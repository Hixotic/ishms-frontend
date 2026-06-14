import React, { useEffect, useState, useContext } from "react";
import {
  ChevronDown,
  AlertTriangle,
  Eye,
  RefreshCw,
  Bell,
  Search,
} from "lucide-react";

import { useAuth } from "../Auth/AuthProvider";
import { getAlertsByRole, markAlertRead } from "../APIS/apiHandler";
import { SearchContext } from "../Shared/Layout.jsx";
import { useNavigate } from "react-router-dom";
import { useData } from "./IContext.jsx";
import PatientDetailsModal from "../Reception/components/PatientDetailsModal.jsx";

// ─── ANIMATIONS ──────────────────────────────────────────────────

const animationStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-up {
    animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }

  .animate-slide-down {
    animation: slideDown 0.25s ease both;
  }
`;

// ─── SEVERITY CONFIG ─────────────────────────────────────────────

const getSeverityConfig = (severity) => {
  const configs = {
    Critical: {
      color: "#ef4444",
      badgeBg: "bg-red-50 text-red-700 border-red-200",
      iconBg: "bg-red-50",
      ring: "ring-red-100",
    },

    Warning: {
      color: "#f59e0b",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-50",
      ring: "ring-amber-100",
    },

    Info: {
      color: "#3b82f6",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-50",
      ring: "ring-blue-100",
    },
  };

  return configs[severity] || configs.Info;
};

// ─── ALERT ITEM ──────────────────────────────────────────────────

const AlertItem = ({
  alert,
  isOpen,
  onToggle,
  onMarkRead,
  onViewPatient,
  index,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const config = getSeverityConfig(alert.severity);

  const formattedDate = alert.createdAt
    ? new Date(alert.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleMarkRead = async (e) => {
    e.stopPropagation();

    setIsProcessing(true);

    await onMarkRead(alert.id);

    setIsProcessing(false);
  };

  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg animate-fade-up ${
        isOpen
          ? `ring-2 ${config.ring} border-slate-200`
          : "border-slate-200 hover:border-slate-300"
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50/60 transition-colors duration-200"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
          >
            <AlertTriangle size={20} color={config.color} strokeWidth={2.5} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="font-black text-slate-900 text-base tracking-tight">
                {alert.patientName || "System Notification"}
              </h4>

              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border ${config.badgeBg}`}
              >
                {alert.severity || "Info"}
              </span>
            </div>

            <p className="text-sm text-slate-500 font-medium line-clamp-1 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs text-slate-400 font-semibold hidden md:block">
            {formattedDate}
          </span>

          <ChevronDown
            size={18}
            strokeWidth={2.5}
            className={`text-slate-300 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded */}
      {isOpen && (
        <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/40 animate-slide-down space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-3.5 text-sm text-slate-700 font-medium leading-relaxed shadow-sm">
            {alert.message}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div>
              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-[0.18em] mb-1">
                Patient ID
              </span>

              <p className="text-slate-900 font-black">
                P{String(alert.patientId).padStart(3, "0")}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-[0.18em] mb-1">
                Target Role
              </span>

              <p className="text-slate-900 font-black">
                {alert.targetRole || "General"}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-[0.18em] mb-1">
                Timestamp
              </span>

              <p className="text-slate-900 font-black">
                {formattedDate || "N/A"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={() => onViewPatient(alert.patientId)}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white uppercase tracking-widest hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              <Eye size={14} strokeWidth={2.5} />
              View Patient
            </button>

            <button
              onClick={handleMarkRead}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-widest hover:bg-slate-200 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw
                  size={13}
                  className="animate-spin"
                  strokeWidth={2.5}
                />
              ) : (
                <Bell size={14} strokeWidth={2.5} />
              )}

              {isProcessing ? "Processing…" : "Mark as Read"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [openAlertId, setOpenAlertId] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const { user } = useAuth();

  const navigate = useNavigate();

  const { patients, isReceptionist, isDoctor } = useData();

  const searchTerm = useContext(SearchContext)?.searchTerm || "";

  const cleanedSearch = searchTerm.trim().toLowerCase();

  // ── Fetch Alerts ─────────────────────────────────────────────

  const fetchAlerts = async () => {
    if (!user?.role) return;

    try {
      const response = await getAlertsByRole(user.role);

      const data = response?.data ?? response;

      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setAlerts(sorted);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      setAlerts([]);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user?.role]);

  // ── Mark Read ────────────────────────────────────────────────

  const handleMarkRead = async (id) => {
    try {
      await markAlertRead(id);

      setAlerts((prev) => prev.filter((a) => a.id !== id));

      if (openAlertId === id) {
        setOpenAlertId(null);
      }
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
    }
  };

  // ── Filter Alerts ────────────────────────────────────────────

  const filteredAlerts = alerts.filter((alert) => {
    if (!cleanedSearch) return true;

    const text = `
      ${alert.message || ""}
      ${alert.patientName || ""}
      ${alert.severity || ""}
    `.toLowerCase();

    return text.includes(cleanedSearch);
  });

  // ── Counts ───────────────────────────────────────────────────

  const criticalCount = filteredAlerts.filter(
    (a) => a.severity === "Critical",
  ).length;

  const warningCount = filteredAlerts.filter(
    (a) => a.severity === "Warning",
  ).length;

  const infoCount = filteredAlerts.filter((a) => a.severity === "Info").length;

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 md:px-8 py-6">
      <style>{animationStyles}</style>

      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {user?.role ? `${user.role} Alerts` : "Alerts"}
            </h1>

            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Notifications inbox · {filteredAlerts.length} action
              {filteredAlerts.length !== 1 ? "s" : ""} pending
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200"
          >
            <RefreshCw size={13} strokeWidth={2.5} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {filteredAlerts.map((alert, i) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              index={i}
              isOpen={openAlertId === alert.id}
              onToggle={() =>
                setOpenAlertId(openAlertId === alert.id ? null : alert.id)
              }
              onMarkRead={handleMarkRead}
              onViewPatient={(id) => {
                const patient = patients.find((p) => p.id === id);

                const role = user?.role?.toLowerCase();

                if (isDoctor) {
                  navigate(`/patients/${id}`);
                } else {
                  setSelectedPatient(patient);
                  setShowPatientModal(true);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isReceptionist && selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={showPatientModal}
          onClose={() => {
            setShowPatientModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default AlertsPage;
