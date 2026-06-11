import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, HeartPulse, ArrowUpRight, Droplet, Thermometer, Wind, AlertCircle, ChevronDown, Check, ClipboardList, UserPlus } from 'lucide-react';
import { getTasksByRole, getMedicalReportsByDoctor, markAlertRead, completeTask } from '../../api/apiHandler';
import { useAuth } from '../../auth/AuthProvider';
import { useData } from '../../components/All/IContext';

// ─── INTERNAL COMPONENTS ────────────────────────────────────────
const formatVitalNumber = (val) => {
  if (val === undefined || val === null) return '--';
  const num = parseFloat(val);
  return isNaN(num) ? val : Math.round(num * 10) / 10;
};

const AlertItem = ({ alert, isOpen, onToggle, onMarkRead, onNavigate }) => {
  const getSeverityColor = (severity) => {
    const colors = { Critical: '#ef4444', Warning: '#f59e0b', Info: '#3b82f6' };
    return colors[severity] || colors.Info;
  };
  const iconColor = getSeverityColor(alert.severity);
  const formattedDate = new Date(alert.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-slate-50 transition-colors duration-200">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <AlertCircle size={18} color={iconColor} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate uppercase tracking-wider">{alert.patientName}</h4>
              <span className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap" style={{ background: `${iconColor}15`, color: iconColor }}>
                {alert.severity}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 line-clamp-1">{alert.message}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-slate-200 px-3 py-3 sm:px-4 sm:py-4 bg-slate-50 space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 leading-relaxed">{alert.message}</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            <div><span className="text-slate-400">ID:</span><p className="text-slate-900 mt-0.5">P{String(alert.patientId).padStart(3, '0')}</p></div>
            <div><span className="text-slate-400">Time:</span><p className="text-slate-900 mt-0.5">{formattedDate}</p></div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onNavigate(alert.patientId)} className="flex-1 rounded-xl sm:rounded-2xl bg-blue-700 px-2 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-800 transition-all duration-200">View</button>
            <button onClick={() => onMarkRead(alert.id)} className="flex-1 rounded-xl sm:rounded-2xl bg-slate-200 px-2 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-300 transition-all duration-200 flex items-center justify-center gap-1"><Check size={12} />Read</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskItem = ({ task, isOpen, onToggle, onComplete }) => {
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-slate-50 transition-colors duration-200">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <ClipboardList size={18} className="flex-shrink-0 mt-0.5 text-blue-700" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate uppercase tracking-wider">{task.patientName}</h4>
              <span className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap bg-blue-50 text-blue-700">
                {task.status}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 line-clamp-1">{task.title}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-slate-200 px-3 py-3 sm:px-4 sm:py-4 bg-slate-50 space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 leading-relaxed">{task.description}</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            <div><span className="text-slate-400">ID:</span><p className="text-slate-900 mt-0.5">P{String(task.patientId).padStart(3, '0')}</p></div>
            <div><span className="text-slate-400">Time:</span><p className="text-slate-900 mt-0.5">{formattedDate}</p></div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onComplete(task.id)} className="flex-1 rounded-xl sm:rounded-2xl bg-green-700 px-2 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-800 transition-all duration-200 flex items-center justify-center gap-1">
              <Check size={12} />Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AlertsSection = ({ onNavigate }) => {
  const { alerts, alertsLoading, refreshData } = useData();
  const [expandedAlerts, setExpandedAlerts] = useState({});

  const handleMarkRead = async (alertId) => {
    try {
      await markAlertRead(alertId);
      await refreshData();
    } catch (error) { console.error('Failed to mark alert as read:', error); }
  };

  const toggleAlert = (alertId) => { setExpandedAlerts((prev) => ({ ...prev, [alertId]: !prev[alertId] })); };

  if (alertsLoading) return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"><h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 uppercase tracking-widest">Recent Alerts</h3><div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 sm:h-20 bg-slate-100 rounded-[1.25rem] animate-pulse" />)}</div></div>;
  if (alerts.length === 0) return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"><h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 uppercase tracking-widest">Recent Alerts</h3><div className="text-center py-6 sm:py-10"><AlertCircle size={28} className="mx-auto text-slate-200 mb-2 sm:mb-3" /><p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">No alerts</p></div></div>;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-widest">Recent Alerts</h3>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-slate-600 tracking-tighter">{alerts.length}</span>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <AlertItem key={alert.id} alert={alert} isOpen={expandedAlerts[alert.id] || false} onToggle={() => toggleAlert(alert.id)} onMarkRead={handleMarkRead} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};

const TasksSection = () => {
  const auth = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasksByRole(auth.user?.role || 'doctor');
      const sortedTasks = (response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTasks(sortedTasks.slice(0, 5));
    } catch (error) { console.error('Failed to fetch tasks:', error); setTasks([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [auth.user?.role]);

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) { console.error('Failed to complete task:', error); }
  };

  const toggleTask = (taskId) => { setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] })); };

  if (loading) return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"><h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 uppercase tracking-widest">Pending Tasks</h3><div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 sm:h-20 bg-slate-100 rounded-[1.25rem] animate-pulse" />)}</div></div>;
  if (tasks.length === 0) return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"><h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 uppercase tracking-widest">Pending Tasks</h3><div className="text-center py-6 sm:py-10"><ClipboardList size={28} className="mx-auto text-slate-200 mb-2 sm:mb-3" /><p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">No tasks</p></div></div>;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-widest">Pending Tasks</h3>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-slate-600 tracking-tighter">{tasks.length}</span>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} isOpen={expandedTasks[task.id] || false} onToggle={() => toggleTask(task.id)} onComplete={handleCompleteTask} />
        ))}
      </div>
    </div>
  );
};

