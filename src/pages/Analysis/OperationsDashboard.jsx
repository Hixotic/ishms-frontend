import { useState } from "react";
import { T } from "./constants/theme";
import { EP } from "./constants/endpoints";
import SectionHeader from "./components/SectionHeader";
import useApi from "./hooks/useApi";
import { arr, num } from "./utils/helpers";
import KpiCard from "./components/KpiCard";
import WCard from "./components/WCard";
import Skeleton from "./components/Skeleton";
import Empty from "./components/EmptyState";
import CustomTooltip from "./components/CustomTooltip";
import PillsFilter from "./components/PillsFilter"; 
import { equalTwoCol } from "./layouts/dashboardLayout";
import Layout from "./components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Bed, Activity, CheckCircle, Zap, LayoutGrid, Clock, AlertTriangle } from "lucide-react";


export default function OperationsPage() {

  const [deptFilter, setDeptFilter] = useState("All");

  const bedMap = useApi(EP.bedMap, 3 * 60000);
  const peaks = useApi(EP.peakHours, 30 * 60000);
  const shortage = useApi(EP.bedShortage, 5 * 60000);

  const beds = arr(bedMap.data?.beds ?? bedMap.data);
  const total = bedMap.data?.totalBeds ?? beds.length;
  const occ = bedMap.data?.occupiedBeds ?? beds.filter((b) => b.patientName !== null).length;
  const free = bedMap.data?.freeBeds ?? (total - occ);
  const occupancyRate = total > 0 ? Math.round((occ / total) * 100) : 0;

  const departments = ["All", ...new Set(beds.map((b) => b.departmentName ?? "Unknown"))];
  const filteredBeds = deptFilter === "All" ? beds : beds.filter((b) => b.departmentName === deptFilter);

  const grouped = filteredBeds.reduce((acc, b) => {
    const d = b.departmentName ?? "Unknown";
    const r = b.roomNumber ?? "?";
    if (!acc[d]) acc[d] = {};
    if (!acc[d][r]) acc[d][r] = [];
    acc[d][r].push(b);
    return acc;
  }, {});

  const peakData = arr(peaks.data?.hours ?? peaks.data).map((h) => ({
    hour: `${String(h.hour ?? 0).padStart(2, "0")}:00`,
    Admissions: h.admissionCount ?? 0, 
  }));

  const maxAdmissions = Math.max(...peakData.map(d => d.Admissions), 1);

  const shortageData = arr(shortage.data?.departments ?? shortage.data)
    .filter(d => deptFilter === "All" || d.departmentName === deptFilter);

  const cardStyle = { padding: "24px", borderRadius: "20px", boxShadow: "0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" };

  return (
          <div className="-mx-4 md:-mx-8 max-w-none">
    <Layout>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PillsFilter options={departments} active={deptFilter} onChange={setDeptFilter} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        <KpiCard title="Total Capacity" value={total} icon={<Bed size={20} color={T.blue} />} />
        <KpiCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={<Activity size={20} color={T.red} />} />
        <KpiCard title="Available Beds" value={free} icon={<CheckCircle size={20} color={T.green} />} />
        <KpiCard title="Bed Turnaround" value="45m" icon={<Zap size={20} color="#fb8c00" />} />
      </div>

      <div style={equalTwoCol}>
        <WCard style={cardStyle}>
          <SectionHeader ts={bedMap.ts} onRefresh={bedMap.refresh}>
            <LayoutGrid size={18} color={T.blue} /> Bed Map
          </SectionHeader>
          {bedMap.loading ? <Skeleton height={280} /> :
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(grouped).map(([dept, rooms]) => (
                <div key={dept}>
                  <p style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{dept}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(rooms).map(([room, rBeds]) => (
                      <div key={room} style={{ background: T.bluePale, borderRadius: 8, padding: "8px", minWidth: 80 }}>
                        <p style={{ color: T.blue, fontSize: 9, textAlign: "center", fontWeight: 700, marginBottom: 5 }}>Room {room}</p>
                        <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                          {rBeds.map((b, i) => {
                            const isOccupied = b.patientName !== null;
                            const pending = b.flowStatus === "PendingDischarge";
                            const col = !isOccupied ? T.green : pending ? T.yellow : T.red;
                            return (
                              <div key={i} title={b.patientName ? `${b.patientName} NEWS:${b.newsScore}` : "Available"}
                                style={{ width: 22, height: 28, borderRadius: 4, background: col + "22", border: `1.5px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: col }}>
                                {!isOccupied ? "✓" : pending ? "⏳" : "●"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        </WCard>

        <WCard style={cardStyle}>
          <SectionHeader ts={peaks.ts}>
            <Clock size={18} color={T.blue} /> Peak Admission Hours
          </SectionHeader>
          {peaks.loading ? <Skeleton height={280} /> : peakData.length === 0 ? <Empty /> :
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peakData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Admissions" radius={[6, 6, 0, 0]}>
                  {peakData.map((entry, i) => {
                    const intensity = entry.Admissions / maxAdmissions;
                    
                    const isMax = entry.Admissions === maxAdmissions && maxAdmissions > 0;
                    
                    return (
                      <Cell 
                        key={i} 
                        fill={isMax ? T.red : T.blue} 
                        fillOpacity={isMax ? 1 : (0.4 + (intensity * 0.6))} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </WCard>
      </div>

      <WCard style={cardStyle}>
        <SectionHeader ts={shortage.ts}>
          <AlertTriangle size={18} color={T.blue} /> Bed Shortage Risk by Department
        </SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {shortageData.map((d, i) => {
         const occ = d.occupancyRate ?? 0;
         const risk = occ >= 80 ? "CRITICAL" : occ >= 60 ? "HIGH RISK" : occ >= 40 ? "MODERATE" : "STABLE";
         const col = risk === "CRITICAL" ? T.red : risk === "HIGH RISK" ? T.red : risk === "MODERATE" ? "#fb8c00" : T.green;

  return (
    <div key={i} style={{ background: col + "0a", border: `1px solid ${col}22`, borderRadius: 12, padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{d.departmentName ?? "Dept"}</div>
        <div style={{ fontSize: 11, color: T.muted }}>
          {num(occ, 0)}% Occ · {d.availableBeds ?? 0} Free
        </div>
      </div>
      <div style={{ color: col, fontSize: 10, fontWeight: 700, background: col + "15", padding: "4px 8px", borderRadius: 6 }}>
        {risk}
      </div>
    </div>
             );
            })}
        </div>
      </WCard>
    </div>
  </Layout>
  </div>
  );
}