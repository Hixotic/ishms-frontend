import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  FileText,
  PhoneCall,
  Save,
  Loader2,
} from "lucide-react";
import { isbarApi } from "../lib/api";

const recommendationOptions = [
  { value: "urgent-review", label: "Request Urgent Review" },
  { value: "lab-tests", label: "Request Lab Tests" },
  { value: "medication-adjustment", label: "Request Medication Adjustment" },
  { value: "ward-transfer", label: "Request Ward Transfer" },
];

const nurseName = "Nurse Samira";
const nurseCredentials = "RN – iSHMS Clinical Nursing";

const getSeverityColor = (value, metric) => {
  if (metric === "oxygenSaturation") {
    if (value <= 91) return "bg-red-500";
    if (value <= 93) return "bg-amber-500";
    return "bg-emerald-500";
  }
  if (metric === "heartRate") {
    if (value > 130 || value < 40) return "bg-red-500";
    if (value > 110 || value < 50) return "bg-amber-500";
    return "bg-emerald-500";
  }
  if (metric === "respiratoryRate") {
    if (value >= 25 || value <= 8) return "bg-red-500";
    if (value >= 21) return "bg-amber-500";
    return "bg-emerald-500";
  }
  if (metric === "temperature") {
    if (value >= 39.1 || value <= 35) return "bg-red-500";
    if (value >= 38.1 || value <= 36) return "bg-amber-500";
    return "bg-emerald-500";
  }
  return "bg-slate-400";
};

const calculateNEWS2Score = (vitals) => {
  if (!vitals) return 0;
  const bloodPressure =
    vitals.bloodPressure ||
    (vitals.systolicPressure && vitals.diastolicPressure
      ? `${vitals.systolicPressure}/${vitals.diastolicPressure}`
      : "120/80");
  const heartRate = vitals.heartRate || vitals.heartRateBpm || 70;
  const oxygenSaturation = vitals.oxygenSaturation || vitals.oxygenLevel || 98;
  const respiratoryRate =
    vitals.respiratoryRate || vitals.respirationRate || 16;
  const temperature = vitals.temperature || 37;
  const [systolic] = String(bloodPressure).split("/").map(Number);
  const bpScore =
    systolic <= 90 ? 3 : systolic <= 100 ? 2 : systolic <= 110 ? 1 : 0;
  const hrScore =
    heartRate >= 131 || heartRate <= 40
      ? 3
      : heartRate >= 111
        ? 2
        : heartRate >= 91
          ? 1
          : 0;
  const rrScore =
    respiratoryRate >= 25 || respiratoryRate <= 8
      ? 3
      : respiratoryRate >= 21
        ? 2
        : respiratoryRate >= 12
          ? 0
          : 1;
  const spo2Score =
    oxygenSaturation <= 91
      ? 3
      : oxygenSaturation <= 93
        ? 2
        : oxygenSaturation <= 95
          ? 1
          : 0;
  const tempScore =
    temperature <= 35 || temperature >= 39.1
      ? 3
      : temperature >= 38.1
        ? 1
        : temperature <= 36
          ? 1
          : 0;
  return bpScore + hrScore + rrScore + spo2Score + tempScore;
};

const stepConfig = [
  {
    key: "situation",
    label: "Situation",
    icon: PhoneCall,
    color: "bg-sky-500",
  },
  {
    key: "background",
    label: "Background",
    icon: FileText,
    color: "bg-amber-500",
  },
  {
    key: "assessment",
    label: "Assessment",
    icon: Activity,
    color: "bg-red-500",
  },
  {
    key: "recommendation",
    label: "Recommendation",
    icon: ClipboardList,
    color: "bg-emerald-500",
  },
];

