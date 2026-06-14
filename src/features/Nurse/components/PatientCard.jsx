import React from "react";
import {
  Heart,
  Wind,
  Thermometer,
  Activity,
  AlertTriangle,
} from "lucide-react";

/* ---------------- NEWS SCORE (INLINE IMPLEMENTATION) ---------------- */

const calculateNewsScore = (v) => {
  if (!v) return 0;

  const hr = Number(v.heartRate) || 0;
  const temp = Number(v.temperature) || 0;
  const o2 = Number(v.oxygenLevel) || 0;
  const rr = Number(v.respirationRate) || 0;

  let score = 0;

  // Heart Rate
  if (hr <= 40 || hr >= 131) score += 3;
  else if (hr >= 111) score += 2;
  else if (hr >= 91) score += 1;

  // Oxygen
  if (o2 <= 91) score += 3;
  else if (o2 <= 93) score += 2;
  else if (o2 <= 95) score += 1;

  // Temperature
  if (temp <= 35 || temp >= 39) score += 2;
  else if (temp >= 38) score += 1;

  // Respiration
  if (rr <= 8 || rr >= 25) score += 3;
  else if (rr >= 21) score += 2;
  else if (rr >= 19) score += 1;

  return score;
};

const getNewsRiskLabel = (score) => {
  if (score >= 7) return "CRITICAL";
  if (score >= 5) return "HIGH RISK";
  if (score >= 3) return "MEDIUM";
  return "LOW";
};

const getNewsBorderColorClass = (score) => {
  if (score >= 7) return "border-red-500";
  if (score >= 5) return "border-orange-400";
  if (score >= 3) return "border-yellow-400";
  return "border-green-400";
};

const getNewsTextColorClass = (score) => {
  if (score >= 7) return "text-red-600";
  if (score >= 5) return "text-orange-500";
  if (score >= 3) return "text-yellow-600";
  return "text-green-600";
};

const getNewsBgColorClass = (score) => {
  if (score >= 7) return "bg-red-500";
  if (score >= 5) return "bg-orange-400";
  if (score >= 3) return "bg-yellow-400";
  return "bg-green-500";
};

/* ---------------- COMPONENT ---------------- */

export default function PatientCard({ patient, onClick }) {
  if (!patient) return null;

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const status = normalizeStatus(patient.status);

  const getStatusStyle = () => {
    switch (status) {
      case "stable":
        return "border-green-400 bg-green-50";
      case "critical":
        return "border-red-400 bg-red-50";
      case "needs_care":
        return "border-orange-400 bg-orange-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  /* ---------------- VITALS ---------------- */

  const v = patient.latestVitalSign || {};

  const vitals = {
    heartRate: v.heartRate ?? "—",
    oxygenLevel: v.oxygenLevel ?? "—",
    temperature: v.temperature ?? "—",
    respirationRate: v.respirationRate ?? "—",
    updatedAt: v.recordedAt || "Just now",
  };

  const newsScore = calculateNewsScore(v);
  const riskLabel = getNewsRiskLabel(newsScore);

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl p-5 border-l-4 shadow-sm
        transition hover:shadow-md hover:-translate-y-1
        bg-white ${getStatusStyle()} ${getNewsBorderColorClass(newsScore)}
      `}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {patient.fullName}
          </h3>
          <p className="text-sm text-gray-500">
            Bed {patient.bedId} • Age {patient.age}
          </p>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getNewsBgColorClass(
            newsScore,
          )}`}
        >
          NEWS {newsScore}
        </div>
      </div>

      {/* STATUS */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded bg-white border`}
        >
          {status.toUpperCase()}
        </span>

        <span
          className={`text-xs font-semibold ${getNewsTextColorClass(
            newsScore,
          )}`}
        >
          <AlertTriangle size={12} className="inline mr-1" />
          {riskLabel}
        </span>
      </div>

      {/* VITALS */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-gray-800">
        <div className="p-2 bg-gray-50 rounded">
          <Heart className="text-red-500 w-4 h-4 mb-1" />
          <p className="text-sm font-bold">{vitals.heartRate}</p>
          <p className="text-xs text-gray-500">Heart Rate</p>
        </div>

        <div className="p-2 bg-gray-50 rounded">
          <Thermometer className="text-orange-500 w-4 h-4 mb-1" />
          <p className="text-sm font-bold">{vitals.temperature}°</p>
          <p className="text-xs text-gray-500">Temperature</p>
        </div>

        <div className="p-2 bg-gray-50 rounded">
          <Activity className="text-blue-500 w-4 h-4 mb-1" />
          <p className="text-sm font-bold">{vitals.oxygenLevel}%</p>
          <p className="text-xs text-gray-500">Oxygen</p>
        </div>

        <div className="p-2 bg-gray-50 rounded">
          <Wind className="text-green-500 w-4 h-4 mb-1" />
          <p className="text-sm font-bold">{vitals.respirationRate}</p>
          <p className="text-xs text-gray-500">Respiration</p>
        </div>
      </div>

      {/* FOOTER */}
      <p className="text-xs text-gray-400">Last updated: {vitals.updatedAt}</p>
    </div>
  );
}
