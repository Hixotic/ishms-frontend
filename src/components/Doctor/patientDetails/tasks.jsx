import React from 'react';
import { X, Check, UserRound, ClipboardCheck, ArrowRight, PlusCircle, PenTool, CheckCircle2 } from 'lucide-react';

const TasksModal = ({ tasks, onClose, onComplete, onNewOrder, onWriteNotes }) => {
  const doctorTasks = tasks.filter(t => t.assignedToRole === 'Doctor');
  const nurseTasks = tasks.filter(t => t.assignedToRole === 'Nurse');
  
  const handleAction = (task) => {
    if (task.title.toLowerCase().includes('new order')) onNewOrder(task);
    else if (task.title.toLowerCase().includes('write clinical notes')) onWriteNotes(task);
    else onComplete(task.id);
  };

  const getActionConfig = (title) => {
    const t = title.toLowerCase();
    if (t.includes('new order')) return { label: 'Order', icon: <PlusCircle size={14} />, color: 'bg-blue-600 hover:bg-blue-700' };
    if (t.includes('notes')) return { label: 'Write', icon: <PenTool size={14} />, color: 'bg-purple-600 hover:bg-purple-700' };
    return { label: 'Done', icon: <CheckCircle2 size={14} />, color: 'bg-green-600 hover:bg-green-700' };
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[2000] p-4">
      {/* TOTAL BORDER PURGE: No 'border' classes on the main container */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header - Flush with no border-bottom */}
        <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <ClipboardCheck size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Clinical Tasks</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                  Pending actions dashboard
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area - No borders on section dividers */}
        <div className="p-8 overflow-y-auto space-y-10 flex-1 hide-scrollbar bg-slate-50/30">
          
          {/* Doctor Tasks Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <UserRound size={16} />
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Doctor Directives
              </h3>
              <div className="h-px flex-1 bg-slate-200/50"></div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded-md">
                {doctorTasks.length} PENDING
              </span>
            </div>

            <div className="space-y-3">
              {doctorTasks.length > 0 ? doctorTasks.map(t => {
                const config = getActionConfig(t.title);
                return (
                  <div key={t.id} className="group p-5 rounded-3xl bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex justify-between items-center gap-6">
                    <div className="flex-1">
                      <div className="font-black text-slate-900 text-sm tracking-tight">{t.title}</div>
                      <div className="text-xs text-red-500/80 font-bold mt-1 leading-relaxed">
                        {t.description}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAction(t)} 
                      className={`px-6 py-3 ${config.color} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2`}
                    >
                      {config.icon}
                      {config.label}
                    </button>
                  </div>
                );
              }) : (
                <div className="py-10 text-center rounded-3xl bg-white/50">
                  <CheckCircle2 size={32} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No pending tasks</p>
                </div>
              )}
            </div>
          </section>

          {/* Nurse Tasks Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <ClipboardCheck size={16} />
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Nursing Monitoring
              </h3>
              <div className="h-px flex-1 bg-slate-200/50"></div>
            </div>

            <div className="space-y-3">
              {nurseTasks.length > 0 ? nurseTasks.map(t => (
                <div key={t.id} className="p-5 rounded-3xl bg-slate-100/50 flex justify-between items-center group">
                  <div className="flex-1">
                    <div className="font-bold text-slate-600 text-sm">{t.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Status: {t.status}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300" />
                </div>
              )) : (
                <div className="py-10 text-center rounded-3xl bg-white/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No nurse tasks</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions - Flush with no border-top */}
        <div className="p-8 bg-white">
          <button 
            onClick={onClose} 
            className="w-full py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-[0.98]"
          >
            Close Dashboard
          </button>
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// CRITICAL: Export default to fix the SyntaxError
export default TasksModal;