export default function ISBARModule({ patient }) {
  const [activeStep, setActiveStep] = useState(0);
  const [recommendationType, setRecommendationType] = useState("");
  const [recommendationText, setRecommendationText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (patient?.id && !recommendationText) {
      handleGenerateAI();
    }
  }, [patient?.id]);

  const currentVitals = useMemo(() => {
    return Array.isArray(patient.vitalSigns) && patient.vitalSigns.length > 0
      ? patient.vitalSigns[0]
      : patient.lastVitals || patient.vitals || {};
  }, [patient]);

  const news2Score = useMemo(
    () => calculateNEWS2Score(currentVitals),
    [currentVitals],
  );
  const situationText = `I am ${nurseName}, calling about ${patient.name || "the patient"} in Room ${patient.roomNumber || "N/A"}. The current NEWS2 score is ${news2Score}.`;

  const assessmentTrend = useMemo(() => {
    if (Array.isArray(patient.vitalTrend) && patient.vitalTrend.length >= 3) {
      return patient.vitalTrend.slice(-3);
    }
    const bp =
      currentVitals.bloodPressure ||
      (currentVitals.systolicPressure && currentVitals.diastolicPressure
        ? `${currentVitals.systolicPressure}/${currentVitals.diastolicPressure}`
        : "N/A");
    return [
      {
        timestamp: "Current",
        bloodPressure: bp,
        heartRate: currentVitals.heartRate || "N/A",
        oxygenSaturation:
          currentVitals.oxygenSaturation || currentVitals.oxygenLevel || "N/A",
        respiratoryRate:
          currentVitals.respiratoryRate ||
          currentVitals.respirationRate ||
          "N/A",
      },
    ];
  }, [patient.vitalTrend, currentVitals]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setSubmitError("");
    try {
      const vitals =
        patient.lastVitals ||
        (Array.isArray(patient.vitalSigns) ? patient.vitalSigns[0] : {}) ||
        {};
      const comorbidities = Array.isArray(patient.comorbidities)
        ? patient.comorbidities.join(", ")
        : "None";
      const payload = {
        identification: `This is ${nurseName} calling from the department about ${patient.name || "the patient"} (Room ${patient.roomNumber || "N/A"}).`,
        background: `Patient is ${patient.age || "N/A"} years old admitted for ${patient.admissionDiagnosis || "observation"}. History: ${comorbidities}. NEWS Score: ${news2Score}. Status: ${patient.status}. Vitals: HR ${vitals.heartRate || "N/A"}, BP ${vitals.bloodPressure || "N/A"}, O2 Sat ${vitals.oxygenSaturation || vitals.oxygenLevel || "N/A"}%, Temp ${vitals.temperature || "N/A"}C.`,
      };

      try {
        let result;
        try {
          result = await isbarApi.getIsbarReport(patient.id);
        } catch (azureErr) {
          result = await isbarApi.generateIsbar(payload);
        }
        let text = "";
        if (typeof result === "string") text = result;
        else if (result && typeof result === "object") {
          text =
            result.isbar ||
            result.content ||
            result.message ||
            result.isbarReport ||
            JSON.stringify(result);
        }
        setRecommendationText(text);
      } catch (apiErr) {
        const fallbackText = `Patient ${patient.name} shows a NEWS2 score of ${news2Score}. Current vitals are: HR ${vitals.heartRate || "N/A"}, BP ${vitals.bloodPressure || "N/A"}. Given the ${patient.status} status, I recommend an urgent review and further assessment of the patient's condition.`;
        setRecommendationText(fallbackText);
      }
      setRecommendationType("urgent-review");
      setActiveStep(3);
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try manual entry.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (recommendationType === "" || recommendationText.trim().length < 10) {
      setSubmitError(
        "Please finish the recommendation section before submitting.",
      );
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="bg-surface/40 dark:bg-background/40 rounded-[2.5rem] border border-border p-3 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row gap-6 p-4">
        <div className="lg:w-72 flex flex-col gap-2">
          {stepConfig.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(index)}
                className={`group relative flex items-center gap-4 rounded-3xl p-4 transition-all duration-300 ${
                  isActive
                    ? "bg-primary shadow-lg shadow-primary/20"
                    : "hover:bg-secondary/80"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : isCompleted
                        ? step.color
                        : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${isActive ? "text-white" : isCompleted ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${isActive ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    Step {index + 1}
                  </p>
                  <p
                    className={`font-bold ${isActive ? "text-white" : "text-foreground"}`}
                  >
                    {step.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {activeStep === 0 && (
                <div className="space-y-5">
                  <div className="rounded-3xl bg-secondary/30 p-5 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                      Situation Statement
                    </p>
                    <p className="text-lg font-medium leading-relaxed">
                      {situationText}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Patient
                      </p>
                      <p className="font-bold">{patient.name}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Room</p>
                      <p className="font-bold">{patient.roomNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="w-full p-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Regenerate ISBAR
                  </button>
                </div>
              )}
              {activeStep === 1 && (
                <div className="space-y-5">
                  <div className="p-5 rounded-3xl bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                      Background Information
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {patient.background ||
                        patient.admissionDiagnosis ||
                        "No history available."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Allergies
                      </p>
                      <p className="text-sm font-medium">
                        {Array.isArray(patient.allergies)
                          ? patient.allergies.join(", ")
                          : "None"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Admitted
                      </p>
                      <p className="text-sm font-medium">
                        {patient.admissionDate || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl border border-border text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">
                        HR
                      </p>
                      <p
                        className={`text-xl font-bold ${getSeverityColor(currentVitals.heartRate, "heartRate").replace("bg-", "text-")}`}
                      >
                        {currentVitals.heartRate || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">
                        SpO2
                      </p>
                      <p
                        className={`text-xl font-bold ${getSeverityColor(currentVitals.oxygenSaturation || currentVitals.oxygenLevel, "oxygenSaturation").replace("bg-", "text-")}`}
                      >
                        {currentVitals.oxygenSaturation ||
                          currentVitals.oxygenLevel ||
                          "—"}
                        %
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">
                        RR
                      </p>
                      <p
                        className={`text-xl font-bold ${getSeverityColor(currentVitals.respiratoryRate || currentVitals.respirationRate, "respiratoryRate").replace("bg-", "text-")}`}
                      >
                        {currentVitals.respiratoryRate ||
                          currentVitals.respirationRate ||
                          "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">
                        Temp
                      </p>
                      <p
                        className={`text-xl font-bold ${getSeverityColor(currentVitals.temperature, "temperature").replace("bg-", "text-")}`}
                      >
                        {currentVitals.temperature || "—"}°
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-3xl border border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Vital Signs Trend
                    </p>
                    <div className="space-y-2">
                      {assessmentTrend.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/50"
                        >
                          <span className="font-medium">{item.timestamp}</span>
                          <span className="text-muted-foreground">
                            BP: {item.bloodPressure} | HR: {item.heartRate} |
                            SpO2: {item.oxygenSaturation}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Select Recommendation
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRecommendationType(opt.value)}
                          className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                            recommendationType === opt.value
                              ? "bg-primary text-white border-primary"
                              : "bg-secondary/50 border-border hover:border-primary/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      Details
                    </p>
                    <textarea
                      value={recommendationText}
                      onChange={(e) => setRecommendationText(e.target.value)}
                      className="w-full h-40 p-4 rounded-3xl bg-secondary/30 border border-border focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                      placeholder="Enter detailed recommendation..."
                    />
                  </div>
                  {submitError && (
                    <p className="text-xs text-red-500 font-medium">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full p-4 rounded-3xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                  >
                    Complete & Submit Handover
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
