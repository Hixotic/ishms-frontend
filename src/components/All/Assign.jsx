import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BedDouble, CheckCircle2, Users, Activity, ChevronDown, ChevronUp,
  Search, AlertTriangle, Clock, User, Stethoscope, LayoutGrid, List,
  X, ArrowRightLeft, Loader2,
} from "lucide-react";
import { assignBed } from '../../api/apiHandler';

const NEWS_COLOR = (score) => {
  if (score >= 7) return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-500", label: "HIGH" };
  if (score >= 4) return { bg: "bg-amber-100", text: "text-amber-700", badge: "bg-amber-400", label: "MED" };
  return { bg: "bg-emerald-100", text: "text-emerald-700", badge: "bg-emerald-500", label: "LOW" };
};
const STATUS_STYLE = {
  Critical:          { dot: "bg-red-500",     text: "text-red-600",    bg: "bg-red-50"    },
  UnderObservation:  { dot: "bg-amber-400",   text: "text-amber-600",  bg: "bg-amber-50"  },
  WaitingDoctor:     { dot: "bg-purple-400",  text: "text-purple-600", bg: "bg-purple-50" },
  Stable:            { dot: "bg-emerald-500", text: "text-emerald-600",bg: "bg-emerald-50"},
};
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}
export const TransferModal = ({ patient, departments, onClose, onSuccess }) => {
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState(null);

  const news   = NEWS_COLOR(patient.newsScore);
  const status = STATUS_STYLE[patient.flowStatus] || STATUS_STYLE.Stable;

  const handleConfirm = async () => {
    if (!selectedDeptId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await assignBed({ patientId: patient.patientId, departmentId: Number(selectedDeptId) });
      onSuccess();
    } catch (err) {
      setSubmitError(err?.message || "Transfer failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-blue-600" />
            <span className="text-sm font-black text-slate-800">Transfer / Assign Patient</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-slate-800 truncate">{patient.patientName}</div>
              <div className="text-xs text-slate-500 mt-0.5">Age {patient.age} · {patient.roomNumber}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.bg} ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {patient.flowStatus}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${news.badge}`}>
                  NEWS {patient.newsScore}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={9} /> {timeAgo(patient.admittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-bold text-slate-600 mb-2">
            Select Target Department
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            disabled={submitting}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">— Choose department —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {submitError && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertTriangle size={12} />
              {submitError}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDeptId || submitting}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Transferring…
              </>
            ) : (
              <>
                <ArrowRightLeft size={14} />
                Confirm Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}