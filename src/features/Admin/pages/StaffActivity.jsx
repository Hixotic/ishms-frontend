import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Card, CardHeader, SectionTitle, Badge, Avatar, Table, TableRow, TableCell, Input, Select } from "../components/ui";
import { taskService } from "../api/services/index";
import { staff as mockStaff } from "../data/mockData";

// Map API task/user data → staff shape
function buildStaffFromTasks(tasks) {
  const map = {};
  tasks.forEach(t => {
    const uid = t.assignedToId ?? t.userId ?? t.id;
    if (!map[uid]) {
      map[uid] = {
        id:               uid,
        name:             t.assignedToName ?? t.userName ?? t.fullName ?? "Unknown",
        initials:         (t.assignedToName ?? t.userName ?? "?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(),
        role:             t.role ?? "Staff",
        department:       t.departmentName ?? t.department ?? "—",
        assignedPatients: 0,
        completedTasks:   0,
        pendingTasks:     0,
        lastActivity:     t.updatedAt ?? t.createdAt ?? "—",
        status:           "active",
        color:            "#2563EB",
      };
    }
    if (t.isCompleted) map[uid].completedTasks++;
    else               map[uid].pendingTasks++;
    if (t.patientId)   map[uid].assignedPatients = new Set([...(map[uid]._pids??[]), t.patientId]).size;
    map[uid]._pids = [...(map[uid]._pids??[]), t.patientId].filter(Boolean);
  });
  return Object.values(map);
}

const ROLE_COLORS = ["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#BE185D","#64748B"];

export default function StaffActivity() {
  const [staffList,    setStaffList]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [dept,         setDept]         = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const user = (() => { try { return JSON.parse(localStorage.getItem("ishms_user")); } catch { return null; } })();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const role = user?.role ?? "Admin";
      const tasks = await taskService.getByRole(role);
      if (Array.isArray(tasks) && tasks.length) {
        const built = buildStaffFromTasks(tasks);
        // assign distinct colours
        setStaffList(built.map((s,i) => ({ ...s, color: ROLE_COLORS[i % ROLE_COLORS.length] })));
      } else {
        setStaffList(mockStaff);
      }
    } catch {
      setStaffList(mockStaff);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const departments = ["all", ...new Set(staffList.map(s => s.department).filter(Boolean))];

  const filtered = staffList.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    const md = dept === "all" || s.department === dept;
    const mv = statusFilter === "all" || s.status === statusFilter;
    return ms && md && mv;
  });

  const onShift    = staffList.filter(s => s.status !== "offline").length;
  const totalTasks = staffList.reduce((a,s) => a + s.completedTasks, 0);
  const totalPts   = staffList.reduce((a,s) => a + s.assignedPatients, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Staff Activity</h1>
          <p className="text-txt-secondary text-[13px] mt-0.5">{staffList.length} staff loaded</p>
        </div>
        <button onClick={fetchStaff} title="Refresh"
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"On Shift",              value: loading ? "—" : onShift,    color:"text-accent"  },
          { label:"Total Tasks Completed", value: loading ? "—" : totalTasks, color:"text-success" },
          { label:"Patients Assigned",     value: loading ? "—" : totalPts,   color:"text-warning" },
        ].map(k => (
          <Card key={k.label} className="p-4 text-center">
            <div className={`font-manrope text-[28px] font-extrabold ${k.color}`}>{k.value}</div>
            <div className="text-[12px] text-txt-muted font-medium mt-1">{k.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <SectionTitle>Staff Members</SectionTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Input placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={14} />} className="w-44" />
            <Select value={dept} onChange={setDept} options={departments.map(d => ({ value:d, label: d==="all"?"All Departments":d }))} className="w-40" />
            <Select value={statusFilter} onChange={setStatusFilter}
              options={["all","active","busy","offline"].map(s => ({ value:s, label: s==="all"?"All Status":s.charAt(0).toUpperCase()+s.slice(1) }))} className="w-32" />
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table headers={["Staff","Role","Department","Assigned","Completed","Last Activity","Status"]}>
            {filtered.map(m => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={m.initials} color={m.color} size="sm" />
                    <span className="font-medium text-txt-primary">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell><span className="text-txt-secondary">{m.role}</span></TableCell>
                <TableCell><span className="text-txt-secondary">{m.department}</span></TableCell>
                <TableCell><span className="font-semibold text-txt-primary">{m.assignedPatients}</span></TableCell>
                <TableCell><span className="font-semibold text-success">{m.completedTasks}</span></TableCell>
                <TableCell><span className="text-txt-muted text-[12px]">{m.lastActivity}</span></TableCell>
                <TableCell><Badge variant={m.status}>{m.status.charAt(0).toUpperCase()+m.status.slice(1)}</Badge></TableCell>
              </TableRow>
            ))}
          </Table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-10 text-center text-txt-muted text-[13px]">No staff match your filters.</div>
        )}
      </Card>
    </div>
  );
}
