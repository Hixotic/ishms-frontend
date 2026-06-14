import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Modal, Button } from "../components/ui";
import { analyticsService, patientService } from "../api/services/index";
import { rooms as mockRooms } from "../data/mockData";
import { User, Clock, RefreshCw } from "lucide-react";

const statusConfig = {
  stable:      { bar:"bg-success", badge:"bg-green-50 text-green-700",  label:"Stable"      },
  observation: { bar:"bg-warning", badge:"bg-amber-50 text-amber-700",  label:"Observation" },
  critical:    { bar:"bg-danger",  badge:"bg-red-50 text-red-700",      label:"Critical"    },
};

// Map API bed/patient data → room shape our UI uses
function normaliseRoom(item) {
  const vitals = item.latestVitals ?? item.vitals ?? {};
  const status =
    item.status?.toLowerCase() ??
    (item.news2Score >= 7 ? "critical" : item.news2Score >= 4 ? "observation" : "stable");

  return {
    id:         item.id ?? item.patientId ?? item.bedId,
    num:        item.bedNumber ?? item.roomNumber ?? item.bedCode ?? `R-${item.id}`,
    name:       item.patientName ?? item.fullName ?? item.name ?? "—",
    nurse:      item.nurseName   ?? item.assignedNurse ?? "—",
    status:     statusConfig[status] ? status : "stable",
    news2:      item.news2Score  ?? item.news2 ?? 0,
    age:        item.age         ?? item.patientAge ?? 0,
    lastUpdate: item.lastUpdate  ?? item.updatedAt ?? "—",
    dept:       item.departmentName ?? item.department ?? "",
    vitals: {
      bp:   vitals.bp   ?? (vitals.systolicPressure && vitals.diastolicPressure
              ? `${vitals.systolicPressure}/${vitals.diastolicPressure}` : "—"),
      hr:   vitals.hr   ?? vitals.heartRate      ?? "—",
      rr:   vitals.rr   ?? vitals.respirationRate?? "—",
      spo2: vitals.spo2 ?? vitals.oxygenLevel    ?? "—",
      temp: vitals.temperature ?? "—",
    },
  };
}

function Skeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 pt-5 animate-pulse">
      <div className="h-2.5 bg-slate-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-3/4 mb-3" />
      <div className="h-2 bg-slate-100 rounded w-2/3 mb-3" />
      <div className="h-4 bg-slate-100 rounded-full w-16" />
    </div>
  );
}

function RoomCard({ room, onClick }) {
  const cfg = statusConfig[room.status] ?? statusConfig.stable;
  return (
    <div onClick={() => onClick(room)}
      className="bg-card rounded-2xl shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-200 cursor-pointer relative overflow-hidden p-4 pt-5">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${cfg.bar}`} />
      <div className="font-manrope font-extrabold text-[15px] text-txt-primary">{room.num}</div>
      <div className="text-[12px] font-medium text-txt-primary mt-0.5 truncate">{room.name}</div>
      <div className="flex items-center gap-1 mt-2 text-[11px] text-txt-muted">
        <User size={10} /><span className="truncate">{room.nurse}</span>
      </div>
      <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
        {cfg.label}
      </span>
    </div>
  );
}

export default function WardHeatmap() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [rooms,    setRooms]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [selected, setSelected]= useState(null);
  const [filter,   setFilter]  = useState("all");

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getBedMap();
      if (Array.isArray(data) && data.length) {
        setRooms(data.map(normaliseRoom));
      } else {
        setRooms(mockRooms);
      }
    } catch {
      setRooms(mockRooms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // Auto-open modal if coming from search
  useEffect(() => {
    if (location.state?.selectedRoom) setSelected(location.state.selectedRoom);
  }, [location.state]);

  const filtered = filter === "all" ? rooms : rooms.filter(r => r.status === filter);
  const counts   = {
    all:         rooms.length,
    stable:      rooms.filter(r => r.status === "stable").length,
    observation: rooms.filter(r => r.status === "observation").length,
    critical:    rooms.filter(r => r.status === "critical").length,
  };

  // Group by department name (or fall back to prefix letter)
  const groupBy = (arr) => {
    const groups = {};
    arr.forEach(r => {
      const key = r.dept || (r.num ? r.num.split("-")[0] : "Ward");
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  };
  const groups = groupBy(filtered);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Ward Heatmap</h1>
          <p className="text-txt-secondary text-[13px] mt-0.5">{rooms.length} beds loaded</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRooms} title="Refresh"
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="flex items-center gap-2 text-[12px]">
            {["all","stable","observation","critical"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${filter === s ? "bg-accent text-white" : "bg-card text-txt-secondary border border-slate-200 hover:bg-surf"}`}>
                {s === "all" ? `All (${counts.all})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${counts[s]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[12px] text-txt-secondary">
        {[["bg-success","Stable"],["bg-warning","Observation"],["bg-danger","Critical"]].map(([c,l]) => (
          <span key={l} className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${c}`} />{l}</span>
        ))}
      </div>

      {loading ? (
        <Card>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array(12).fill(0).map((_, i) => <Skeleton key={i} />)}
          </div>
        </Card>
      ) : (
        Object.entries(groups).map(([dept, deptRooms]) => (
          <Card key={dept}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-manrope font-bold text-txt-primary text-[15px]">{dept}</h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {deptRooms.map(room => <RoomCard key={room.id} room={room} onClick={setSelected} />)}
            </div>
          </Card>
        ))
      )}

      {/* Room Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.num} — ${selected.name}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              navigate(`/patient/${selected.id}`, { state: { patient: selected } });
              setSelected(null);
            }}>View Patient</Button>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-manrope font-bold text-accent text-lg">
                {selected.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
              <div>
                <p className="font-semibold text-txt-primary text-[15px]">{selected.name}</p>
                <p className="text-[12px] text-txt-muted">Age {selected.age} · {selected.num}</p>
              </div>
              <span className={`ml-auto inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${statusConfig[selected.status]?.badge}`}>
                {statusConfig[selected.status]?.label}
              </span>
            </div>
            <div className="bg-surf rounded-xl p-4 grid grid-cols-2 gap-3">
              {[["Blood Pressure", selected.vitals.bp],["Heart Rate", `${selected.vitals.hr} bpm`],
                ["Respiratory Rate", `${selected.vitals.rr} /min`],["SpO₂", selected.vitals.spo2]].map(([lbl,val]) => (
                <div key={lbl}>
                  <p className="text-[11px] text-txt-muted font-medium">{lbl}</p>
                  <p className="font-manrope font-bold text-txt-primary text-[16px]">{val}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div>
                <span className="text-txt-muted">NEWS2 Score: </span>
                <span className={`font-bold ${selected.news2 >= 7 ? "text-danger" : selected.news2 >= 4 ? "text-warning" : "text-success"}`}>
                  {selected.news2}
                </span>
              </div>
              <div className="text-txt-muted text-[12px] flex items-center gap-1">
                <Clock size={12} /> {selected.lastUpdate}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <User size={14} className="text-accent" />
              <span className="text-[13px] font-medium text-accent">Assigned Nurse: {selected.nurse}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
