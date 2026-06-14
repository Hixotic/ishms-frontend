import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bed, 
  Sparkles, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  Building2,
  ShieldCheck,
  Stethoscope,
  Activity
} from 'lucide-react';
import { createPatient, getDepartments, getAvailableBedsByDepartment } from '../../api/apiHandler';
import { SearchContext } from '../All/Layout';

const AdmissionWizard = ({ onComplete }) => {
  const navigate = useNavigate();
  const { refreshPatients } = useContext(SearchContext) || {};
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dateOfBirth: '',
    departmentId: '',
    bedId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const deptResponse = await getDepartments();
        setDepartments(deptResponse.data || []);
      } catch (error) {
        console.error('Failed to load departments:', error);
      }
    };
    loadData();
  }, []);

  const fetchBedsForDepartment = async (departmentId) => {
    if (!departmentId) {
      setAvailableBeds([]);
      return;
    }
    try {
      const bedsResponse = await getAvailableBedsByDepartment(departmentId);
      setAvailableBeds(bedsResponse.data || []);
    } catch (error) {
      console.error('Failed to load beds for department:', error);
      setAvailableBeds([]);
    }
  };

  const updateFormData = (field, value) => {
    if (field === 'departmentId') {
      const deptId = value ? parseInt(value, 10) : null;
      setFormData(prev => ({ ...prev, departmentId: value, bedId: '' }));
      fetchBedsForDepartment(deptId);
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const patientData = {
        fullName: formData.fullName,
        age: parseInt(formData.age),
        dateOfBirth: formData.dateOfBirth,
        departmentId: parseInt(formData.departmentId),
        bedId: parseInt(formData.bedId),
      };

      await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition
      const response = await createPatient(patientData);
      await refreshPatients?.();
      onComplete?.(response.data);
      setCompleted(true);
    } catch (error) {
      console.error('Patient creation failed:', error);
      alert('Failed to complete admission. Please verify details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Identity', icon: User },
    { id: 2, title: 'Placement', icon: Bed },
    { id: 3, title: 'Review', icon: ShieldCheck },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between max-w-2xl mx-auto mb-12 relative px-4">
      {steps.map((s, index) => {
        const Icon = s.icon;
        const isCompleted = step > s.id;
        const isActive = step === s.id;

        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500 text-white shadow-lg' :
                isActive ? 'bg-blue-600 text-white shadow-xl scale-110' :
                'bg-white text-slate-300 border border-slate-100'
              }`}>
                {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
              </div>
              <div className={`text-xs font-black uppercase tracking-widest mt-3 whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {s.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px mx-3 bg-slate-100 relative">
                <div className={`absolute inset-0 bg-blue-600 transition-transform duration-700 origin-left ${
                  isCompleted ? 'scale-x-100' : 'scale-x-0'
                }`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-6">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 block ml-1">Full Legal Name</label>
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 font-bold transition-all outline-none text-sm"
              value={formData.fullName}
              onChange={(e) => updateFormData('fullName', e.target.value)}
              placeholder="Patient Name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 block ml-1">Date of Birth</label>
            <div className="relative">
              <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="date"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 font-bold transition-all outline-none text-sm"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 block ml-1">Age</label>
            <div className="relative">
              <Activity size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-500 font-bold cursor-not-allowed outline-none text-sm"
                value={formData.age ? `${formData.age} yrs` : '--'}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 block ml-1">Department</label>
          <div className="relative">
            <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <select
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 font-bold transition-all outline-none appearance-none text-sm"
              value={formData.departmentId}
              onChange={(e) => updateFormData('departmentId', e.target.value)}
            >
              <option value="">Select Ward</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 block ml-1">Assigned Bed</label>
          <div className="relative">
            <Bed size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <select
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 font-bold transition-all outline-none appearance-none disabled:bg-slate-100 text-sm"
              value={formData.bedId}
              onChange={(e) => updateFormData('bedId', e.target.value)}
              disabled={!formData.departmentId || availableBeds.length === 0}
            >
              <option value="">{formData.departmentId ? 'Select Bed' : 'Choose Ward First'}</option>
              {availableBeds.map(bed => (
                <option key={bed.bedId || bed.id} value={bed.bedId || bed.id}>
                  Bed {String(bed.bedId || bed.id).padStart(3, '0')} ({bed.roomNumber || 'Ward'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
            <Stethoscope size={24} />
          </div>
          <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Review Admission</h4>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-start py-3 border-b border-blue-100/50 gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Patient</span>
            <span className="text-sm font-bold text-slate-900 text-right break-words">{formData.fullName}</span>
          </div>
          <div className="flex justify-between items-start py-3 border-b border-blue-100/50 gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Age / DOB</span>
            <span className="text-sm font-bold text-slate-900 text-right">{formData.age}y ({new Date(formData.dateOfBirth).toLocaleDateString()})</span>
          </div>
          <div className="flex justify-between items-start py-3 border-b border-blue-100/50 gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ward</span>
            <span className="text-sm font-bold text-slate-900 text-right break-words">{departments.find(d => String(d.id) === String(formData.departmentId))?.name}</span>
          </div>
          <div className="flex justify-between items-start py-3 gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Bed</span>
            <span className="text-sm font-bold text-slate-900 text-right">#{String(formData.bedId).padStart(3, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-100 mb-8">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-3">Success</h2>
      <p className="text-slate-500 text-sm font-bold text-center max-w-xs mb-10 uppercase tracking-widest">Patient has been admitted successfully.</p>
      <button
        onClick={() => navigate('/')}
        className="px-10 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-100"
      >
        Done
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    if (completed) return renderCompleted();
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.fullName && formData.dateOfBirth && formData.age;
    if (step === 2) return formData.departmentId && formData.bedId;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] border border-blue-100 mb-4">
          <Sparkles size={12} /> Admission Wizard
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Patient Record</h1>
      </div>

      {!completed && renderStepIndicator()}

      <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
        {renderCurrentStep()}

        {!completed && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-50">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => canProceed() && setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-30"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Confirm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionWizard;
