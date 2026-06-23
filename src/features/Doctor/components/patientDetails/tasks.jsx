import React, { useState } from "react";
import {
  X,
  Check,
  UserRound,
  ClipboardCheck,
  ArrowRight,
  PlusCircle,
  PenTool,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ---------------- Error Modal ---------------- */
const ErrorModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
const TasksModal = ({
  tasks,
  onClose,
  onComplete,
  onNewOrder,
  onWriteNotes,
}) => {
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const doctorTasks = tasks.filter((t) => t.assignedToRole === "Doctor");
  const nurseTasks = tasks.filter((t) => t.assignedToRole === "Nurse");

  const handleAction = async (task) => {
    try {
      if (task.title.toLowerCase().includes("new order")) {
        onNewOrder(task);
      } else if (task.title.toLowerCase().includes("write clinical notes")) {
        onWriteNotes(task);
      } else {
        await onComplete(task.id);
      }
    } catch (e) {
      setErrorModal({
        open: true,
        title: "Unable to Complete Task",
        message:
          "This task is not yet ready for completion. Please try again after completing the required steps.",
      });
    }
  };

  const getActionConfig = (title) => {
    const t = title.toLowerCase();
    if (t.includes("new order"))
      return {
        label: "Order",
        icon: <PlusCircle size={14} />,
        color: "bg-blue-600 hover:bg-blue-700",
      };
    if (t.includes("notes"))
      return {
        label: "Write",
        icon: <PenTool size={14} />,
        color: "bg-purple-600 hover:bg-purple-700",
      };
    return {
      label: "Done",
      icon: <CheckCircle2 size={14} />,
      color: "bg-green-600 hover:bg-green-700",
    };
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      
      {/* Modal */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <ClipboardCheck size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">
                  Clinical Tasks
                </h2>
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

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-10 flex-1 hide-scrollbar bg-slate-50/30">

          {/* Doctor Tasks */}
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
              {doctorTasks.length > 0 ? (
                doctorTasks.map((t) => {
                  const config = getActionConfig(t.title);

                  return (
                    <div
                      key={t.id}
                      className="p-5 rounded-3xl bg-white flex justify-between items-center"
                    >
                      <div>
                        <div className="font-black text-slate-900 text-sm">
                          {t.title}
                        </div>
                        <div className="text-xs text-red-500/80 font-bold mt-1">
                          {t.description}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAction(t)}
                        className={`px-6 py-3 ${config.color} text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2`}
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center bg-white/50 rounded-3xl">
                  <CheckCircle2 className="mx-auto text-slate-200 mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    No pending tasks
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Nurse Tasks */}
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
              {nurseTasks.length > 0 ? (
                nurseTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-3xl bg-slate-100/50 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-600 text-sm">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Status: {t.status}
                      </div>
                    </div>

                    <ArrowRight size={16} className="text-slate-300" />
                  </div>
                ))
              ) : (
                <div className="py-10 text-center bg-white/50 rounded-3xl">
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    No nurse tasks
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white">
          <button
            onClick={onClose}
            className="w-full py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase"
          >
            Close Dashboard
          </button>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() =>
          setErrorModal({
            open: false,
            title: "",
            message: "",
          })
        }
      />
    </div>
  );
};

export default TasksModal;
