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
      // Calling the imported service directly
      const res = await checkPatientMedication(patientId);

      // The response format provided by the user:
      // [{"drug_pair": "...", "level": "", "risk_summary": ""}, ...]
      const data = res.data || [];

      setResult(data);
    } catch (e) {
      console.error("Check failed:", e);
      alert("Safety check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine if the regimen is safe based on the presence of interaction pairs
  const isSafe = result && result.length === 0;
  const hasRisks = result && result.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 border border-white/20">
        {/* Header Section */}
        <div className="p-8 text-center relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-all duration-700 shadow-inner ${
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

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Drug Interaction Check
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Pharmacological safety analysis engine
          </p>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8 flex-1 overflow-y-auto max-h-[45vh] custom-scrollbar bg-white">
          {!result && !loading && (
            <div className="text-center py-6">
              <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm leading-relaxed">
                  Analyze current prescriptions against the patient's clinical
                  history to identify potential contraindications or high-risk
                  combinations.
                </p>
              </div>
              <button
                onClick={runCheck}
                className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-red-700 hover:shadow-xl hover:shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Activity size={18} />
                Run Safety Check
              </button>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-6">
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 font-black text-xs uppercase tracking-widest">
                  Cross-referencing database
                </p>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-tighter">
                  Analyzing molecular compatibility...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Findings
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              {hasRisks ? (
                <div className="space-y-3">
                  {result.map((item, idx) => (
                    <div
                      key={idx}
                      className="group p-5 rounded-3xl bg-red-50/50 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2.5 bg-white rounded-2xl text-red-600 shadow-sm border border-red-50">
                          <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-black text-red-900 leading-tight pr-4">
                              {item.drug_pair}
                            </p>
                            {item.level && (
                              <span className="px-2 py-1 bg-red-600 text-[8px] font-black text-white rounded-lg uppercase tracking-tighter">
                                {item.level}
                              </span>
                            )}
                          </div>
                          {item.risk_summary ? (
                            <p className="text-xs text-red-700/70 font-semibold leading-relaxed">
                              {item.risk_summary}
                            </p>
                          ) : (
                            <p className="text-[10px] text-red-400 italic font-medium">
                              Immediate clinical review recommended for this
                              combination.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-6 rounded-[2rem] bg-green-50/50 border border-green-100 text-center animate-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-50">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <p className="text-green-900 font-black text-base">
                    Clearance Confirmed
                  </p>
                  <p className="text-green-600/70 text-xs font-bold mt-2 leading-relaxed">
                    No dangerous interactions detected. The current medication
                    regimen is clinically compatible.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-8 pt-4 grid grid-cols-2 gap-4 bg-slate-50/50">
          <button
            onClick={onOpenMedicalReport}
            className="flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-[0.98]"
          >
            <FileText size={16} />
            Medical Report
          </button>
          <button
            onClick={onClose}
            className="py-5 bg-white text-slate-600 border border-slate-200 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugCheckModal;
