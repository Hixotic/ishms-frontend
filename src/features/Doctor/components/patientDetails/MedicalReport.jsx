import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  FileText,
  Save,
  Clipboard,
  Activity,
  ChevronRight,
} from "lucide-react";

const MedicalReportModal = ({ patient, onClose, onSave, existingReport }) => {
  const [data, setData] = useState({
    diagnosis: existingReport?.diagnosis || "",
    treatmentPlan: existingReport?.treatmentPlan || "",
    reportType: existingReport?.reportType || 1,
  });
  const [loading, setLoading] = useState(false);
  const canWrite = patient.flowStatus === "WaitingDoctor" || !!existingReport;

  const handleSubmit = async () => {
    if (!data.diagnosis || !data.treatmentPlan)
      return alert("Please fill all required fields");
    setLoading(true);
    try {
      await onSave({ patientId: patient.id, ...data });
      onClose();
    } catch (e) {
      alert("Failed to save report. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      {/* Custom CSS to hide scrollbars globally within this component */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header Section - Cleaned up borders */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight leading-tight">
                  Medical Report
                </h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  Patient: {patient.fullName} • ID:{" "}
                  {String(patient.id || "").substring(0, 6)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {!canWrite ? (
          /* Restriction State */
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Action Restricted
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                Reports can only be drafted when the patient flow status is{" "}
                <span className="text-amber-600 font-bold">
                  "Waiting Doctor"
                </span>
                .
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form State - Optimized Spacing */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto hide-scrollbar">
              {/* Report Type Selection - Compacted */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 1, label: "Initial Assessment" },
                  { id: 2, label: "Discharge Summary" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setData({ ...data, reportType: type.id })}
                    className={`py-3 px-4 rounded-2xl border-2 text-center transition-all ${
                      data.reportType === type.id
                        ? "border-purple-600 bg-purple-50 text-purple-900"
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider">
                      {type.label}
                    </p>
                  </button>
                ))}
              </div>

              {/* Diagnosis Field - Taller & Better Placeholder */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  <Activity size={12} />
                  Clinical Diagnosis
                </label>
                <textarea
                  value={data.diagnosis}
                  onChange={(e) =>
                    setData({ ...data, diagnosis: e.target.value })
                  }
                  className="w-full p-4 rounded-2xl border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600/20 outline-none transition-all text-sm font-semibold min-h-[120px] resize-none placeholder:text-slate-300"
                  placeholder="Type findings here..."
                />
              </div>

              {/* Treatment Plan Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  <ChevronRight size={12} />
                  Treatment Plan
                </label>
                <textarea
                  value={data.treatmentPlan}
                  onChange={(e) =>
                    setData({ ...data, treatmentPlan: e.target.value })
                  }
                  className="w-full p-4 rounded-2xl border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600/20 outline-none transition-all text-sm font-semibold min-h-[120px] resize-none placeholder:text-slate-300"
                  placeholder="Type plan here..."
                />
              </div>
            </div>

            {/* Footer Actions - Flush to bottom, no extra borders */}
            <div className="p-6 bg-white border-t border-slate-50 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                {loading ? "Saving..." : "Save Report"}
              </button>
              <button
                onClick={onClose}
                className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReportModal;