// ─── USER DESIGN COMPONENTS ───────────────────────────────────────────

const StatCard = ({ label, value, sub, color, Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-[1.5rem] sm:rounded-[1.75rem] p-3 sm:p-4 text-left shadow-sm transition-all duration-200 border outline-none focus:outline-none ${active ? 'bg-white shadow-lg' : 'bg-white ring-1 ring-slate-200 hover:ring-slate-300'}`}
    style={{ 
      borderColor: active ? color : '#e2e8f0',
      boxShadow: active ? `0 0 0 1.5px ${color}` : undefined 
    }}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center" style={{ background: `${color}20` }}>
        {Icon && <Icon size={20} className="sm:w-6 sm:h-6" color={color} />}
      </div>
      <div className="text-2xl sm:text-3xl font-black leading-none" style={{ color }}>{value}</div>
      <div className="hidden sm:flex rounded-2xl px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ml-auto" style={{ background: `${color}15`, color }}>{label}</div>
    </div>
    <div className="mt-2 sm:mt-3">
      <div className="sm:hidden text-[9px] font-black uppercase tracking-widest mb-1" style={{ color }}>{label}</div>
      <div className="text-[10px] sm:text-xs font-medium text-slate-500 leading-tight">{sub}</div>
    </div>
  </button>
);

const VitalBox = ({ label, value, isCritical, Icon }) => (
  <div className="rounded-xl sm:rounded-2xl bg-slate-100 p-2 sm:p-3 text-left">
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Icon size={14} className={`sm:w-[18px] sm:h-[18px] ${isCritical ? 'text-red-500' : 'text-slate-500'}`} />
      <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
    </div>
    <div className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
  </div>
);

const PatientCard = ({ p, onNavigate }) => {
  // Normalize patient state status variables
  const currentFlow = p.flowStatus || p.flowState || 'New';

  // State configurations for labels and color schemes
  const flowStyles = {
    New: 'bg-slate-100 text-slate-600 border border-slate-200',
    ObservationalStable: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    UnderObservation: 'bg-blue-50 text-blue-700 border border-blue-100',
    WaitingDoctor: 'bg-red-50 text-red-700 border border-red-100'
  };

  const flowLabels = {
    New: 'New Admission',
    ObservationalStable: 'Obs. Stable',
    UnderObservation: 'Under Obs.',
    WaitingDoctor: 'Awaiting MD'
  };

  if (currentFlow === 'New') {
    return (
      <div className="overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm border-dashed opacity-85">
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-base sm:text-lg font-black text-slate-900">{p.fullName}</h3>
            <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Bed {String(p.bedId || 0).padStart(3, '0')}</span><span>•</span><span>P{String(p.id).padStart(3, '0')}</span>
            </div>
          </div>
          <span className={`w-fit inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.18em] ${flowStyles.New}`}>
            {flowLabels.New}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50/50 p-6 rounded-[1rem] sm:rounded-[1.25rem] my-4 border border-dashed border-slate-200 text-center">
          <UserPlus size={20} className="text-slate-300 mb-1" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awaiting Initial Triage</span>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Clinical vital grid will populate upon intake routing.</p>
        </div>
      </div>
    );
  }

  // Parse active vitals logic logs
  let record = {};
  if (p.latestVitalSign) {
    if (Array.isArray(p.latestVitalSign)) {
      record = p.latestVitalSign
        .filter(Boolean)
        .map((entry) => ({ ...entry, timestamp: entry.RecordedAt || entry.recordedAt || '' }))
        .filter((entry) => entry.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .pop() || p.latestVitalSign[0] || {};
    } else if (typeof p.latestVitalSign === 'object') {
      record = p.latestVitalSign;
    }
  }

  const vitals = { 
    heartRate: record.HeartRate ?? record.heartRate ?? 'N/A', 
    systolicPressure: record.SystolicPressure ?? record.systolicPressure ?? 'N/A', 
    diastolicPressure: record.DiastolicPressure ?? record.diastolicPressure ?? 'N/A', 
    oxygenLevel: record.OxygenLevel ?? record.oxygenLevel ?? 'N/A', 
    temperature: record.Temperature ?? record.temperature ?? 'N/A',
    respirationRate: record.RespirationRate ?? record.respirationRate ?? 'N/A' 
  };

  const newsColor = p.newsScore >= 7 ? 'red' : p.newsScore >= 4 ? 'amber' : 'emerald';
  const newsStyles = { 
    red: 'bg-red-50 text-red-700 border border-red-100', 
    amber: 'bg-amber-50 text-amber-700 border border-amber-100', 
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
  };

  return (
    <div onClick={() => onNavigate(p.id)} className="group cursor-pointer overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base sm:text-lg font-black text-slate-900">{p.fullName}</h3>
          <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>Bed {String(p.bedId).padStart(3, '0')}</span><span>•</span><span>P{String(p.id).padStart(3, '0')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${flowStyles[currentFlow] || flowStyles.UnderObservation}`}>
            {flowLabels[currentFlow] || currentFlow}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${newsStyles[newsColor]}`}>
            NEWS {p.newsScore}
          </span>
        </div>
      </div>
      <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 bg-slate-50 p-3 sm:p-4 rounded-[1rem] sm:rounded-[1.25rem] mb-4 sm:mb-5">
        <VitalBox label="HR" value={vitals.heartRate} isCritical={vitals.heartRate > 100 || vitals.heartRate < 50} Icon={HeartPulse} />
        <VitalBox label="BP" value={vitals.systolicPressure !== 'N/A' ? `${vitals.systolicPressure}/${vitals.diastolicPressure}` : 'N/A'} Icon={ArrowUpRight} />
        <VitalBox label="O2" value={vitals.oxygenLevel !== 'N/A' ? `${vitals.oxygenLevel}%` : 'N/A'} isCritical={vitals.oxygenLevel < 92} Icon={Droplet} />
        <VitalBox label="Temp" value={vitals.temperature !== 'N/A' ? `${vitals.temperature}°C` : 'N/A'} Icon={Thermometer} />
        <VitalBox label="RR" value={vitals.respirationRate} isCritical={vitals.respirationRate > 20 || vitals.respirationRate < 12} Icon={Wind} />
      </div>
      <div className="flex gap-2">
        <button className="flex-1 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-100 px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-200">Review</button>
        <button className="flex-1 rounded-xl sm:rounded-2xl bg-blue-700 px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-800">Medications</button>
      </div>
    </div>
  );
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Get all hospital data from context (patients, alerts, search, etc.)
  const {
    searchTerm,
    patients,
    patientsLoading,
    isDoctor
  } = useData();

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setReportsLoading(true);
        const reportsRes = auth.user?.userId ? await getMedicalReportsByDoctor(auth.user.userId) : { data: [] };
        setReports(reportsRes.data || []);
      } catch (error) { 
        console.error('Failed to fetch dashboard reports:', error); 
        setReports([]); 
      } finally { 
        setReportsLoading(false); 
      }
    };
    fetchReports();
  }, [auth.user?.userId]);

  const handleViewPatient = (patientId) => { navigate(`/patients/${patientId}`); };

  // Filtering logic using data from context
  const filteredPatients = patients.filter((p) => 
    searchTerm === '' || (p.fullName || p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const priority = { Critical: 0, Unstable: 1, Stable: 2 };
    if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
    return (b.newsScore || 0) - (a.newsScore || 0);
  });

  const displayedPatients = filteredPatients.filter((p) => selectedStatus === 'All' || p.status === selectedStatus);
  const topPatients = displayedPatients.slice(0, 6);
  
  const stats = { 
    stable: patients.filter(p => p.status === 'Stable').length, 
    unstable: patients.filter(p => p.status === 'Unstable').length, 
    critical: patients.filter(p => p.status === 'Critical').length, 
    all: patients.length 
  };

  // Combine loading states
  const isOverallLoading = patientsLoading || reportsLoading;

  if (isOverallLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-10"><div className="text-center text-slate-500"><div className="text-lg font-black uppercase tracking-widest">Loading...</div></div></div>;

  return (
    <div className="min-h-screen bg-[#f4f7fa] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <StatCard label="Critical" value={stats.critical} sub="Immediate escalation" color="#ef4444" Icon={HeartPulse} active={selectedStatus === 'Critical'} onClick={() => setSelectedStatus('Critical')} />
          <StatCard label="Unstable" value={stats.unstable} sub="Needs review soon" color="#f59e0b" Icon={ArrowUpRight} active={selectedStatus === 'Unstable'} onClick={() => setSelectedStatus('Unstable')} />
          <StatCard label="Stable" value={stats.stable} sub="Under control" color="#10b981" Icon={Droplet} active={selectedStatus === 'Stable'} onClick={() => setSelectedStatus('Stable')} />
          <StatCard label="All" value={stats.all} sub="Ward census" color="#4338ca" Icon={Users} active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider">{selectedStatus === 'All' ? (showAllPatients ? 'All Ward' : 'Priority List') : selectedStatus}</h2>
            <button onClick={() => setShowAllPatients(!showAllPatients)} className={`inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-widest transition shadow-sm ${showAllPatients ? 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
              {showAllPatients ? <><X size={14} /> Close</> : <><Users size={14} /> View All</>}
            </button>
          </div>
          <div className="grid gap-3 sm:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {(showAllPatients ? displayedPatients : topPatients).map((p) => (<PatientCard key={p.id} p={p} onNavigate={handleViewPatient} />))}
          </div>
        </div>

        {!showAllPatients && (
          <div className="mt-8 sm:mt-12 grid gap-8 sm:gap-12 lg:grid-cols-2">
            <AlertsSection onNavigate={handleViewPatient} />
            <TasksSection />
          </div>
        )}
      </div>
    </div>
  );
}
