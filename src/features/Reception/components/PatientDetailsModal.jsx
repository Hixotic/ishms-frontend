import React, { useState, useCallback, useEffect } from "react";
import {
  Calendar,
  Clock,
  Bed,
  HeartPulse,
  ShieldCheck,
  ClipboardList,
  X,
  ArrowRightLeft,
  Activity,
  Thermometer,
  Wind,
  Droplets,
  DoorOpen,
} from "lucide-react";
import { TransferModal } from "../../Shared/Assign"; // Adjust path if necessary
import { getDepartments, assignBed } from "../../APIS/apiHandler";
import { DischargeModal } from "./DischargePatient";

function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const deptsResponse = await getDepartments();

      let depts = deptsResponse;

      if (depts && typeof depts === "object" && !Array.isArray(depts)) {
        depts = depts.data || depts.departments || [];
      }

      if (!Array.isArray(depts) || depts.length === 0) {
        throw new Error("No departments available");
      }

      setDepartments(depts);
    } catch (err) {
      setError(err?.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { departments, loading, error, refresh };
}

// Enhanced status color styling
const getStatusBadge = (status) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("critical"))
    return "bg-red-50 text-red-600 border-red-200 shadow-red-100";
  if (s.includes("unstable") || s.includes("observation"))
    return "bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100";
  if (s.includes("waiting"))
    return "bg-purple-50 text-purple-600 border-purple-200 shadow-purple-100";
  return "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100";
};

// Enhanced NEWS score styling
const getNewsStyle = (score) => {
  const numScore = Number(score) || 0;
  if (numScore >= 7) return "bg-red-50 text-red-600 icon-red";
  if (numScore >= 4) return "bg-amber-50 text-amber-600 icon-amber";
  return "bg-emerald-50 text-emerald-600 icon-emerald";
};

