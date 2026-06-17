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

  // Priority: lastVitals/vitals (merged with server data) > vitalSigns > latestVitalSign (Azure API)
  // lastVitals/vitals from dashboard normalization already includes server/local merged data
  let record = {};

  // 1. Try lastVitals/vitals first (these contain merged data from local server - HIGHEST PRIORITY)
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

  // 2. Try vitalSigns array next
  if (!record || Object.keys(record).length === 0) {
    if (Array.isArray(patient.vitalSigns) && patient.vitalSigns.length > 0) {
      record = patient.vitalSigns[0];
    }
  }

  // 3. Finally try latestVitalSign (from Azure API - may be outdated)
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
            timestamp: entry.RecordedAt || entry.recordedAt || "",
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

  const vitals = {
    heartRate: record.HeartRate ?? record.heartRate ?? "N/A",
    systolicPressure:
      record.SystolicPressure ?? record.systolicPressure ?? "N/A",
    diastolicPressure:
      record.DiastolicPressure ?? record.diastolicPressure ?? "N/A",
    oxygenLevel: record.OxygenLevel ?? record.oxygenLevel ?? "N/A",
    temperature: record.Temperature ?? record.temperature ?? "N/A",
    respirationRate: record.RespirationRate ?? record.respirationRate ?? "N/A",
  };

  // Calculate NEWS score from vitals
  const newsScore = calculateNewsScore(vitals);
  const borderClass = getNewsBorderColorClass(newsScore);
  const newsTextClass = getNewsTextColorClass(newsScore);
  const newsBgClass = getNewsBgColorClass(newsScore);
  const riskLabel = getNewsRiskLabel(newsScore);

  return React.createElement(
    "div",
    {
      onClick,
      className: `patient-card cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 border-l-4 ${borderClass}`,
    },
    React.createElement(
      "div",
      { className: "flex items-start justify-between mb-4" },
      React.createElement(
        "div",
        { className: "flex items-center space-x-3" },
        React.createElement(
          "div",
          { className: `status-badge ${getStatusColor(patient.status)}` },
          getStatusInitial(patient.status),
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "h3",
            { className: "font-bold text-lg" },
            patient.name || patient.fullName,
          ),
          React.createElement(
            "p",
            { className: "text-sm text-muted-foreground" },
            "ID: ",
            patient.id,
            patient.roomNumber || patient.bedId != null
              ? ` | Room: ${patient.roomNumber || patient.bedId}`
              : "",
          ),
        ),
      ),
      // NEWS Score badge
      newsScore != null &&
        React.createElement(
          "div",
          {
            className: `flex flex-col items-center px-3 py-1 rounded-lg ${newsBgClass} text-white`,
          },
          React.createElement(
            "span",
            { className: "text-xs font-medium" },
            "NEWS",
          ),
          React.createElement(
            "span",
            { className: "text-xl font-bold leading-tight" },
            newsScore,
          ),
        ),
    ),

    React.createElement(
      "div",
      { className: "flex items-center gap-2 mb-3" },
      React.createElement(
        "div",
        {
          className:
            "inline-block px-2 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground",
        },
        getStatusLabel(patient.status),
      ),
      newsScore != null &&
        React.createElement(
          "div",
          {
            className: `inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${newsTextClass} bg-secondary`,
          },
          React.createElement(AlertTriangle, { size: 12 }),
          riskLabel,
        ),
    ),

    React.createElement(
      "div",
      { className: "grid grid-cols-2 gap-3 mb-4" },
      React.createElement(
        "div",
        { className: "vital-display" },
        React.createElement(Heart, {
          size: 16,
          className: "text-red-500 mb-1",
        }),
        React.createElement(
          "div",
          { className: "vital-value" },
          vitals.heartRate,
        ),
        React.createElement("div", { className: "vital-label" }, "Heart Rate"),
      ),
      React.createElement(
        "div",
        { className: "vital-display" },
        React.createElement(Thermometer, {
          size: 16,
          className: "text-orange-500 mb-1",
        }),
        React.createElement(
          "div",
          { className: "vital-value" },
          vitals.temperature !== "N/A" ? `${vitals.temperature}°` : "—",
        ),
        React.createElement("div", { className: "vital-label" }, "Temperature"),
      ),
      React.createElement(
        "div",
        { className: "vital-display" },
        React.createElement(Activity, {
          size: 16,
          className: "text-blue-500 mb-1",
        }),
        React.createElement(
          "div",
          { className: "vital-value" },
          vitals.oxygenLevel !== "N/A" ? `${vitals.oxygenLevel}%` : "—",
        ),
        React.createElement("div", { className: "vital-label" }, "Oxygen"),
      ),
      React.createElement(
        "div",
        { className: "vital-display" },
        React.createElement(Wind, {
          size: 16,
          className: "text-green-500 mb-1",
        }),
        React.createElement(
          "div",
          { className: "vital-value" },
          vitals.respirationRate,
        ),
        React.createElement("div", { className: "vital-label" }, "Respiration"),
      ),
    ),

    React.createElement(
      "div",
      { className: "text-xs text-muted-foreground" },
      `Last Updated: ${vitals.updatedAt || record.updatedAt || record.recordedAt || "N/A"}`,
    ),
  );
}
