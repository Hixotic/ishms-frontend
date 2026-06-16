import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, SectionTitle, Badge } from "../components/ui";
import { patientService, analyticsService } from "../api/services/index";
import { rooms as mockRooms, alerts as mockAlerts } from "../data/mockData";
import { ArrowLeft, AlertTriangle, Heart, Droplet, Wind, Activity, Clock, User, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function Skeleton({ className="" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

// Normalise API patient → our shape
function normalisePatient(p) {
  const vitals = p.latestVitals ?? p.vitals ?? p.vitalSigns ?? {};
  const status =
    p.status?.toLowerCase() ??
    (p.news2Score >= 7 ? "critical" : p.news2Score >= 4 ? "observation" : "stable");

  return {
    id:         p.id ?? p.patientId,
    name:       p.fullName ?? p.patientName ?? p.name ?? "—",
    age:        p.age ?? p.patientAge ?? 0,
    num:        p.bedNumber ?? p.roomNumber ?? `ID-${p.id}`,
    nurse:      p.nurseName ?? p.assignedNurse ?? "—",
    doctor:     p.doctorName ?? p.assignedDoctor ?? "—",
    status,
    news2:      p.news2Score ?? p.news2 ?? 0,
    lastUpdate: p.lastUpdate ?? p.updatedAt ?? "—",
    dept:       p.departmentName ?? p.department ?? "—",
    background: p.background ?? p.medicalHistory ?? "",
    treatment:  p.currentTreatment ?? p.treatmentPlan ?? "",
    vitals: {
      bp:   vitals.bp   ?? (vitals.systolicPressure && vitals.diastolicPressure
              ? `${vitals.systolicPressure}/${vitals.diastolicPressure}` : "—"),
      hr:   vitals.hr   ?? vitals.heartRate       ?? "—",
      rr:   vitals.rr   ?? vitals.respirationRate ?? "—",
      spo2: vitals.spo2 ?? vitals.oxygenLevel     ?? "—",
      temp: vitals.temp ?? vitals.temperature     ?? "—",
    },
  };
}

const statusConfig = {
  stable:      { badge:"bg-green-50 text-green-700",  label:"Stable",      bg:"bg-green-50",  num:"bg-green-100 text-green-700"  },
  observation: { badge:"bg-amber-50 text-amber-700",  label:"Observation", bg:"bg-amber-50",  num:"bg-amber-100 text-amber-700"  },
  critical:    { badge:"bg-red-50 text-red-700",      label:"Critical",    bg:"bg-red-50",    num:"bg-red-100 text-red-700"      },
};

export default function PatientDetails() {
  const { patientId } = useParams();
  const location      = useLocation();
  const navigate      = useNavigate();

  const [patient,    setPatient]    = useState(location.state?.patient ?? null);
  const [alerts,     setAlerts]     = useState([]);
  const [vitalTrend, setVitalTrend] = useState([]);
  const [loading,    setLoading]    = useState(!location.state?.patient);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const [pData, trendData] = await Promise.all([
        patientService.getById(patientId),
        analyticsService.getVitalTrend(patientId, 24).catch(() => []),
      ]);
      setPatient(normalisePatient(pData));
      if (Array.isArray(trendData) && trendData.length) setVitalTrend(trendData);
    } catch {
      // fallback to mock
      const mock = mockRooms.find(r => r.id === parseInt(patientId));
      if (mock) setPatient(mock);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async (p) => {
    try {
      // filter mock alerts by room, or fetch real ones
      setAlerts(mockAlerts.filter(a => a.room === p?.num && !a.resolved));
    } catch { setAlerts([]); }
  };

  useEffect(() => {
    if (!patient) fetchPatient();
    else { fetchAlerts(patient); setLoading(false); }
  }, [patientId]);

  useEffect(() => { if (patient) fetchAlerts(patient); }, [patient]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" />
          <div className="flex flex-col gap-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-3 w-32" /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col gap-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-accent font-semibold hover:underline">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-txt-muted text-[14px]">Patient not found.</p>
      </div>
    );
  }

  const cfg = statusConfig[patient.status] ?? statusConfig.stable;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surf transition-colors text-txt-muted hover:text-txt-primary">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">{patient.name}</h1>
          <p className="text-txt-secondary text-[13px] mt-0.5">{patient.num} · {patient.dept} · Age {patient.age}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPatient}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">
            <RefreshCw size={15} />
          </button>
          <span className={`inline-flex px-4 py-2 rounded-xl text-[13px] font-bold ${cfg.badge}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Info + Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><SectionTitle>Patient Information</SectionTitle></CardHeader>
          <div className="p-5 space-y-4">
            {[
              ["Name",            patient.name],
              ["Room / Bed",      patient.num],
              ["Age",             `${patient.age} years`],
              ["Department",      patient.dept],
              ["Assigned Nurse",  patient.nurse],
              ["Assigned Doctor", patient.doctor],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <p className="text-[11px] text-txt-muted font-medium uppercase tracking-wide mb-1">{lbl}</p>
                <p className="text-[14px] font-semibold text-txt-primary">{val}</p>
              </div>
            ))}
            {patient.background && (
              <div>
                <p className="text-[11px] text-txt-muted font-medium uppercase tracking-wide mb-1">Background</p>
                <p className="text-[13px] text-txt-secondary leading-relaxed">{patient.background}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader><SectionTitle>Current Vitals</SectionTitle></CardHeader>
          <div className="p-5 grid grid-cols-2 gap-4">
            {[
              ["bg-red-50",    Heart,    "text-red-600",    "Blood Pressure",   patient.vitals.bp],
              ["bg-blue-50",   Activity, "text-blue-600",   "Heart Rate",       `${patient.vitals.hr} bpm`],
              ["bg-green-50",  Wind,     "text-green-600",  "Respiratory Rate", `${patient.vitals.rr} /min`],
              ["bg-amber-50",  Droplet,  "text-amber-600",  "SpO₂",            patient.vitals.spo2],
            ].map(([bg, Icon, ic, lbl, val]) => (
              <div key={lbl} className={`${bg} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={ic} />
                  <p className="text-[11px] text-txt-muted font-medium">{lbl}</p>
                </div>
                <p className="font-manrope font-bold text-txt-primary text-[18px]">{val}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* NEWS2 */}
      <Card>
        <CardHeader><SectionTitle>NEWS2 Score Assessment</SectionTitle></CardHeader>
        <div className="p-5">
          <div className={`flex items-center gap-4 p-5 rounded-xl ${cfg.bg}`}>
            <div className={`flex items-center justify-center w-16 h-16 rounded-full font-manrope font-extrabold text-[28px] ${cfg.num}`}>
              {patient.news2}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-txt-primary mb-1">Risk Level</p>
              <p className="text-[12px] font-medium text-txt-secondary">
                {patient.news2 >= 7 ? "High Risk — Immediate attention required"
                : patient.news2 >= 4 ? "Medium Risk — Close monitoring needed"
                : "Low Risk — Stable condition"}
              </p>
              {/* NEWS2 bar */}
              <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden w-full max-w-xs">
                <div
                  className={`h-full rounded-full transition-all ${patient.news2 >= 7 ? "bg-danger" : patient.news2 >= 4 ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${Math.min((patient.news2 / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Vital trend chart */}
      {vitalTrend.length > 0 && (
        <Card>
          <CardHeader><SectionTitle>Vital Trend (24h)</SectionTitle></CardHeader>
          <div className="p-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize:11, fill:"#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:12, border:"none", boxShadow:"0 4px 24px rgba(0,0,0,0.1)", fontSize:12 }} />
                <Line type="monotone" dataKey="heartRate"    stroke="#2563EB" strokeWidth={2} dot={false} name="Heart Rate"   />
                <Line type="monotone" dataKey="oxygenLevel"  stroke="#22C55E" strokeWidth={2} dot={false} name="SpO₂"         />
                <Line type="monotone" dataKey="temperature"  stroke="#F59E0B" strokeWidth={2} dot={false} name="Temperature"  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader><SectionTitle>Active Alerts</SectionTitle></CardHeader>
          <div className="p-5 space-y-3">
            {alerts.map(a => {
              const sev = a.severity ?? "info";
              const styles = {
                critical:{ border:"border-l-red-500",   bg:"bg-red-50",    text:"text-red-700",   sub:"text-red-600",   time:"text-red-500"   },
                warning: { border:"border-l-amber-500", bg:"bg-amber-50",  text:"text-amber-700", sub:"text-amber-600", time:"text-amber-500" },
                info:    { border:"border-l-blue-500",  bg:"bg-blue-50",   text:"text-blue-700",  sub:"text-blue-600",  time:"text-blue-500"  },
              }[sev] ?? styles?.info;
              return (
                <div key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${styles.border} ${styles.bg}`}>
                  <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${styles.text}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold ${styles.text}`}>{a.type}</p>
                    <p className={`text-[12px] mt-1 ${styles.sub}`}>{a.detail}</p>
                    <p className={`text-[11px] mt-2 ${styles.time}`}>{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-center text-[12px] text-txt-muted gap-1 p-4 bg-surf rounded-xl">
        <Clock size={12} /> Last updated {patient.lastUpdate}
      </div>
    </div>
  );
}