const PatientDetailsModal = ({
  patient,
  isOpen,
  onClose,
  onTransferSuccess,
}) => {
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDischarge, setShowDischarge] = useState(false);
  const { departments, occupiedMap, availableSet, loading, error, refresh } =
    useDepartments();
  if (!isOpen || !patient) return null;

  const patientName =
    patient.fullName || patient.patientName || "Unknown Patient";
  const patientStatus = patient.flowStatus || patient.status || "Stable";
  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const vitals = patient.latestVitalSign || {};

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-4 duration-300">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 p-6 sm:px-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-black text-white shadow-lg shadow-blue-200">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {patientName}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${getStatusBadge(patientStatus)}`}
                  >
                    {patientStatus.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm text-slate-700">
                    <Bed size={14} className="text-blue-500" />
                    Bed {patient.bedId || patient.roomNumber || "None"}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    Admitted: {new Date(patient.admittedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-slate-50/30">
            {/* 1. Patient Demographics */}
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Patient Demographics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <InfoCard
                icon={<HeartPulse />}
                label="NEWS Score"
                value={patient.newsScore ?? "--"}
                colorClass={getNewsStyle(patient.newsScore)}
                highlight
              />
              <InfoCard
                icon={<ShieldCheck />}
                label="General Status"
                value={patient.status || "Stable"}
                colorClass="bg-white text-slate-700 icon-slate"
              />
              <InfoCard
                icon={<ClipboardList />}
                label="Age"
                value={`${patient.age || "--"} Yrs`}
                colorClass="bg-white text-slate-700 icon-slate"
              />
              <InfoCard
                icon={<Calendar />}
                label="Date of Birth"
                value={
                  patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : "--"
                }
                colorClass="bg-white text-slate-700 icon-slate"
              />
            </div>

            {/* 2. Real-Time Vitals */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Latest Vitals
                </h3>
                {vitals.recordedAt && (
                  <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                    Recorded:{" "}
                    {new Date(vitals.recordedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <VitalCard
                  icon={<HeartPulse />}
                  label="Heart Rate"
                  value={vitals.heartRate}
                  unit="bpm"
                  color="text-rose-500"
                  bg="bg-rose-50"
                />
                <VitalCard
                  icon={<Wind />}
                  label="SpO2"
                  value={vitals.oxygenLevel}
                  unit="%"
                  color="text-sky-500"
                  bg="bg-sky-50"
                />
                <VitalCard
                  icon={<Droplets />}
                  label="Blood Pressure"
                  value={`${vitals.systolicPressure || "--"}/${vitals.diastolicPressure || "--"}`}
                  unit="mmHg"
                  color="text-indigo-500"
                  bg="bg-indigo-50"
                />
                <VitalCard
                  icon={<Thermometer />}
                  label="Temperature"
                  value={vitals.temperature}
                  unit="°C"
                  color="text-amber-500"
                  bg="bg-amber-50"
                />
                <VitalCard
                  icon={<Activity />}
                  label="Resp. Rate"
                  value={vitals.respirationRate}
                  unit="rpm"
                  color="text-teal-500"
                  bg="bg-teal-50"
                />
              </div>
            </div>

            {/* 3. Medical Notes Section (Side-by-Side Layout) */}
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Clinical Notes
            </h3>

            {!patient.background &&
            !patient.previousMedications &&
            !patient.currentTreatment ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm font-medium shadow-sm">
                No detailed clinical notes have been logged for this patient.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Background */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">
                    Background
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium flex-1">
                    {patient.background ||
                      "No background information available."}
                  </p>
                </div>

                {/* Right Column: Stacked Meds & Treatment */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">
                      Previous Medications
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {patient.previousMedications || "None recorded."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">
                      Current Treatment
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {patient.currentTreatment || "None recorded."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
            <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              ID: {patient.id || patient.patientId}
            </div>

            {/* Action Buttons grouped together */}
            <div className="flex items-center gap-3">
              {/* In your Footer Action Buttons */}
              {patient.flowStatus?.toLowerCase() === "stable" && (
                <button
                  onClick={() => setShowDischarge(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700 shadow-sm"
                >
                  <DoorOpen size={16} /> Discharge
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowTransfer(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700 shadow-sm"
              >
                <ArrowRightLeft size={16} />
                Transfer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discharge Modal Implementation */}
      <DischargeModal
        patient={patient}
        isOpen={showDischarge}
        onClose={() => setShowDischarge(false)}
        onSuccess={() => {
          // Logic to update your UI or trigger notification
          onClose(); // Close the main modal after successful discharge
        }}
      />
      {/* Embedded Transfer Modal */}
      {showTransfer && (
        <TransferModal
          patient={patient}
          departments={departments}
          onClose={() => setShowTransfer(false)}
          onSuccess={() => {
            setShowTransfer(false);
            if (onTransferSuccess) onTransferSuccess();
            onClose();
          }}
        />
      )}
    </>
  );
};

// --- Subcomponents ---

const VitalCard = ({ icon, label, value, unit, color, bg }) => (
  <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-3">
      <div
        className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center ${color}`}
      >
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-black text-slate-800 tracking-tight">
        {value !== undefined ? value : "--"}
      </span>
      <span className="text-sm font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

const InfoCard = ({ icon, label, value, colorClass, highlight }) => {
  const iconColor = colorClass.includes("icon-red")
    ? "text-red-500"
    : colorClass.includes("icon-amber")
      ? "text-amber-500"
      : colorClass.includes("icon-emerald")
        ? "text-emerald-500"
        : "text-slate-400";

  return (
    <div
      className={`relative flex flex-col p-4 rounded-2xl border ${highlight ? "border-transparent shadow-sm" : "border-slate-200 shadow-sm"} ${colorClass.replace(/icon-\w+/, "")}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`[&>svg]:w-4 [&>svg]:h-4 ${iconColor}`}>{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider opacity-60">
          {label}
        </span>
      </div>
      <span className="text-lg font-black tracking-tight">{value}</span>
    </div>
  );
};

export default PatientDetailsModal;
