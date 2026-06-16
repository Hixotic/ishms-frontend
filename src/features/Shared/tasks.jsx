import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Check,
  ArrowUpRight,
  ChevronDown,
  RefreshCw,
  Search,
  User,
  Calendar,
  Hash,
  Stethoscope,
} from "lucide-react";
import { getTasksByRole, completeTask } from "../APIS/apiHandler";
import { useAuth } from "../Auth/AuthProvider";

// ─── ANIMATIONS ──────────────────────────────────────────────────

const animationStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-fade-up   { animation: fadeUp   0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .animate-slide-down { animation: slideDown 0.25s ease both; }
  .animate-spin       { animation: spin 0.8s linear infinite; }
`;

// ─── STAT CARD ───────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color, Icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-xl p-4 md:p-5 text-left transition-all duration-300 border-2 bg-white ${
      active ? "shadow-lg" : "border-slate-100 hover:border-slate-200 shadow-sm"
    }`}
    style={{ borderColor: active ? color : undefined }}
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        {Icon && <Icon size={26} color={color} strokeWidth={2.5} />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-3xl md:text-4xl font-black tracking-tight"
          style={{ color }}
        >
          {value}
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          {label}
        </div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-50">
      <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
    </div>
  </button>
);

// ─── TASK CARD ───────────────────────────────────────────────────

const TaskCard = ({
  task,
  index,
  isOpen,
  onToggle,
  onMarkDone,
  onNavigate,
  completing,
}) => {
  const isDone = task.status === "Completed";
  const formattedDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s`, opacity: isDone ? 0.75 : 1 }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-slate-50 transition-colors duration-200"
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDone ? "bg-emerald-50" : "bg-indigo-50"
          }`}
        >
          {isDone ? (
            <Check size={18} className="text-emerald-600" strokeWidth={2.5} />
          ) : (
            <ClipboardList
              size={18}
              className="text-indigo-600"
              strokeWidth={2.5}
            />
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-black tracking-tight ${
                isDone ? "line-through text-slate-400" : "text-slate-900"
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                isDone
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              {task.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {task.patientName}
          </p>
          <span className="inline-block mt-1.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
            {task.assignedToRole}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={18}
          strokeWidth={2.5}
          className={`flex-shrink-0 text-slate-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div className="border-t border-slate-100 px-4 md:px-5 py-4 bg-slate-50 animate-slide-down space-y-4">
          {/* Description */}
          <p className="text-m text-black font-medium leading-relaxed">
            {task.description}
          </p>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <Hash size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                  Patient ID
                </span>
                <p className="text-slate-900 font-black mt-0.5">
                  P{String(task.patientId).padStart(3, "0")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar
                size={13}
                className="text-slate-400 mt-0.5 flex-shrink-0"
              />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                  Created
                </span>
                <p className="text-slate-900 font-black mt-0.5">
                  {formattedDate}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                  Assigned Role
                </span>
                <p className="text-slate-900 font-black mt-0.5">
                  {task.assignedToRole}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Stethoscope
                size={13}
                className="text-slate-400 mt-0.5 flex-shrink-0"
              />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                  Task ID
                </span>
                <p className="text-slate-900 font-black mt-0.5">#{task.id}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onNavigate(task.patientId)}
              className="flex-1 rounded-lg border-2 border-slate-100 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <ArrowUpRight size={13} strokeWidth={2.5} />
              View Patient
            </button>

            {!isDone ? (
              <button
                onClick={() => onMarkDone(task.id)}
                disabled={completing}
                className={`flex-1 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  completing
                    ? "bg-indigo-300 cursor-default"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200"
                }`}
              >
                {completing ? (
                  <>
                    <RefreshCw
                      size={12}
                      className="animate-spin"
                      strokeWidth={2.5}
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={12} strokeWidth={2.5} />
                    Mark Done
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center gap-1.5 cursor-default"
              >
                <Check size={12} strokeWidth={2.5} />
                Completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SKELETON LOADER ─────────────────────────────────────────────

const SkeletonLoader = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-20 bg-slate-100 rounded-xl" />
    ))}
  </div>
);

// ─── MAIN PAGE ───────────────────────────────────────────────────

export default function TasksPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const role = auth.user?.role || "doctor";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [completingTasks, setCompletingTasks] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // ── Fetch ────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTasksByRole(role);
      const sorted = (response.data || []).sort((a, b) => {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setTasks(sorted);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Mark Done ────────────────────────────────────────────────

  const handleMarkDone = async (id) => {
    try {
      setCompletingTasks((prev) => ({ ...prev, [id]: true }));
      await completeTask(id);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Completed" } : t)),
      );
    } catch (error) {
      console.error("Failed to mark task as done:", error);
    } finally {
      setCompletingTasks((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ── Toggle expand ────────────────────────────────────────────

  const toggleTask = (id) =>
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Derived counts ───────────────────────────────────────────

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  // ── Filtered list ────────────────────────────────────────────

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      !searchTerm ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = activeFilter === "All" || t.status === activeFilter;
    const matchRole =
      !roleFilter ||
      t.assignedToRole.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchStatus && matchRole;
  });

  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 py-6">
      <style>{animationStyles}</style>
      <div className="mx-auto w-full max-w-4xl">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Task Board
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {role} · {pendingCount} pending
            </p>
          </div>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
              strokeWidth={2.5}
            />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-3 mb-8">
          <StatCard
            label="All Tasks"
            value={tasks.length}
            sub="Total assigned"
            color="#4f46e5"
            Icon={ClipboardList}
            active={activeFilter === "All"}
            onClick={() => setActiveFilter("All")}
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            sub="Awaiting action"
            color="#f59e0b"
            Icon={ArrowUpRight}
            active={activeFilter === "Pending"}
            onClick={() => setActiveFilter("Pending")}
          />
          <StatCard
            label="Completed"
            value={completedCount}
            sub="Done"
            color="#10b981"
            Icon={Check}
            active={activeFilter === "Completed"}
            onClick={() => setActiveFilter("Completed")}
          />
        </div>

        {/* Search + role filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Search tasks or patients…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-100 bg-white text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-300 transition-colors duration-200"
            />
          </div>
          {/*
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-indigo-300 cursor-pointer transition-colors duration-200"
          >
            <option value="">All Roles</option>
            <option value="Doctor">Doctor</option>
            <option value="Nurse">Nurse</option>
            <option value="Admin">Admin</option>
          </select>*/}
        </div>

        {/* Task list */}
        {loading ? (
          <SkeletonLoader />
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest text-sm">
            {activeFilter === "Completed"
              ? "✓ No completed tasks"
              : "No tasks found"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                isOpen={!!expandedTasks[task.id]}
                onToggle={() => toggleTask(task.id)}
                onMarkDone={handleMarkDone}
                onNavigate={(id) => navigate(`/patients/${id}`)}
                completing={!!completingTasks[task.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
