import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BedDouble, CheckCircle2, Users, Activity, ChevronDown, ChevronUp,
  Search, AlertTriangle, Clock, User, Stethoscope, LayoutGrid, List,
  X, ArrowRightLeft, Loader2,
} from "lucide-react";
import { getAvailableBeds, getOccupiedBeds, getDepartments, assignBed } from '../../api/apiHandler';
import { TransferModal } from "../../components/All/Assign";

const BEDS_PER_ROOM = 5;
const TOTAL_BEDS = 200;

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

function useBedData() {
  const [departments, setDepartments]   = useState([]);
  const [occupiedMap, setOccupiedMap]   = useState({});
  const [availableSet, setAvailableSet] = useState(new Set());
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsResponse, availableResponse, occupiedResponse] = await Promise.all([
        getDepartments(),
        getAvailableBeds(),
        getOccupiedBeds(),
      ]);

      let depts = deptsResponse;
      let available = availableResponse;
      let occupied = occupiedResponse;

      if (depts && typeof depts === "object" && !Array.isArray(depts)) {
        depts = depts.data || depts.departments || [];
      }
      if (!Array.isArray(depts) || depts.length === 0) {
        throw new Error("No departments available");
      }

      if (available && typeof available === "object" && !Array.isArray(available)) {
        available = available.data || available.beds || [];
      }
      if (!Array.isArray(available)) {
        available = [];
      }

      if (occupied && typeof occupied === "object" && !Array.isArray(occupied)) {
        occupied = occupied.data || occupied.patients || [];
      }
      if (!Array.isArray(occupied)) {
        occupied = [];
      }

      const bedsPerDept = Math.floor(TOTAL_BEDS / depts.length);
      const enriched = depts.map((d, i) => ({
        ...d,
        total:   bedsPerDept,
        startId: i * bedsPerDept + 1,
      }));
      setDepartments(enriched);

      setAvailableSet(new Set(available.map((b) => b.bedId).filter(Boolean)));

      const oMap = {};
      occupied.forEach((p) => { if (p.bedId) oMap[p.bedId] = p; });
      setOccupiedMap(oMap);
    } catch (err) {
      setError(err?.message || "Failed to load bed data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { departments, occupiedMap, availableSet, loading, error, refresh };
}


function BedTooltip({ bed, patient }) {
  if (!patient) {
    return (
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 rounded-xl bg-white text-slate-800 text-xs px-3 py-2 shadow-2xl border border-slate-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
        <div className="font-bold text-Amber-600 mb-0.5">Available</div>
        <div className="text-slate-500">Bed {String(bed.id).padStart(3, "0")}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
      </div>
    );
  }

  const news   = NEWS_COLOR(patient.newsScore);
  const status = STATUS_STYLE[patient.flowStatus] || STATUS_STYLE.Stable;

  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-white text-slate-900 text-xs px-3 py-2.5 shadow-2xl border border-slate-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <div className="font-bold text-slate-900 mb-1 truncate">{patient.patientName}</div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {patient.flowStatus}
        </span>
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black text-white ${news.badge}`}>
          NEWS {patient.newsScore}
        </span>
      </div>
      <div className="text-slate-500 flex items-center gap-1"><User size={9} /> Age {patient.age}</div>
      <div className="text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={9} /> {timeAgo(patient.admittedAt)}</div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
    </div>
  );
}

function BedCell({ bedId, patient, view, isAvailable, onOccupiedClick, disabled }) {
  const isOccupied = !!patient;

  const handleClick = () => {
    if (isOccupied && !disabled && onOccupiedClick) {
      onOccupiedClick(patient);
    }
  };

  if (view === "list") {
    const news   = patient ? NEWS_COLOR(patient.newsScore) : null;
    const status = patient ? (STATUS_STYLE[patient.flowStatus] || STATUS_STYLE.Stable) : null;
    return (
      <div
        onClick={handleClick}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-150 ${
          isOccupied
            ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
            : isAvailable
            ? "bg-emerald-50/60 border-emerald-100 hover:border-emerald-300 cursor-default"
            : "bg-slate-50 border-slate-100 cursor-default opacity-60"
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOccupied ? "bg-blue-100" : isAvailable ? "bg-emerald-100" : "bg-slate-100"}`}>
          <BedDouble size={14} className={isOccupied ? "text-blue-600" : isAvailable ? "text-emerald-600" : "text-slate-400"} />
        </div>
        <div className="text-xs font-bold text-slate-600 w-10 flex-shrink-0">{String(bedId).padStart(3, "0")}</div>
        {isOccupied ? (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{patient.patientName}</div>
              <div className="text-[11px] text-slate-400">Age {patient.age} · {timeAgo(patient.admittedAt)}</div>
            </div>
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {patient.flowStatus}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black text-white ${news.badge}`}>
              NEWS {patient.newsScore}
            </span>
          </>
        ) : isAvailable ? (
          <div className="flex-1 text-xs text-emerald-600 font-medium">Available</div>
        ) : (
          <div className="flex-1 text-xs text-slate-400 font-medium">Unavailable</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group hover:z-50">
      <BedTooltip bed={{ id: bedId }} patient={patient} />
      <div
        onClick={handleClick}
        className={`
          relative flex flex-col items-center justify-center rounded-xl select-none
          transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg
          w-full aspect-square
          ${isOccupied
            ? `cursor-pointer ${
                patient.newsScore >= 7
                  ? "bg-red-50 border-2 border-red-300 hover:border-red-400 hover:shadow-red-100"
                  : patient.flowStatus === "UnderObservation" || patient.flowStatus === "WaitingDoctor"
                  ? "bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-amber-100"
                  : "bg-blue-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-blue-100"
              }`
            : isAvailable
            ? "cursor-default bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100"
            : "cursor-default bg-slate-50 border border-slate-200 opacity-50"
          }
        `}
        style={{ minWidth: 0 }}
      >
        {isOccupied ? (
          <>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
              patient.newsScore >= 7 ? "bg-red-200" :
              patient.flowStatus === "UnderObservation" || patient.flowStatus === "WaitingDoctor" ? "bg-amber-200" : "bg-blue-200"
            }`}>
              <User size={12} className={
                patient.newsScore >= 7 ? "text-red-600" :
                patient.flowStatus === "UnderObservation" || patient.flowStatus === "WaitingDoctor" ? "text-amber-600" : "text-blue-600"
              } />
            </div>
            <div className="text-[10px] font-black text-slate-600 leading-none">{String(bedId).padStart(3, "0")}</div>
            {patient.newsScore >= 4 && (
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${patient.newsScore >= 7 ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
            )}
          </>
        ) : isAvailable ? (
          <>
            <CheckCircle2 size={14} className="text-emerald-500 mb-1" />
            <div className="text-[10px] font-black text-slate-400 leading-none">{String(bedId).padStart(3, "0")}</div>
          </>
        ) : (
          <>
            <BedDouble size={14} className="text-slate-300 mb-1" />
            <div className="text-[10px] font-black text-slate-300 leading-none">{String(bedId).padStart(3, "0")}</div>
          </>
        )}
      </div>
    </div>
  );
}

