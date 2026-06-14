import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientById } from "./APIS/apiHandler";
import { AlertCircle, Heart, Thermometer, Activity, Wind } from "lucide-react";

/* ---------------- STATUS ---------------- */
const normalizeStatus = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("critical")) return "critical";
  if (s.includes("need")) return "needs_care";
  if (s.includes("stable")) return "stable";
  return "unknown";
};

/* ---------------- NEWS SCORE ---------------- */
const calculateNewsScore = (v = {}) => {
  let score = 0;

  if (v.heartRate > 110 || v.heartRate < 50) score += 3;
  else if (v.heartRate > 100) score += 1;

  if (v.temperature > 38 || v.temperature < 36) score += 2;

  if (v.oxygenLevel < 92) score += 3;
  else if (v.oxygenLevel < 95) score += 1;

  if (v.respirationRate > 24 || v.respirationRate < 10) score += 2;

  return score;
};

const getRisk = (s) => {
  if (s >= 7) return { label: "CRITICAL", color: "red" };
  if (s >= 4) return { label: "HIGH", color: "orange" };
  if (s >= 1) return { label: "MEDIUM", color: "yellow" };
  return { label: "LOW", color: "green" };
};

export default function NursePatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getPatientById(id);
      setPatient(res?.data || res);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!patient) {
    return (
      <div className="p-6 text-red-600 flex gap-2 items-center">
        <AlertCircle /> Patient not found
      </div>
    );
  }

  const vitals = patient.vitalSigns?.[patient.vitalSigns.length - 1] || {};

  const score = calculateNewsScore(vitals);
  const risk = getRisk(score);

  const status = normalizeStatus(patient.status);

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{patient.fullName}</h1>
          <p className="text-gray-500">Bed {patient.bedId}</p>
        </div>

        <div
          className="px-3 py-1 text-white rounded"
          style={{ background: risk.color }}
        >
          {risk.label} ({score})
        </div>
      </div>

      {/* VITALS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>❤️ HR: {vitals.heartRate ?? "-"}</div>
        <div>🌡 Temp: {vitals.temperature ?? "-"}</div>
        <div>💨 SpO2: {vitals.oxygenLevel ?? "-"}</div>
        <div>🫁 RR: {vitals.respirationRate ?? "-"}</div>
      </div>

      {/* QUICK INFO ONLY */}
      <div className="mt-6 space-y-2">
        <p>
          <b>Status:</b> {status}
        </p>
        <p>
          <b>Background:</b> {patient.background}
        </p>
        <p>
          <b>Treatment:</b> {patient.currentTreatment}
        </p>
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-black text-white rounded"
      >
        Back
      </button>
    </div>
  );
}
