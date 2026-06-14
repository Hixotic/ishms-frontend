import { T, RISK_COLOR } from "./constants/theme";
import { EP } from "./constants/endpoints";
import { useState } from "react";
import SectionHeader from "./components/SectionHeader";
import useApi from "./hooks/useApi";
import { arr, num } from "./utils/helpers";
import KpiCard from "./components/KpiCard";
import WCard from "./components/WCard";
import Skeleton from "./components/Skeleton";
import Empty from "./components/EmptyState";
import CustomTooltip from "./components/CustomTooltip";
import { fiveCol, equalTwoCol } from "./layouts/dashboardLayout";
import Layout from "./components/Layout";
import { Bed, Activity, BarChart2, AlertTriangle, Clock, LayoutGrid, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";

export default function ExecutivePage() {
  const sum = useApi(EP.Analytics, 5 * 60000);
  const dept = useApi(EP.deptLoad, 3 * 60000);
  const trend = useApi(EP.alertTrend, 10 * 60000);
  const risk = useApi(EP.riskBoard, 60000);
  const [tooltip, setTooltip] = useState(null);
  const s = sum.data ?? {};
  const occ = s.bedOccupancyRate ?? 0;
  const news = s.avgNewsScore ?? s.averageNewsScore ?? 0;
  const crit = s.criticalAlertsToday ?? s.criticalAlerts ?? 0;
  const pats = s.currentPatients ?? s.activePatients ?? s.totalPatients ?? 0;
  const free = s.emptyBeds ?? s.availableBeds ?? 0;
  const over = s.overdueTasks ?? 0;

  const trendRaw = arr(trend.data).map(d => ({
    date: d.date ? new Date(d.date).toLocaleDateString("en", { weekday: "short" }) : "",
    Critical: d.criticalCount ?? 0,
    High: d.warningCount ?? 0,
    Medium: d.infoCount ?? 0
  }));

  const riskPatients = arr(risk.data);
  const riskData = [
    { name: "Critical", value: riskPatients.filter(x => x.riskLevel === "Critical").length, color: T.red },
    { name: "High", value: riskPatients.filter(x => x.riskLevel === "High").length, color: "#3b82f6" },
    { name: "Medium", value: riskPatients.filter(x => x.riskLevel === "Medium").length, color: "#60a5fa" },
    { name: "Low", value: riskPatients.filter(x => x.riskLevel === "Low").length, color: "#93c5fd" }
  ];

  const depts = arr(dept.data);
  const maxScore = Math.max(...depts.map(d => d.loadScore ?? 0), 1);
  const sortedDepts = [...depts].sort((a, b) => b.overdueTasks - a.overdueTasks);
  const blueShades = ["#1e3a8a", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"];

  const cardStyle = { padding: "24px", borderRadius: "20px", boxShadow: "0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" };
  
  return (
        <div className="-mx-4 md:-mx-8 max-w-none">
      <Layout fullWidth>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={fiveCol}>
        <KpiCard loading={sum.loading} title="Active Patients" value={pats} icon={<Bed size={20} color={T.blue} />} color={T.blue} sub={`${free} beds available`} />
        <KpiCard loading={sum.loading} title="Bed Occupancy" value={num(occ, 1)} unit="%" icon={<Activity size={20} color={occ >= 90 ? T.red : T.green} />} color={occ >= 90 ? T.red : occ >= 75 ? "#fb8c00" : T.green} sub={occ >= 90 ? "Critical" : occ >= 75 ? "Warning" : "Normal"} />
        <KpiCard loading={sum.loading} title="Avg NEWS Score" value={num(news, 1)} icon={<BarChart2 size={20} color={T.blue} />} color={news >= 7 ? T.red : news >= 4 ? "#fb8c00" : T.green} sub="Hospital-wide" />
        <KpiCard loading={sum.loading} title="Critical Alerts" value={crit} icon={<AlertTriangle size={20} color={T.red} />} color={crit > 10 ? T.red : "#fb8c00"} sub="Today" />
        <KpiCard loading={sum.loading} title="Overdue Tasks" value={over} icon={<Clock size={20} color="#fb8c00" />} color={over > 5 ? T.red : "#fb8c00"} sub="Pending >4h" />
      </div>

      <div style={equalTwoCol}>
        <WCard style={cardStyle}>
          <SectionHeader ts={trend.ts} onRefresh={trend.refresh}>
             <TrendingUp size={18} color={T.blue} /> Alert Trend — Last 7 Days
          </SectionHeader>
          {trend.loading ? <Skeleton height={200} /> : trendRaw.length === 0 ? <Empty /> :
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendRaw}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Medium" name="Medium" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="High" name="High" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Critical" name="Critical" stroke={T.red} fill={T.red} fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          }
        </WCard>

 <WCard style={cardStyle}>
          <SectionHeader ts={dept.ts} onRefresh={dept.refresh}>
             <LayoutGrid size={18} color={T.blue} /> Department Load Index
          </SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 210, overflowY: "auto" }}>
            {depts.sort((a, b) => b.loadScore - a.loadScore).map((d, i) => (
              <div 
                key={i} 
                  onMouseEnter={(e) => setTooltip({ 
                    x: e.clientX, 
                    y: e.clientY, 
                    label: d.departmentName,
                    payload: [
                      { name: "Load Score", value: d.loadScore ?? 0, color: T.blue },
                      { name: "Active Patients", value: d.activePatients ?? 0, color: T.text }
                    ] 
                  })}
                onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))} // التعديل هنا: تحديث الإحداثيات أثناء الحركة
                onMouseLeave={() => setTooltip(null)}
                style={{ marginBottom: 12, cursor: 'pointer' }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{d.departmentName}</span>
                </div>
                <div style={{ background: T.border, borderRadius: 99, height: 7, position: 'relative' }}>
                  <div style={{ 
                    width: `${Math.min(((d.loadScore ?? 0) / maxScore) * 100, 100)}%`, 
                    height: 7, 
                    background: blueShades[i % blueShades.length], 
                    borderRadius: 99 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </WCard>
      </div>
{tooltip && (
  <div style={{
    position: "fixed",
    top: tooltip.y + 15,
    left: tooltip.x + 15,
    zIndex: 9999,
    pointerEvents: "none",
    transform: "translate(-50%, -100%)",
    backgroundColor: 'white',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    lineHeight: '1.5'
  }}>
    <div style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>{tooltip.label}</div>
    {tooltip.payload.map((p, idx) => (
      <div key={idx} style={{ color: p.color }}>
        {p.name}: <span style={{ fontWeight: 'bold', color: '#333' }}>{p.value}</span>
      </div>
    ))}
  </div>
)}
      <div style={equalTwoCol}>
        <WCard style={{ ...cardStyle, minHeight: 400 }}>
          <SectionHeader>
             <PieChartIcon size={18} color={T.blue} /> Risk Distribution
          </SectionHeader>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} label={({ value }) => value}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, marginTop: -20 }}>Total Analyzed: {pats} Patients</p>
        </WCard>

        <WCard style={cardStyle}>
          <SectionHeader>
            <Clock size={18} color={T.blue} /> Overdue Tasks by Department
          </SectionHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedDepts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="departmentName" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="overdueTasks" radius={[6, 6, 0, 0]}>
                {sortedDepts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={blueShades[index % blueShades.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </WCard>
      </div>
    </div>
    </Layout>
    </div>
  );
}