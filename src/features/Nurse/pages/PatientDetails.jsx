import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  patientApi,
  medicationApi,
  vitalSignsApi,
  medicalReportApi,
} from "../lib/api";
import * as mockData from "../lib/mockData";
import {
  ArrowLeft,
  Heart,
  Pill,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  calculateNewsScore,
  getNewsTextColorClass,
  getNewsBgColorClass,
  getNewsRiskLabel,
} from "../lib/newsScore";

export default function NursePatientDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("vitals");

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      try {
        let data = await patientApi.getPatientById(id);
        if (!data) data = mockData.getPatientById(id);
        return data;
      } catch (err) {
        return mockData.getPatientById(id);
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
  });

  const { data: medicationsData = [] } = useQuery({
    queryKey: ["medications", id],
    queryFn: () => medicationApi.getPatientMedications(id).catch(() => []),
    staleTime: 1000 * 60 * 5,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports", id],
    queryFn: () => medicalReportApi.getPatientReports(id).catch(() => []),
    staleTime: 1000 * 60 * 5,
  });

  if (isPatientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Patient not found
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Combine medications from API and patient object
  const medications = [
    ...(medicationsData || []),
    ...(patient?.medications || []),
  ].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return isNaN(date.getTime())
      ? "N/A"
      : `${date.getDate().toString().padStart(2, "0")} ${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
  };

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case "stable":
        return "bg-status-stable";
      case "critical":
        return "bg-status-critical";
      case "needs_care":
        return "bg-status-needs-care";
      default:
        return "bg-gray-400";
    }
  };

  // Normalize vitals data with support for both camelCase and PascalCase field names
  const normalizeVitals = (vitalsRecord) => {
    if (!vitalsRecord || typeof vitalsRecord !== "object") return {};

    return {
      heartRate: vitalsRecord.HeartRate ?? vitalsRecord.heartRate ?? null,
      temperature: vitalsRecord.Temperature ?? vitalsRecord.temperature ?? null,
      systolicPressure:
        vitalsRecord.SystolicPressure ?? vitalsRecord.systolicPressure ?? null,
      diastolicPressure:
        vitalsRecord.DiastolicPressure ??
        vitalsRecord.diastolicPressure ??
        null,
      oxygenLevel: vitalsRecord.OxygenLevel ?? vitalsRecord.oxygenLevel ?? null,
      respirationRate:
        vitalsRecord.RespirationRate ??
        vitalsRecord.respirationRate ??
        vitalsRecord.respiratoryRate ??
        null,
      recordedAt: vitalsRecord.RecordedAt ?? vitalsRecord.recordedAt ?? null,
    };
  };

  // Get vitals from the most recent source
  let patientVitals = {};
  if (Array.isArray(patient.vitalSigns) && patient.vitalSigns.length > 0) {
    patientVitals = normalizeVitals(patient.vitalSigns[0]);
  } else if (patient.lastVitals) {
    patientVitals = normalizeVitals(patient.lastVitals);
  } else if (patient.vitals) {
    patientVitals = normalizeVitals(patient.vitals);
  }

  const newsScore =
    patient.newsScore ?? calculateNewsScore(patientVitals) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {patient.fullName || patient.name || "Unknown"}
            </h1>
            <p className="text-muted-foreground">{`ID: ${patient.id} | Bed: ${patient.roomNumber || "N/A"}`}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-col items-end gap-3">
              <div
                className={`${getStatusColor(patient.status)} text-white px-4 py-1.5 rounded-full text-sm font-black uppercase shadow-sm`}
              >
                {patient.status || "Unknown"}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/nurse/patient/${patient.id}/vitals`)
                  }
                  className="bg-[#3b82f6] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-1.5"
                >
                  <Plus size={18} strokeWidth={3} /> Record Vitals
                </button>
                <button
                  onClick={() => navigate(`/nurse/patient/${patient.id}/isbar`)}
                  className="bg-[#10b981] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-emerald-600 transition-all"
                >
                  Open ISBAR Handover
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm mt-8 mb-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Age
            </p>
            <p className="text-3xl font-black text-slate-800">{patient.age}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Date of Birth
            </p>
            <p className="text-xl font-bold text-slate-800">
              {formatDate(patient.dateOfBirth)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Admitted At
            </p>
            <p className="text-xl font-bold text-slate-800">
              {formatDate(patient.admittedAt || patient.admissionDate)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              NEWS Score
            </p>
            {newsScore != null ? (
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-black ${getNewsTextColorClass(newsScore)}`}
                >
                  {newsScore}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md ${getNewsBgColorClass(newsScore)} text-white uppercase`}
                >
                  {getNewsRiskLabel(newsScore)}
                </span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-slate-300">N/A</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-border bg-white">
            {[
              { id: "vitals", label: "Vital Signs", icon: Heart },
              { id: "care", label: "Care Report", icon: FileText },
              { id: "medication", label: "Medications", icon: Pill },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-inner"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <tab.icon
                  size={18}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "vitals" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <Heart className="text-red-500 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold">
                    {patientVitals.heartRate || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Heart Rate (bpm)
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <div className="text-2xl mb-2">🌡️</div>
                  <div className="text-2xl font-bold">
                    {patientVitals.temperature
                      ? `${patientVitals.temperature}°C`
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Temperature
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <div className="text-2xl mb-2">🫁</div>
                  <div className="text-2xl font-bold">
                    {patientVitals.respirationRate || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Resp. Rate (bpm)
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <div className="text-2xl mb-2">💧</div>
                  <div className="text-2xl font-bold">
                    {patientVitals.systolicPressure &&
                    patientVitals.diastolicPressure
                      ? `${patientVitals.systolicPressure}/${patientVitals.diastolicPressure}`
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Blood Pressure (mmHg)
                  </div>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <div className="text-2xl mb-2">🫀</div>
                  <div className="text-2xl font-bold">
                    {patientVitals.oxygenLevel
                      ? `${patientVitals.oxygenLevel}%`
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Oxygen Level
                  </div>
                </div>
                {patientVitals.recordedAt && (
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <div className="text-sm font-bold">
                      {formatDate(patientVitals.recordedAt)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Recorded
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "care" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-foreground/90">
                    Care Report (View Only)
                  </h3>

                  <div className="space-y-4">
                    {/* Background / Diagnosis Section */}
                    <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                        Background / Diagnosis (from Doctor)
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {reports.length > 0
                          ? reports[0].diagnosis
                          : patient.background ||
                            patient.admissionDiagnosis ||
                            "No background information available."}
                      </p>
                    </div>

                    {/* Current Treatment Plan Section */}
                    <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                        Current Treatment Plan (from Doctor)
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {reports.length > 0
                          ? reports[0].treatmentPlan
                          : "No treatment plan available."}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-foreground/90">
                    Medical History & Reports
                  </h3>
                  <div className="space-y-3">
                    {reports.length > 0 ? (
                      reports.map((report, i) => (
                        <div
                          key={i}
                          className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-medium text-slate-400 uppercase">
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-bold text-slate-800">
                                Diagnosis:{" "}
                              </span>
                              <span className="text-sm text-slate-600">
                                {report.diagnosis}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-800">
                                Treatment:{" "}
                              </span>
                              <span className="text-sm text-slate-600">
                                {report.treatmentPlan || report.treatment}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-400 italic">
                          No medical history available.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "medication" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Treatment Box */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Pill className="text-blue-600" size={18} />
                      <h4 className="text-sm font-bold text-blue-900">
                        Current Treatment
                      </h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {patient.currentTreatment ||
                        (reports.length > 0
                          ? reports[0].treatmentPlan
                          : "No current treatment plan specified.")}
                    </p>
                  </div>

                  {/* Previous Medications Box */}
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="text-amber-600" size={18} />
                      <h4 className="text-sm font-bold text-amber-900">
                        Previous Medications
                      </h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {patient.previousMedications ||
                        "No previous medications recorded."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-foreground/90">
                    Prescribed Medications
                  </h3>
                  <div className="space-y-4">
                    {medications.length > 0 ? (
                      medications.map((med, i) => (
                        <div
                          key={i}
                          className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm flex justify-between items-center hover:border-blue-200 transition-colors"
                        >
                          <div>
                            <p className="font-bold text-lg text-slate-800">
                              {med.name || med.medicationName || "Unknown"}
                            </p>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              {med.dosage || med.dose || "N/A"} •{" "}
                              {med.frequency || "N/A"} •{" "}
                              {med.route || med.administrationRoute || "N/A"}
                            </p>
                            {med.instructions && (
                              <div className="mt-2 py-1 px-2 bg-slate-50 rounded text-xs text-slate-600 inline-block">
                                {med.instructions}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              navigate(
                                `/nurse/patient/${patient.id}/medication/${med.id}`,
                              )
                            }
                            className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          >
                            Administer
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-400 italic">
                          No medications prescribed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
