import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchContext } from '../../components/Doctor/layout';
import { X, Users, HeartPulse, ArrowUpRight, Droplet, Thermometer, Wind, AlertCircle, ChevronDown, Check, ClipboardList, Calendar, User } from 'lucide-react';
import { getPatients, getTasksByRole, getAlertsByRole, markAlertRead } from '../../api/apiHandler';
import { useAuth } from '../../auth/AuthProvider';

// ─── ANIMATIONS ──────────────────────────────────────────────────

const animationStyles = `
  @keyframes slideInRight { 
    from { transform: translateX(20px); opacity: 0; } 
    to { transform: translateX(0); opacity: 1; } 
  }
  @keyframes fadeUp { 
    from { opacity: 0; transform: translateY(10px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  .animate-slide-in { animation: slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .animate-fade-up { animation: fadeUp 0.5s ease both; }
`;

// ─── STAT CARD - REFINED ────────────────────────────────────────

const StatCard = ({ label, value, sub, color, Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-xl p-4 md:p-5 text-left transition-all duration-300 border-2 ${
      active ? 'bg-white shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
    }`}
    style={{ borderColor: active ? color : undefined }}
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        {Icon && <Icon size={28} color={color} strokeWidth={2.5} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-3xl md:text-4xl font-black tracking-tight" style={{ color }}>
          {value}
        </div>
        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{label}</div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-50">
      <div className="text-[10px] md:text-xs text-slate-500 font-medium">{sub}</div>
    </div>
  </button>
);

// ─── VITAL BOX - COMPACT ────────────────────────────────────────

const VitalBox = ({ label, value, isCritical, Icon }) => (
  <div className="rounded-lg bg-slate-50 px-2.5 py-2 text-left transition-colors duration-200 hover:bg-slate-100 border border-slate-100">
    <div className="flex items-center gap-1.5 mb-0.5">
      <Icon size={14} className={isCritical ? 'text-red-500' : 'text-slate-400'} />
      <span className="font-bold uppercase text-slate-400 text-[8px] tracking-widest">{label}</span>
    </div>
    <div className={`text-sm font-black ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
  </div>
);

const getLatestVitalRecord = (vitalSigns = []) => {
  const normalized = (vitalSigns || [])
    .filter(Boolean)
    .map((entry) => ({
      ...entry,
      timestamp: entry.RecordedAt || entry.recordedAt || '',
    }))
    .filter((entry) => entry.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return normalized.length > 0 ? normalized[normalized.length - 1] : (vitalSigns?.[0] || {});
};

// ─── PATIENT CARD ────────────────────────────────────────

const PatientCard = ({ p, navigate, index }) => {
  const record = getLatestVitalRecord(p.vitalSigns);
  const vitals = {
    heartRate: record.HeartRate || record.heartRate,
    systolicPressure: record.SystolicPressure || record.systolicPressure,
    diastolicPressure: record.DiastolicPressure || record.diastolicPressure,
    oxygenLevel: record.OxygenLevel || record.oxygenLevel,
    temperature: record.Temperature || record.temperature,
    respirationRate: record.RespirationRate || record.respirationRate,
  };
  const isCritical = p.status === 'Critical';
  const newsColor = p.newsScore >= 7 ? 'red' : p.newsScore >= 4 ? 'amber' : 'emerald';
  const newsStyles = {
    red: 'bg-red-50 text-red-700 border border-red-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  };

  return (
    <div 
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base md:text-lg font-black text-slate-900 tracking-tight">{p.fullName}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 font-bold">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">BED {String(p.bedId).padStart(3, '0')}</span>
              <span className="text-slate-300">/</span>
              <span>ID: P{String(p.id).padStart(3, '0')}</span>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter ${newsStyles[newsColor]}`}>
            NEWS {p.newsScore}
          </span>
        </div>

        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4">
          <VitalBox label="HR" value={vitals.heartRate} isCritical={vitals.heartRate > 100} Icon={HeartPulse} />
          <VitalBox label="BP" value={`${vitals.systolicPressure}/${vitals.diastolicPressure}`} Icon={ArrowUpRight} />
          <VitalBox label="O2" value={`${vitals.oxygenLevel}%`} isCritical={vitals.oxygenLevel < 92} Icon={Droplet} />
          <VitalBox label="Temp" value={vitals.temperature} Icon={Thermometer} />
          <VitalBox label="RR" value={vitals.respirationRate} isCritical={vitals.respirationRate > 20} Icon={Wind} />
        </div>

        {p.inConsult ? (
          <div className="mb-4 rounded-lg border-2 border-dashed border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            🔒 In Consult
          </div>
        ) : p.alertMessage ? (
          <div className={`mb-4 rounded-lg px-3 py-2 text-xs font-black ${isCritical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
            ⚠️ {p.alertMessage}
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/patients/${p.id}`)}
            className="flex-1 rounded-lg border-2 border-slate-100 bg-white px-3 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
          >
            Review
          </button>
          <button
            onClick={() => navigate(`/patients/${p.id}`)}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
          >
            Medication
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ALERT ITEM ────────────────────────────────────────────────

const AlertItem = ({ alert, isOpen, onToggle, onMarkRead, onNavigate }) => {
  const getSeverityColor = (severity) => {
    const colors = { Critical: '#ef4444', Warning: '#f59e0b', Info: '#3b82f6' };
    return colors[severity] || colors.Info;
  };

  const iconColor = getSeverityColor(alert.severity);
  const formattedDate = new Date(alert.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 transition-colors duration-200"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <AlertCircle size={20} color={iconColor} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <h4 className="font-black text-slate-900 text-sm truncate">{alert.patientName}</h4>
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter" style={{ background: `${iconColor}15`, color: iconColor }}>
                {alert.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{alert.message}</p>
          </div>
        </div>
        <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-300 text-slate-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">{alert.message}</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Patient ID</span>
              <p className="text-slate-900 font-bold mt-0.5">P{String(alert.patientId).padStart(3, '0')}</p>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Timestamp</span>
              <p className="text-slate-900 font-bold mt-0.5">{formattedDate}</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onNavigate(alert.patientId)}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700 transition-all duration-200 uppercase tracking-widest"
            >
              View Patient
            </button>
            <button
              onClick={() => onMarkRead(alert.id)}
              className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-300 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Check size={14} />
              Mark Read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TASK ITEM ─────────────────────────────────────────────────

const TaskItem = ({ task, isOpen, onToggle, onNavigate }) => {
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 transition-colors duration-200"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="rounded-lg bg-indigo-50 p-2 flex-shrink-0">
            <ClipboardList size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <h4 className="font-black text-slate-900 text-sm truncate">{task.title}</h4>
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">
                {task.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{task.patientName}</p>
          </div>
        </div>
        <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-300 text-slate-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">{task.description}</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Assigned To</span>
                <p className="text-slate-900 font-bold">{task.assignedToUserName || task.assignedToRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Created</span>
                <p className="text-slate-900 font-bold">{formattedDate}</p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate(task.patientId)}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-black text-white hover:bg-indigo-700 transition-all duration-200 uppercase tracking-widest shadow-lg shadow-indigo-100"
            >
              Go to Patient Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SECTIONS ──────────────────────────────────────────────────

const AlertsSection = ({ alerts, loading, onMarkRead, onNavigate }) => {
  const [expandedAlerts, setExpandedAlerts] = useState({});
  const toggleAlert = (id) => setExpandedAlerts(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="space-y-3 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle size={22} className="text-red-500" />
          Recent Alerts
        </h3>
        <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-black">{alerts.length}</span>
      </div>
      <div className="space-y-3">
        {alerts.length > 0 ? alerts.map(a => (
          <AlertItem key={a.id} alert={a} isOpen={expandedAlerts[a.id]} onToggle={() => toggleAlert(a.id)} onMarkRead={onMarkRead} onNavigate={onNavigate} />
        )) : <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 font-bold">No active alerts</div>}
      </div>
    </div>
  );
};

const TasksSection = ({ tasks, loading, onNavigate }) => {
  const [expandedTasks, setExpandedTasks] = useState({});
  const toggleTask = (id) => setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="space-y-3 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList size={22} className="text-indigo-500" />
          Pending Tasks
        </h3>
        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-black">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.length > 0 ? tasks.map(t => (
          <TaskItem key={t.id} task={t} isOpen={expandedTasks[t.id]} onToggle={() => toggleTask(t.id)} onNavigate={onNavigate} />
        )) : <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 font-bold">All tasks completed</div>}
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────

export default function DashboardPage() {
  const context = useContext(SearchContext);
  const searchTerm = context?.searchTerm || '';
  const navigate = useNavigate();
  const auth = useAuth();
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, tasksRes] = await Promise.all([
          getPatients(),
          getTasksByRole(auth.user?.role || 'doctor'),
        ]);
        setPatients(patientsRes.data || []);
        setTasks((tasksRes.data || []).slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);
        const response = await getAlertsByRole(auth.user?.role || 'doctor');
        const sorted = (response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAlerts(sorted.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchData();
    fetchAlerts();
  }, [auth.user?.role]);

  const handleMarkAlertRead = async (id) => {
    try {
      await markAlertRead(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const filteredAndSortedPatients = [...patients]
    .filter((p) => searchTerm === '' || (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const priority = { Critical: 0, Unstable: 1, Stable: 2 };
      if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
      return (b.newsScore || 0) - (a.newsScore || 0);
    });

  const displayedPatients = filteredAndSortedPatients.filter((p) => selectedStatus === 'All' || p.status === selectedStatus);
  const topPatients = displayedPatients.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 py-6">
      <style>{animationStyles}</style>
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Stats Grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 mb-8">
          <StatCard label="Critical" value={patients.filter(p => p.status === 'Critical').length} sub="Immediate attention" color="#ef4444" Icon={HeartPulse} active={selectedStatus === 'Critical'} onClick={() => setSelectedStatus('Critical')} />
          <StatCard label="Unstable" value={patients.filter(p => p.status === 'Unstable').length} sub="Review required" color="#f59e0b" Icon={ArrowUpRight} active={selectedStatus === 'Unstable'} onClick={() => setSelectedStatus('Unstable')} />
          <StatCard label="Stable" value={patients.filter(p => p.status === 'Stable').length} sub="Under observation" color="#10b981" Icon={Droplet} active={selectedStatus === 'Stable'} onClick={() => setSelectedStatus('Stable')} />
          <StatCard label="All" value={patients.length} sub="Total patients" color="#4f46e5" Icon={Users} active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
        </div>

        {/* Patients Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {selectedStatus === 'All' ? 'Patient Census' : `${selectedStatus} Patients`}
            </h2>
            <button onClick={() => setShowAllPatients(!showAllPatients)} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
              {showAllPatients ? 'Show Top 6' : 'View All'}
            </button>
          </div>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {(showAllPatients ? displayedPatients : topPatients).map((p, i) => (
              <PatientCard key={p.id} p={p} index={i} navigate={navigate} />
            ))}
          </div>
        </div>

        {/* Bottom Widgets */}
        {!showAllPatients && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <AlertsSection alerts={alerts} loading={alertsLoading} onMarkRead={handleMarkAlertRead} onNavigate={id => navigate(`/patients/${id}`)} />
            </div>
            <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <TasksSection tasks={tasks} loading={loading} onNavigate={id => navigate(`/patients/${id}`)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
