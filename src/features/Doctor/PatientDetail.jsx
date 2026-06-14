import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  UserRound,
  TrendingUp,
  Pill,
  FileText,
  AlertTriangle,
  Rocket,
  Edit2,
  StopCircle,
  X,
  CheckCircle,
  Send,
  PenLine,
  ChevronRight,
  Building2,
  Radio,
  Calendar,
  Bell,
  Heart,
  Thermometer,
  Droplet,
  Activity,
  Printer,
  Check,
  Clock,
  ClipboardList,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  getPatientById,
  getMedicalReportsByPatient,
  getPatientIsbar,
  getTasksByPatient,
  completeTask,
  checkPatientMedication,
  createMedicalReport,
  updatePatientDoctor, // Added this API
} from "../APIS/apiHandler";
import {
  formatBedId,
  formatPatientId,
  HandleDepartmentByBedId,
} from "../APIS/Handler";
import DrugCheckModal from "./components/patientDetails/drugcheck";
import MedicalReportModal from "./components/patientDetails/MedicalReport";
import ISBARModal from "./components/patientDetails/isbar";
import TasksModal from "./components/patientDetails/tasks";

// ─── UTILITIES ───────────────────────────────────────────────────────────────
const formatVitalNumber = (val) => {
  if (val === undefined || val === null) return "--";
  const num = parseFloat(val);
  return isNaN(num) ? val : num.toFixed(1); // Force 1 decimal place
};

// Function to format all numbers in a string to 1 decimal place
const formatNumbersInText = (text) => {
  if (!text) return text;
  return text.replace(/\b\d+(\.\d+)?\b/g, (match) => {
    const num = parseFloat(match);
    return isNaN(num) ? match : num.toFixed(1);
  });
};

// ─── SIDE NOTIFICATION PANEL ──────────────────────────────────────
const SideNotification = ({ notification, onClose }) => {
  if (!notification) return null;
  const configs = {
    escalate: {
      accent: "#ef4444",
      bg: "#fff5f5",
      icon: <AlertTriangle size={22} color="#ef4444" />,
      title: "Escalation Sent",
      footer: "MET response ETA: ~4 min • Case ref: ESC-2049",
      steps: [
        {
          icon: <AlertTriangle size={18} color="#ef4444" />,
          label: "Alert dispatched",
          sub: "Medical Emergency Team notified immediately",
        },
        {
          icon: <UserRound size={18} color="#ef4444" />,
          label: "On-call registrar paged",
          sub: "Response expected within 4 minutes",
        },
        {
          icon: <Building2 size={18} color="#ef4444" />,
          label: "ICU bed requested",
          sub: "Bed coordination team contacted",
        },
        {
          icon: <ClipboardCheck size={18} color="#ef4444" />,
          label: "Escalation logged",
          sub: "Timestamp recorded in patient record",
        },
      ],
    },
    imaging: {
      accent: "#3b82f6",
      bg: "#f0f7ff",
      icon: <Send size={22} color="#3b82f6" />,
      title: "Imaging Request Sent",
      footer: "Request ref: IMG-7731 • Priority: Urgent",
      steps: [
        {
          icon: <Radio size={18} color="#3b82f6" />,
          label: "Request submitted to Radiology",
          sub: "Received by duty radiologist",
        },
        {
          icon: <Calendar size={18} color="#3b82f6" />,
          label: "Slot allocated",
          sub: "Estimated scan: within 2 hours",
        },
        {
          icon: <Bell size={18} color="#3b82f6" />,
          label: "Nurse notified",
          sub: "Patient prep instructions sent to ward",
        },
        {
          icon: <FileText size={18} color="#3b82f6" />,
          label: "Results auto-route",
          sub: "Will appear in patient record on completion",
        },
      ],
    },
  };
  const cfg = configs[notification];
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "380px",
        background: "white",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        zIndex: 1500,
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.35s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div
        style={{
          background: cfg.accent,
          padding: "28px 24px 24px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "8px",
                display: "flex",
              }}
            >
              {React.cloneElement(cfg.icon, { color: "white" })}
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  opacity: 0.75,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Action Confirmed
              </div>
              <div
                style={{ fontSize: "20px", fontWeight: 900, marginTop: "2px" }}
              >
                {cfg.title}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              color: "white",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div
          style={{
            marginTop: "16px",
            fontSize: "12px",
            fontWeight: 600,
            opacity: 0.8,
            background: "rgba(0,0,0,0.15)",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
        >
          {cfg.footer}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#8898aa",
            letterSpacing: "0.1em",
            marginBottom: "16px",
          }}
        >
          WHAT HAPPENS NEXT
        </div>
        {cfg.steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "14px",
              marginBottom: "20px",
              animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: cfg.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {step.icon}
            </div>
            <div>
              <div
                style={{ fontSize: "13px", fontWeight: 800, color: "#1a2b3c" }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#8898aa",
                  marginTop: "3px",
                  lineHeight: 1.5,
                }}
              >
                {step.sub}
              </div>
            </div>
            <div style={{ marginLeft: "auto", color: cfg.accent }}>
              <CheckCircle size={16} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8" }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px",
            background: cfg.accent,
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

// ─── STOP MED MODAL ───────────────────────────────────────────────
const StopMedModal = ({ med, onConfirm, onCancel }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1300,
    }}
  >
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "420px",
        width: "90%",
        boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <StopCircle size={24} color="#ef4444" />
      </div>
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: "22px",
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        Stop Medication?
      </h2>
      <p style={{ margin: "0 0 20px", color: "#64748b", lineHeight: 1.6 }}>
        You are about to discontinue{" "}
        <strong style={{ color: "#0f172a" }}>{med?.name}</strong> ({med?.dose} •{" "}
        {med?.route} • {med?.frequency}). This action will be logged in the
        patient record.
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            fontWeight: 800,
            cursor: "pointer",
            color: "#1a2b3c",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#ef4444",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Confirm Stop
        </button>
      </div>
    </div>
  </div>
);

