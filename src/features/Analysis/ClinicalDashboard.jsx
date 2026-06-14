import useApi from "./hooks/useApi";
import Empty from "./components/EmptyState";
import Skeleton from "./components/Skeleton";
import SectionHeader from "./components/SectionHeader";
import { EP } from "./constants/endpoints";
import WCard from "./components/WCard";
import { arr, num } from "./utils/helpers";
import RiskBadge from "./components/RiskBadge";
import { T, RISK_COLOR } from "./constants/theme";
import Layout from "./components/Layout";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Bell, AlertTriangle, Activity, LayoutGrid } from "lucide-react";

export default function ClinicalPage() {
  const risk = useApi(EP.riskBoard, 60000);
  const feed = useApi(EP.alertFeed, 30000);

  const riskOrder = { "Critical": 3, "High": 2, "Medium": 1, "Low": 0 };
  const allPatients = arr(risk.data?.patients ?? risk.data);
  const sortedPatients = [...allPatients].sort(
    (a, b) => (riskOrder[b.riskLevel] ?? -1) - (riskOrder[a.riskLevel] ?? -1) || (b.newsScore ?? 0) - (a.newsScore ?? 0)
  );

  const critical = allPatients.filter((p) => p.riskLevel === "Critical").length;
  const alerts = arr(feed.data?.alerts ?? feed.data);

  const pieDist = ["Critical", "High", "Medium", "Low"]
    .map((b) => ({ name: b, value: allPatients.filter((p) => p.riskLevel === b).length }))
    .filter((d) => d.value > 0);

  const blueShades = ["#1e3a8a", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"];
  const cardStyle = {
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9"
  };

  return (
    <div className="-mx-4 md:-mx-8 max-w-none">
    <Layout fullWidth>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {critical > 0 && (
          <div style={{ background: T.red + "15", border: `1px solid ${T.red}44`, borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <span style={{ color: T.red, fontWeight: 700, fontSize: 13 }}>
              {critical} CRITICAL PATIENT{critical > 1 ? "S" : ""} — IMMEDIATE ATTENTION REQUIRED
            </span>
          </div>
        )}

        {/* 2-column layout with 4 sections */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          
          {/* LEFT COLUMN (wider) */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Top Risk Patients */}
            <WCard style={cardStyle}>
              <SectionHeader>
                <AlertTriangle size={18} color={T.red} /> Top Risk Patients
              </SectionHeader>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr", padding: "10px 15px", color: T.muted, fontSize: "12px", fontWeight: 600 }}>
                <span>Patient</span><span>Dept</span><span>Risk</span><span>NEWS</span><span>O₂</span><span>HR</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sortedPatients.slice(0, 10).map((p, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr", padding: "12px 15px", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, alignItems: "center", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600 }}>{p.patientName}</span>
                    <span>{p.department}</span>
                    <span><RiskBadge risk={p.riskLevel} /></span>
                    <span style={{ fontWeight: 700 }}>{p.newsScore}</span>
                    <span>{num(p.oxygenSaturation, 0)}%</span>
                    <span style={{ fontWeight: 600 }}>{p.heartRate}</span>
                  </div>
                ))}
              </div>
            </WCard>

            {/* Live Clinical Feed */}
            <WCard style={cardStyle}>
              <SectionHeader>
                <LayoutGrid size={18} color={T.blue} /> Live Clinical Feed
              </SectionHeader>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(150px, 1fr))", gap: 12 }}>
                {allPatients.filter((p) => p.riskLevel === "Critical").slice(0, 6).map((p, i) => (
                  <div key={i} style={{ borderLeft: "4px solid #ef4444", padding: "12px", background: "#fff5f5", borderRadius: 8 }}>
                    <div style={{ fontWeight: 700 }}>🚨 {p.patientName}</div>
                    <div style={{ fontSize: 11 }}>{p.department} • NEWS: {p.newsScore}</div>
                  </div>
                ))}
              </div>
            </WCard>

          </div>

          {/* RIGHT COLUMN (narrower) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Risk Distribution */}
            <WCard style={cardStyle}>
              <SectionHeader>
                <Activity size={18} color={T.blue} /> Risk Distribution
              </SectionHeader>
              {risk.loading ? <Skeleton height={200} /> : pieDist.length === 0 ? <Empty /> :
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieDist} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieDist.map((d, i) => (
                        <Cell key={i} fill={d.name === "Critical" ? T.red : blueShades[i % blueShades.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              }
            </WCard>

            {/* Live Alerts */}
            <WCard style={cardStyle}>
              <SectionHeader ts={feed.ts}>
                <Bell size={18} color={T.blue} /> Live Alerts
              </SectionHeader>
              <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {alerts.slice(0, 8).map((a, i) => {
                  const sev = a.severity ?? a.Severity ?? "Medium";
                  const c = RISK_COLOR[sev] ?? T.muted;
                  return (
                    <div key={i} style={{ background: c + "0f", borderLeft: `3px solid ${c}`, borderRadius: "0 8px 8px 0", padding: "8px 10px" }}>
                      <p style={{ color: T.text, fontSize: 11, fontWeight: 600, margin: 0 }}>{a.patientName ?? a.patient ?? "Unknown"}</p>
                      <p style={{ color: T.muted, fontSize: 10, margin: 0 }}>{a.message ?? a.Message ?? ""}</p>
                    </div>
                  );
                })}
              </div>
            </WCard>

          </div>

        </div>
      </div>
    </Layout>
    </div>
  );
}