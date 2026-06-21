import React, { useState } from "react";
import {
  Pill,
  AlertTriangle,
  FileText,
  X,
  CheckCircle,
  Activity,
} from "lucide-react";
import { checkPatientMedication } from "../../../APIS/apiHandler";

const DrugCheckModal = ({ patientId, onClose, onOpenMedicalReport }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await checkPatientMedication(patientId);
      const data = Array.isArray(res?.data) ? res.data : [];
      setResult(data);
    } catch (e) {
      console.error("Check failed:", e);
      alert("Safety check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSafe = Array.isArray(result) && result.length === 0;
  const hasRisks = Array.isArray(result) && result.length > 0;

  // 🔥 FULL SEVERITY SYSTEM (INCLUDING ICON COMPONENTS)
  const getSeverity = (level) => {
    const l = level?.toLowerCase();

    if (l === "minor") {
      return {
        card: "bg-yellow-50/50 border-yellow-200",
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        text: "text-yellow-900",
        badge: "bg-yellow-500 text-white border-yellow-200",
      };
    }

    if (l === "none") {
      return {
        card: "bg-emerald-50/30 border-emerald-100",
        icon: Activity,
        iconColor: "text-emerald-500",
        text: "text-emerald-800",
        badge: "bg-emerald-400 text-white border-emerald-100",
      };
    }

    // HIGH / DEFAULT
    return {
      card: "bg-red-50/50 border-red-100",
      icon: AlertTriangle,
      iconColor: "text-red-600",
      text: "text-red-900",
      badge: "bg-red-600 text-white border-red-50",
    };
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 border border-white/20">
        {/* HEADER */}
        <div className="p-8 text-center relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full"
          >
            <X size={20} />
          </button>

          <div
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-all ${
              loading
                ? "bg-blue-50 text-blue-600 animate-pulse"
                : hasRisks
                  ? "bg-red-50 text-red-600"
                  : isSafe
                    ? "bg-green-50 text-green-600"
                    : "bg-slate-100 text-slate-400"
            }`}
          >
            {loading ? <Activity size={40} /> : <Pill size={40} />}
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Drug Interaction Check
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Pharmacological safety analysis engine
          </p>
        </div>

        {/* BODY */}
        <div className="p-8 flex-1 overflow-y-auto max-h-[45vh] bg-white">
          {!result && !loading && (
            <div className="text-center py-6">
              <button
                onClick={runCheck}
                className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em]"
              >
                Run Safety Check
              </button>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
              </div>

              <p className="text-slate-900 font-black text-xs uppercase">
                Checking interactions...
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {hasRisks ? (
                result.map((item, idx) => {
                  const s = getSeverity(item.level);
                  const Icon = s.icon;

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-3xl border transition-all ${s.card}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* ICON (FULL DYNAMIC) */}
                        <div
                          className={`mt-1 p-2.5 bg-white rounded-2xl shadow-sm ${s.iconColor}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm font-black pr-4 ${s.text}`}>
                              {item.drug_pair}
                            </p>

                            {item.level && (
                              <span
                                className={`px-2 py-1 text-[8px] font-black rounded-lg uppercase border ${s.badge}`}
                              >
                                {item.level}
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs font-semibold ${s.text} opacity-70`}
                          >
                            {item.risk_summary ||
                              "Immediate clinical review recommended."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 px-6 rounded-[2rem] bg-green-50/50 border border-green-100 text-center">
                  <CheckCircle
                    size={32}
                    className="text-green-500 mx-auto mb-4"
                  />
                  <p className="text-green-900 font-black">
                    Clearance Confirmed
                  </p>
                  <p className="text-green-600/70 text-xs font-bold mt-2">
                    No dangerous interactions detected.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 pt-4 grid grid-cols-1 gap-4 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-600 border border-slate-200 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugCheckModal;