// ─── CLINICAL NOTE MODAL ──────────────────────────────────────────
const ClinicalNoteModal = ({ note, onSave, onCancel }) => {
  const [text, setText] = useState(
    note?.note || note?.text || note?.description || "",
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PenLine size={20} color="#3b82f6" />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              {note ? "Edit Clinical Note" : "Add Clinical Note"}
            </h2>
            <div
              style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}
            >
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Enter clinical observations..."
          style={{
            width: "100%",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "16px",
            fontSize: "14px",
            fontFamily: "Cairo, sans-serif",
            color: "#0f172a",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.7,
            boxSizing: "border-box",
          }}
          autoFocus
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              fontWeight: 800,
              cursor: "pointer",
              color: "#1a2b3c",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              text.trim() &&
              onSave({ text: text.trim(), date: new Date().toISOString() })
            }
            style={{
              flex: 2,
              padding: "13px",
              borderRadius: "10px",
              border: "none",
              background: "#003366",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {note ? "Save Changes" : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── NEW ENHANCED MODALS ─────────────────────────────────────────────────────

// NEW ORDER MODAL
const NewOrderModal = ({ patient, task, onClose, onSave }) => {
  const [treatment, setTreatment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!treatment) return alert("Please enter treatment details");
    setLoading(true);
    try {
      await onSave(
        { patientId: patient.id, currentTreatment: treatment },
        task.id,
      );
      onClose();
    } catch (e) {
      alert("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Pill size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              New Order
            </h2>
            <p className="text-slate-400 text-xs font-bold mt-1">
              Patient: {patient.fullName}
            </p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Task Context
          </div>
          <div className="text-xs text-slate-700 font-bold">
            {formatNumbersInText(task.description)}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
            Treatment Details
          </label>
          <textarea
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition text-sm font-medium min-h-[120px]"
            placeholder="Enter new treatment or medication order..."
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-2 py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-950 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const medsRef = useRef(null);
  const notesRef = useRef(null);

  // States
  const [activeTab, setActiveTab] = useState("VITALS");
  const [selectedVital, setSelectedVital] = useState("heartRate");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedicationList, setActiveMedicationList] = useState([]);
  const [stoppedMeds, setStoppedMeds] = useState([]);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [stopMedTarget, setStopMedTarget] = useState(null);
  const [sideNotification, setSideNotification] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [clinicalNotesList, setClinicalNotesList] = useState([]);

  // New Enhancement States
  const [isbarData, setIsbarData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showIsbar, setShowIsbar] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDrugCheck, setShowDrugCheck] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(null); // Stores task object
  const [existingReport, setExistingReport] = useState(null);

  // Fetch patient and report data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [patientRes, reportsRes, isbarRes, tasksRes] = await Promise.all([
        getPatientById(id),
        getMedicalReportsByPatient(id),
        getPatientIsbar(id),
        getTasksByPatient(id),
      ]);

      const patientData = patientRes.data || {};
      const reportsData = reportsRes.data || [];
      setPatient(patientData);
      setIsbarData(isbarRes.data || null);
      setTasks(tasksRes.data || []);
      setActiveMedicationList(patientData.activeMedications || []);

      // Store the latest report if it exists
      if (reportsData.length > 0) {
        setExistingReport(
          reportsData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          )[0],
        );
      }

      const prevMeds = Array.isArray(patientData.previousMedications)
        ? patientData.previousMedications
        : typeof patientData.previousMedications === "string"
          ? patientData.previousMedications
              .replace(/^Previous medications:\s*/i, "")
              .split(",")
              .map((m) => ({ name: m.trim() }))
          : [];

      const background = patientData.background || patientData.history || "";
      const notes = reportsData.map((report) => ({
        id: report.id,
        note:
          report.diagnosis || report.treatmentPlan || report.description || "",
        date: report.createdAt || report.date || new Date().toISOString(),
        type: report.reportType || "clinical",
        previousMeds: prevMeds,
        background,
      }));
      setClinicalNotesList(notes);
    } catch (error) {
      console.error("Failed to fetch patient data:", error);
      setPatient({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Loading Patient Record
          </div>
        </div>
      </div>
    );
  }

  const p = patient || {};
  const patientName = p.name || p.fullName || "Patient";

  const sortedVitals = (p.vitalSigns || [])
    .map((v) => {
      const timestamp = v.recordedAt || v.RecordedAt || "";
      const parsedDate = timestamp ? new Date(timestamp) : null;
      return {
        timestamp,
        time: parsedDate
          ? parsedDate
              .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .toLowerCase()
          : "",
        day: parsedDate
          ? parsedDate.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })
          : "",
        heartRate: v.heartRate || v.HeartRate,
        systolicPressure: v.systolicPressure || v.SystolicPressure,
        diastolicPressure: v.diastolicPressure || v.DiastolicPressure,
        temperature: v.temperature || v.Temperature,
        oxygenLevel: v.oxygenLevel || v.OxygenLevel,
        respirationRate: v.respirationRate || v.RespirationRate,
      };
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const latestVitalRecord =
    sortedVitals.length > 0 ? sortedVitals[sortedVitals.length - 1] : {};
  const current = {
    heartRate: latestVitalRecord.heartRate,
    systolicPressure: latestVitalRecord.systolicPressure,
    diastolicPressure: latestVitalRecord.diastolicPressure,
    temperature: latestVitalRecord.temperature,
    oxygenLevel: latestVitalRecord.oxygenLevel,
    respirationRate: latestVitalRecord.respirationRate,
  };

  const handleSaveReport = async (data) => {
    if (createMedicalReport) {
      await createMedicalReport(data);
      // If it was a task, find the task and complete it
      const notesTask = tasks.find((t) =>
        t.title.toLowerCase().includes("write clinical notes"),
      );
      if (notesTask) {
        await completeTask(notesTask.id);
      }
      await fetchAllData();
    }
  };

  const handleSaveOrder = async (data, taskId) => {
    if (updatePatientDoctor) {
      await updatePatientDoctor(id, data);
      await completeTask(taskId);
      await fetchAllData();
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      alert("Failed to complete task");
    }
  };

  const vitalConfig = {
    heartRate: {
      label: "Heart Rate",
      unit: "BPM",
      color: "#ff5b5b",
      icon: Heart,
    },
    systolicPressure: {
      label: "Systolic BP",
      unit: "mmHg",
      color: "#3b82f6",
      icon: TrendingUp,
    },
    temperature: {
      label: "Temperature",
      unit: "°C",
      color: "#f59e0b",
      icon: Thermometer,
    },
    oxygenLevel: { label: "SpO2", unit: "%", color: "#10b981", icon: Droplet },
    respirationRate: {
      label: "Resp Rate",
      unit: "BPM",
      color: "#ef4444",
      icon: Activity,
    },
  };
  const VitalCard = ({ type, active, onClick }) => {
    const cfg = vitalConfig[type];

    const val =
      type === "systolicPressure"
        ? `${formatVitalNumber(current.systolicPressure)}/${formatVitalNumber(current.diastolicPressure)}`
        : formatVitalNumber(current[type]);

    return (
      <div
        onClick={() => onClick(type)}
        className="p-5 rounded-3xl border-2 cursor-pointer transition-all duration-500 ease-out hover:scale-[1.02]"
        style={{
          borderColor: active ? cfg.color : "#fff",
          backgroundColor: active ? `${cfg.color}10` : "#fff",
          boxShadow: active ? `0 10px 30px ${cfg.color}25` : "none",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="p-3 rounded-2xl flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              backgroundColor: active ? cfg.color : `${cfg.color}15`,
              color: active ? "#fff" : cfg.color,
              transform: active ? "scale(1.08)" : "scale(1)",
              boxShadow: active ? `0 8px 20px ${cfg.color}40` : "none",
            }}
          >
            <cfg.icon size={24} />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {cfg.label}
            </div>

            <div className="text-2xl font-black text-slate-900 mt-1">
              {val}
              <span className="text-xs font-bold text-slate-400 ml-1">
                {cfg.unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MedCard = ({ med, index, showActions = true }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-3">
      <div className="flex-1">
        <div className="text-sm font-bold text-slate-900">{med.name}</div>
        <div className="text-xs text-slate-500 mt-1.5">
          {med.dose} • {med.route} • {med.frequency}
        </div>
        {med.note && (
          <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {formatNumbersInText(med.note)}
          </div>
        )}
      </div>
      {showActions && (
        <div className="flex gap-1.5">
          <button
            onClick={() => setEditMed({ med, index })}
            className="p-2 rounded-xl bg-white border border-slate-200 text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setStopMedTarget({ med, index })}
            className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
          >
            <StopCircle size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-10 font-['Cairo',sans-serif]">
      {/* SIDE NOTIFICATION */}
      {sideNotification && (
        <SideNotification
          notification={sideNotification}
          onClose={() => setSideNotification(null)}
        />
      )}

      {/* MODALS */}
      {showIsbar && isbarData && (
        <ISBARModal
          patient={p}
          isbar={isbarData}
          onClose={() => setShowIsbar(false)}
          onWriteReport={() => {
            setShowIsbar(false);
            setShowReport(true);
          }}
        />
      )}
      {showTasks && (
        <TasksModal
          tasks={tasks}
          onClose={() => setShowTasks(false)}
          onComplete={handleCompleteTask}
          onNewOrder={(t) => {
            setShowTasks(false);
            setShowNewOrder(t);
          }}
          onWriteNotes={(t) => {
            setShowTasks(false);
            setShowReport(true);
          }}
        />
      )}
      {showReport && (
        <MedicalReportModal
          patient={p}
          onClose={() => setShowReport(false)}
          onSave={handleSaveReport}
          existingReport={existingReport}
        />
      )}
      {showNewOrder && (
        <NewOrderModal
          patient={p}
          task={showNewOrder}
          onClose={() => setShowNewOrder(null)}
          onSave={handleSaveOrder}
        />
      )}
      {showDrugCheck && (
        <DrugCheckModal
          patientId={id}
          onClose={() => setShowDrugCheck(false)}
        />
      )}

      {/* ORIGINAL MODALS */}
      {(showPrescribeModal || editMed) && (
        <PrescribeModal
          editMed={editMed?.med}
          onClose={() => {
            setShowPrescribeModal(false);
            setEditMed(null);
          }}
          onSave={(m) => {
            setActiveMedicationList((prev) =>
              editMed
                ? prev.map((item, i) => (i === editMed.index ? m : item))
                : [m, ...prev],
            );
            setEditMed(null);
            setShowPrescribeModal(false);
          }}
        />
      )}
      {stopMedTarget && (
        <StopMedModal
          med={stopMedTarget.med}
          onConfirm={() => {
            setActiveMedicationList((prev) =>
              prev.filter((_, i) => i !== stopMedTarget.index),
            );
            setStoppedMeds((prev) => [
              {
                ...stopMedTarget.med,
                stoppedDate: new Date().toISOString().slice(0, 10),
              },
              ...prev,
            ]);
            setStopMedTarget(null);
          }}
          onCancel={() => setStopMedTarget(null)}
        />
      )}
      {noteModal && (
        <ClinicalNoteModal
          note={noteModal.noteObj}
          onSave={({ text, date }) => {
            setClinicalNotesList((prev) =>
              noteModal.noteObj
                ? prev.map((n, i) =>
                    i === noteModal.index ? { ...n, note: text, date } : n,
                  )
                : [{ note: text, date }, ...prev],
            );
            setNoteModal(null);
          }}
          onCancel={() => setNoteModal(null)}
        />
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 hover:gap-3 transition-all"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
            {patientName}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
              {formatPatientId(p.id)}
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
              Bed {p.bedId}
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
              {HandleDepartmentByBedId(p.bedId)}
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
              Admitted {new Date(p.admittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div
          className={`px-8 py-4 rounded-3xl text-white shadow-xl flex items-center gap-6 ${p.newsScore <= 4 ? "bg-green-500" : p.newsScore <= 6 ? "bg-amber-500" : "bg-red-500"}`}
        >
          <div className="text-center">
            <div className="text-[10px] font-black uppercase opacity-75">
              Status
            </div>
            <div className="text-xl font-black">{p.status}</div>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div className="text-center">
            <div className="text-[10px] font-black uppercase opacity-75">
              NEWS2
            </div>
            <div className="text-3xl font-black">{p.newsScore}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-2 rounded-[28px] border border-slate-200 shadow-sm flex gap-2">
        {["VITALS", "MEDICATIONS", "CLINICAL NOTES"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === "VITALS" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <VitalCard
                  type="heartRate"
                  active={selectedVital === "heartRate"}
                  onClick={setSelectedVital}
                />
                <VitalCard
                  type="systolicPressure"
                  active={selectedVital === "systolicPressure"}
                  onClick={setSelectedVital}
                />
                <VitalCard
                  type="temperature"
                  active={selectedVital === "temperature"}
                  onClick={setSelectedVital}
                />
                <VitalCard
                  type="oxygenLevel"
                  active={selectedVital === "oxygenLevel"}
                  onClick={setSelectedVital}
                />
                <VitalCard
                  type="respirationRate"
                  active={selectedVital === "respirationRate"}
                  onClick={setSelectedVital}
                />
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                      {vitalConfig[selectedVital].label} Trend
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      Last 24 hours observation
                    </p>
                  </div>
                  <div className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    {vitalConfig[selectedVital].unit}
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sortedVitals}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorVital"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={vitalConfig[selectedVital].color}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={vitalConfig[selectedVital].color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "20px",
                          border: "none",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                          padding: "15px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedVital}
                        stroke={vitalConfig[selectedVital].color}
                        strokeWidth={4}
                        fill="url(#colorVital)"
                        dot={{
                          r: 6,
                          fill: "#fff",
                          strokeWidth: 3,
                          stroke: vitalConfig[selectedVital].color,
                        }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Background
                  </h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {formatNumbersInText(
                      p.background || "No background history recorded.",
                    )}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Current Flow
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-black text-slate-900">
                      {p.flowStatus || "Processing"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "MEDICATIONS" && (
            <div className="space-y-6">
              {/*
              <div className="space-y-3">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Medications</h3>
                  <button onClick={() => setShowNewOrder(true)} className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-950 transition">+ New Order</button>
                </div>
                </div>
                  {activeMedicationList.length > 0 ? activeMedicationList.map((med, i) => <MedCard key={i} med={med} index={i} />) : <div className="text-center py-10 text-slate-400 font-bold text-sm">No active medications</div>}
                </div>
              </div>*/}

              {/* Current Treatment Summary */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                  Current Treatment & Support
                </h3>
                <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100">
                  <p className="text-sm text-blue-900 font-bold leading-relaxed">
                    {formatNumbersInText(
                      p.currentTreatment ||
                        "No current treatment details recorded.",
                    )}
                  </p>
                </div>
              </div>

              {/* Previous Medications */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                  Medical History: Previous Medications
                </h3>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {formatNumbersInText(
                      p.previousMedications ||
                        "No previous medications recorded.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CLINICAL NOTES" && (
            <div className="space-y-6">
              {/* Patient Clinical Profile */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-blue-900 rounded-full"></div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Clinical Profile
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Patient Identity
                      </label>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="text-sm font-black text-slate-900">
                          {p.fullName}
                        </div>
                        <div className="text-xs text-slate-500 font-bold mt-1">
                          Age: {p.age} • Bed: {p.bedId}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Background & History
                      </label>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {formatNumbersInText(
                            p.background || "No background history recorded.",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Current Status & Flow
                      </label>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${p.status === "Critical" ? "bg-red-500" : "bg-green-500"}`}
                          ></span>
                          <span className="text-sm font-black text-slate-900">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-bold mt-1">
                          Flow: {p.flowStatus}
                        </div>
                      </div>
                    </div>
                    {isbarData && (
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                          Handover Identify (ISBAR)
                        </label>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                          <p className="text-sm text-blue-900 font-bold leading-relaxed">
                            {formatNumbersInText(isbarData.identify)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isbarData && (
                  <div className="mt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                      Clinical Assessment (ISBAR)
                    </label>
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                      <p className="text-sm text-red-900 font-bold leading-relaxed">
                        {formatNumbersInText(isbarData.assessment)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Documentation List */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Clinical Documentation
                  </h3>
                  <button
                    onClick={() => setNoteModal("new")}
                    className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-950 transition flex items-center gap-2"
                  >
                    <PenLine size={14} /> Add Note
                  </button>
                </div>
                <div className="space-y-4">
                  {clinicalNotesList.length > 0 ? (
                    clinicalNotesList.map((note, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group"
                      >
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Clock size={12} />{" "}
                          {new Date(note.date).toLocaleString()}
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                          {formatNumbersInText(note.note)}
                        </p>
                        <button
                          onClick={() =>
                            setNoteModal({ noteObj: note, index: i })
                          }
                          className="absolute top-6 right-6 p-2 rounded-xl bg-white border border-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 font-bold text-sm">
                      No clinical notes recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-900/20">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Rocket size={14} /> Ward Operations
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowTasks(true)}
                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition flex items-center justify-center gap-3 border border-white/10"
              >
                <ClipboardCheck size={18} /> View Tasks
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition flex items-center justify-center gap-3 border border-white/10"
              >
                <PenLine size={18} /> Medical Report
              </button>
              <button
                onClick={() => setShowIsbar(true)}
                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition flex items-center justify-center gap-3 border border-white/10"
              >
                <ClipboardList size={18} /> View ISBAR Report
              </button>
              <button
                onClick={() => setShowDrugCheck(true)}
                className="w-full py-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition flex items-center justify-center gap-3 border border-red-500/20"
              >
                <Pill size={18} /> Safety Check
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
              <button
                onClick={() => setSideNotification("escalate")}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-3"
              >
                Escalate Case
              </button>
              <button
                onClick={() => setSideNotification("imaging")}
                className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition border border-white/5"
              >
                Request Imaging
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Patient Context
            </h4>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Previous Medications
                </div>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  {formatNumbersInText(
                    p.previousMedications || "None recorded",
                  )}
                </p>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Current Treatment
                </div>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  {formatNumbersInText(p.currentTreatment || "None recorded")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
