import React from 'react';
import { Calendar, Clock, Bed, HeartPulse, ShieldCheck, ClipboardList, X } from 'lucide-react';

const statusColor = (status) => {
  if (status === 'Critical') return 'bg-red-100 text-red-700';
  if (status === 'Unstable') return 'bg-yellow-100 text-yellow-700';
  return 'bg-emerald-100 text-emerald-700';
};

const PatientDetailsModal = ({ patient, isOpen, onClose }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500 text-2xl font-bold text-white">
              {patient.fullName?.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Admitted Patient</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{patient.fullName}</h2>
              <p className="mt-1 text-sm text-slate-500">Bed {patient.bedId} • {new Date(patient.admittedAt).toLocaleString()}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <Calendar size={20} className="text-sky-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Date of Birth</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <Clock size={20} className="text-fuchsia-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admitted At</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(patient.admittedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <Bed size={20} className="text-emerald-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bed ID</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{patient.bedId}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <HeartPulse size={20} className="text-red-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">NEWS Score</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{patient.newsScore}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <ShieldCheck size={20} className="text-amber-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{patient.status}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <ClipboardList size={20} className="text-cyan-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Age</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{patient.age} years</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Patient Notes</div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(patient.status)}`}>
                {patient.status}
              </span>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-700">
              {patient.background ? (
                <div>
                  <p className="font-semibold text-slate-900">Background</p>
                  <p className="mt-2 leading-6 text-slate-600">{patient.background}</p>
                </div>
              ) : null}

              {patient.previousMedications ? (
                <div>
                  <p className="font-semibold text-slate-900">Previous Medications</p>
                  <p className="mt-2 leading-6 text-slate-600">{patient.previousMedications}</p>
                </div>
              ) : null}

              {patient.currentTreatment ? (
                <div>
                  <p className="font-semibold text-slate-900">Current Treatment</p>
                  <p className="mt-2 leading-6 text-slate-600">{patient.currentTreatment}</p>
                </div>
              ) : null}

              {!patient.background && !patient.previousMedications && !patient.currentTreatment ? (
                <p className="leading-6 text-slate-500">No additional notes available for this patient.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