function DepartmentSection({ dept, occupiedMap, availableSet, filter, search, view, onOccupiedClick, disabled }) {
  const [collapsed, setCollapsed] = useState(false);

  const beds = useMemo(() => {
    const all = Array.from({ length: dept.total }, (_, i) => {
      const id        = dept.startId + i;
      const patient   = occupiedMap[id] || null;
      const available = availableSet.has(id);
      return { id, patient, available };
    });
    return all.filter(({ id, patient, available }) => {
      if (filter === "available" && (!available || patient)) return false;
      if (filter === "occupied" && !patient) return false;
      if (search) {
        const q      = search.toLowerCase();
        const bedNum = String(id).padStart(3, "0");
        if (!bedNum.includes(q) && !(patient?.patientName?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [dept, occupiedMap, availableSet, filter, search]);

  if (beds.length === 0) return null;

  const occupied  = beds.filter((b) => b.patient).length;
  const available = beds.filter((b) => b.available && !b.patient).length;
  const pct       = Math.round((occupied / dept.total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Stethoscope size={16} className="text-blue-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-slate-800">{dept.name}</div>
            <div className="text-[11px] text-slate-400">{dept.total} beds total</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 lg:gap-4 mr-2 lg:mr-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500 font-medium">{available} free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-slate-500 font-medium">{occupied} occupied</span>
          </div>
          <div className="w-20 lg:w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? "bg-red-400" : pct > 50 ? "bg-amber-400" : "bg-blue-400"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 w-8 text-right">{pct}%</span>
        </div>

        {collapsed ? <ChevronDown size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />}
      </button>

      {!collapsed && (
        <div className="px-4 sm:px-5 pb-5">
          <div className="h-px bg-slate-100 mb-4" />
          {view === "list" ? (
            <div className="flex flex-col gap-2">
              {beds.map(({ id, patient, available }) => (
                <BedCell
                  key={id}
                  bedId={id}
                  patient={patient}
                  isAvailable={available}
                  view="list"
                  onOccupiedClick={onOccupiedClick}
                  disabled={disabled}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))" }}>
              {beds.map(({ id, patient, available }) => (
                <BedCell
                  key={id}
                  bedId={id}
                  patient={patient}
                  isAvailable={available}
                  view="grid"
                  onOccupiedClick={onOccupiedClick}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={36} className="text-blue-400 animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading bed layout…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700 mb-1">Failed to load bed data</p>
        <p className="text-xs text-slate-400">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
      >
        Retry
      </button>
    </div>
  );
}

export default function BedManagement() {
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [view, setView]               = useState("grid");
  const [modalPatient, setModalPatient] = useState(null);

  const { departments, occupiedMap, availableSet, loading, error, refresh } = useBedData();

  const totalBeds     = departments.reduce((s, d) => s + d.total, 0);
  const totalOccupied = Object.keys(occupiedMap).length;
  const totalAvailable = availableSet.size;
  const critical      = Object.values(occupiedMap).filter((p) => p.newsScore >= 7).length;

  const handleTransferSuccess = () => {
    setModalPatient(null);
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Beds",  value: totalBeds,      icon: BedDouble,     color: "text-slate-600",  bg: "bg-slate-100",  border: "border-slate-200"  },
            { label: "Available",   value: totalAvailable,  icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "Occupied",    value: totalOccupied,   icon: Users,        color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200"   },
            { label: "Critical",    value: critical,        icon: AlertTriangle,color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200"    },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-3 sm:p-4 flex items-center gap-3 sm:gap-4`}>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <div className={`text-xl sm:text-2xl font-black ${color}`}>
                  {loading ? <Loader2 size={18} className="animate-spin opacity-40" /> : value}
                </div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bed or patient…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {["all", "available", "occupied"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 capitalize ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {f === "all" ? "All Beds" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 sm:gap-4 flex-wrap text-xs">
          <div className="text-slate-400 font-medium">Legend</div>
          {[
            { color: "bg-emerald-200 border border-emerald-300", label: "Available" },
            { color: "bg-blue-200 border border-blue-300",       label: "Stable" },
            { color: "bg-amber-200 border border-amber-300",     label: "Under Observation / Waiting" },
            { color: "bg-red-200 border border-red-300",         label: "Critical" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-sm ${color}`} />
              <span className="text-slate-500">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-500">High NEWS score</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-blue-600 font-medium">
            <ArrowRightLeft size={11} />
            <span className="hidden sm:inline">Click occupied bed to transfer</span>
            <span className="sm:hidden">Click bed to transfer</span>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <div className="flex flex-col gap-4">
            {departments.map((dept) => (
              <DepartmentSection
                key={dept.id}
                dept={dept}
                occupiedMap={occupiedMap}
                availableSet={availableSet}
                filter={filter}
                search={search}
                view={view}
                onOccupiedClick={setModalPatient}
                disabled={!!modalPatient}
              />
            ))}
          </div>
        )}
      </div>

      {modalPatient && (
        <TransferModal
          patient={modalPatient}
          departments={departments}
          onClose={() => setModalPatient(null)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
}
