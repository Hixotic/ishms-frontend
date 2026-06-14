import React, { useContext, useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  User, 
  ArrowRight, 
  X, 
  AlertCircle, 
  Loader2, 
  ClipboardCheck, 
  Home, 
  Truck, 
  Hospital,
  ChevronRight
} from 'lucide-react';
import { dischargePatient } from '../../api/apiHandler';
import { formatBedId, formatPatientId, HandleDepartmentByBedId } from '../../api/Handler';
import { SearchContext } from '../All/Layout';
import { useData } from '../All/IContext';


const DischargeMonitor = () => {
  // Get all hospital data from context (patients, alerts, etc.)
  const {
    searchTerm,
    setSearchTerm,
    filteredPatients,
    patients,
    patientsLoading,
    alerts,
    alertsLoading,
    isDoctor,
    isReceptionist
  } = useData();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDischarging, setIsDischarging] = useState(false);
  const [dischargeSuccess, setDischargeSuccess] = useState(null);
  const [dischargeType, setDischargeType] = useState('Home');
  const [notes, setNotes] = useState('');

  const parseAdmissionDate = (patient) => {
    return patient.admittedAt || patient.admissionDate || patient.admittedOn || patient.dateAdmitted || null;
  };

  const getStayDays = (admissionDate) => {
    if (!admissionDate) return null;
    const admitted = new Date(admissionDate);
    if (Number.isNaN(admitted.getTime())) return null;
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((now - admitted) / msPerDay));
  };

  const dischargePatients = patients
    .filter((p) => (p.flowStatus === "Stable"))
    .map((patient) => {
      const admittedAt = parseAdmissionDate(patient);
      return {
        ...patient,
        admittedAt,
        stayDays: getStayDays(admittedAt),
      };
    })
    .sort((a, b) => {
      const left = new Date(a.admittedAt).getTime() || 0;
      const right = new Date(b.admittedAt).getTime() || 0;
      return left - right;
    });

  const handleDischarge = async () => {
    if (!selectedPatient) return;
    
    try {
      setIsDischarging(true);
      const patientId = selectedPatient.id || selectedPatient.patientId;
      
      // Simulate a small delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await dischargePatient(patientId);
      await refreshPatients?.();
      
      setDischargeSuccess(selectedPatient.fullName || selectedPatient.patientName || 'Patient');
      setSelectedPatient(null);
      setNotes('');
      setDischargeType('Home');
      
      // Clear success message after 5 seconds
      setTimeout(() => setDischargeSuccess(null), 5000);
    } catch (error) {
      console.error('Failed to discharge patient:', error);
      alert('Failed to complete discharge. Please try again.');
    } finally {
      setIsDischarging(false);
    }
  };

  if (patientsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <div className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Patient Data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <ClipboardCheck size={12} />
            Clinical Operations
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Discharge Monitor</h2>
          <p className="text-slate-500 font-medium">Manage and process patients cleared for medical discharge.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm pr-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <CheckCircle size={28} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">{dischargePatients.length}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ready to process</div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {dischargeSuccess && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-emerald-900 font-black text-sm uppercase tracking-wider">Discharge Successful</p>
                <p className="text-emerald-700 text-xs font-medium">{dischargeSuccess} has been officially discharged from the ward.</p>
              </div>
            </div>
            <button onClick={() => setDischargeSuccess(null)} className="text-emerald-400 hover:text-emerald-600 p-2">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="grid gap-4">
        {dischargePatients.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Ward is Clear</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">All medically cleared patients have been processed. Great work!</p>
          </div>
        ) : (
          dischargePatients.map((patient) => (
            <div
              key={patient.patientId || patient.id}
              className="group bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors duration-300">
                      <User size={32} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {patient.patientName || patient.fullName || patient.name || 'Unknown Patient'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatPatientId(patient.id)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Bed {formatBedId(patient.bed || patient.bedId || 'TBD')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{HandleDepartmentByBedId(patient.bedId) || 'General Ward'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-center sm:text-left">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stay Duration</div>
                    <div className="text-sm font-black text-slate-900">{patient.stayDays ?? '–'} Days</div>
                  </div>
                  
                  <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-center sm:text-left">
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Clinical Status</div>
                    <div className="text-sm font-black text-emerald-700">Cleared</div>
                  </div>

                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="col-span-2 sm:col-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-white text-xs uppercase tracking-widest hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 active:scale-95"
                  >
                    Process Discharge
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discharge Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Final Review</div>
                <h3 className="text-3xl font-black text-slate-900">Discharge Patient</h3>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Patient Info Card */}
              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                  <User size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    {selectedPatient.patientName || selectedPatient.fullName || selectedPatient.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    Bed {formatBedId(selectedPatient.bed || selectedPatient.bedId)} • {HandleDepartmentByBedId(selectedPatient.bedId)}
                  </p>
                </div>
              </div>

              {/* Discharge Options */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discharge Destination</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Home', icon: Home, label: 'Home' },
                    { id: 'Transfer', icon: Truck, label: 'Transfer' },
                    { id: 'Facility', icon: Hospital, label: 'Facility' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setDischargeType(type.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        dischargeType === type.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <type.icon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Discharge Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter final observations or follow-up instructions..."
                  className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setSelectedPatient(null)}
                  disabled={isDischarging}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDischarge}
                  disabled={isDischarging}
                  className="flex-[2] flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isDischarging ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Complete Discharge
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargeMonitor;
