import React from "react";
import {
  Heart,
  Wind,
  Thermometer,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  calculateNewsScore,
  getNewsBorderColorClass,
  getNewsTextColorClass,
  getNewsBgColorClass,
  getNewsRiskLabel,
} from "../lib/newsScore";

export default function PatientCard({ patient, onClick }) {
  if (!patient) return null;

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  };

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "stable":
        return "status-stable";
      case "critical":
        return "status-critical animate-pulse-critical";
      case "needs_care":
        return "status-needs-care";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "stable":
        return "Stable";
      case "critical":
        return "Critical";
      case "needs_care":
        return "Needs Care";
      default:
        return "Unknown";
    }
  };

  const getStatusInitial = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "stable":
        return "S";
      case "critical":
        return "C";
      case "needs_care":
        return "N";
      default:
        return "?";
    }
  };

  let record = {};
  const mergedVitals = patient.lastVitals || patient.vitals;
  if (
    mergedVitals &&
    typeof mergedVitals === "object" &&
    Object.keys(mergedVitals).length > 0
  ) {
    const hasVitalData =
      mergedVitals.heartRate != null ||
      mergedVitals.HeartRate != null ||
      mergedVitals.temperature != null ||
      mergedVitals.Temperature != null ||
      mergedVitals.systolicPressure != null ||
      mergedVitals.SystolicPressure != null ||
      mergedVitals.oxygenLevel != null ||
      mergedVitals.OxygenLevel != null;
    if (hasVitalData) {
      record = mergedVitals;
    }
  }

  if (!record || Object.keys(record).length === 0) {
    if (Array.isArray(patient.vitalSigns) && patient.vitalSigns.length > 0) {
      record = patient.vitalSigns[0];
    }
  }

  if (
    (!record || Object.keys(record).length === 0) &&
    patient.latestVitalSign
  ) {
    if (Array.isArray(patient.latestVitalSign)) {
      record =
        patient.latestVitalSign
          .filter(Boolean)
          .map((entry) => ({
            ...entry,
            timestamp: entry?.RecordedAt || entry?.recordedAt || "",
          }))
          .filter((entry) => entry.timestamp)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .pop() ||
        patient.latestVitalSign[0] ||
        {};
    } else if (typeof patient.latestVitalSign === "object") {
      record = patient.latestVitalSign;
    }
  }

  const safeRecord = record || {};
  const vitals = {
    heartRate: safeRecord.HeartRate ?? safeRecord.heartRate ?? "N/A",
    systolicPressure:
      safeRecord.SystolicPressure ?? safeRecord.systolicPressure ?? "N/A",
    diastolicPressure:
      safeRecord.DiastolicPressure ?? safeRecord.diastolicPressure ?? "N/A",
    oxygenLevel: safeRecord.OxygenLevel ?? safeRecord.oxygenLevel ?? "N/A",
    temperature: safeRecord.Temperature ?? safeRecord.temperature ?? "N/A",
    respirationRate:
      safeRecord.RespirationRate ?? safeRecord.respirationRate ?? "N/A",
    updatedAt:
      safeRecord.timestamp ||
      safeRecord.RecordedAt ||
      safeRecord.recordedAt ||
      "Just now",
  };

  const newsScore = calculateNewsScore(vitals);
  const borderClass = getNewsBorderColorClass(newsScore);
  const newsTextClass = getNewsTextColorClass(newsScore);
  const newsBgClass = getNewsBgColorClass(newsScore);
  const riskLabel = getNewsRiskLabel(newsScore);

  return (
    <div
      onClick={onClick}
      className={`patient-card cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-l-8 rounded-2xl ${borderClass}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`status-badge w-12 h-12 flex items-center justify-center rounded-2xl text-white font-bold text-lg shadow-lg ${getStatusColor(patient.status)}`}
          >
            {getStatusInitial(patient.status)}
          </div>
          <div>
            <h3 className="font-bold text-xl text-foreground">
              {patient.name || patient.fullName}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              ID: {patient.id}
              {patient.roomNumber || patient.bedId != null
                ? ` | Room: ${patient.roomNumber || patient.bedId}`
                : ""}
            </p>
          </div>
        </div>
        {newsScore != null && (
          <div
            className={`flex flex-col items-center px-4 py-2 rounded-2xl ${newsBgClass} text-white shadow-lg`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              NEWS
            </span>
            <span className="text-2xl font-black leading-tight">
              {newsScore}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-5">
        <div className="inline-block px-3 py-1 bg-secondary rounded-xl text-xs font-bold text-foreground/70 uppercase tracking-wide">
          {getStatusLabel(patient.status)}
        </div>
        {newsScore != null && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide ${newsTextClass} bg-secondary`}
          >
            <AlertTriangle size={14} />
            {riskLabel}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="vital-display bg-secondary/30 rounded-2xl p-4 border border-border/50">
          <Heart size={18} className="text-red-500 mb-2" />
          <div className="vital-value text-2xl">{vitals.heartRate}</div>
          <div className="vital-label text-[10px]">Heart Rate</div>
        </div>
        <div className="vital-display bg-secondary/30 rounded-2xl p-4 border border-border/50">
          <Thermometer size={18} className="text-orange-500 mb-2" />
          <div className="vital-value text-2xl">
            {vitals.temperature !== "N/A" ? `${vitals.temperature}°` : "—"}
          </div>
          <div className="vital-label text-[10px]">Temperature</div>
        </div>
        <div className="vital-display bg-secondary/30 rounded-2xl p-4 border border-border/50">
          <Activity size={18} className="text-blue-500 mb-2" />
          <div className="vital-value text-2xl">
            {vitals.oxygenLevel !== "N/A" ? `${vitals.oxygenLevel}%` : "—"}
          </div>
          <div className="vital-label text-[10px]">Oxygen</div>
        </div>
        <div className="vital-display bg-secondary/30 rounded-2xl p-4 border border-border/50">
          <Wind size={18} className="text-green-500 mb-2" />
          <div className="vital-value text-2xl">{vitals.respirationRate}</div>
          <div className="vital-label text-[10px]">Respiration</div>
        </div>
      </div>

      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-t border-border pt-4">
        Last Updated: {vitals.updatedAt}
      </div>
    </div>
  );
}
