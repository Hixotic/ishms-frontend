import { T, RISK_COLOR } from "../constants/theme";
export default function TopBar({ time }) {
  return (
    <div style={{
  position: "sticky", top: 0, zIndex: 10,
  background: T.white + "f0", backdropFilter: "blur(10px)",
  borderBottom: `1px solid ${T.border}`,
  padding: "16px 28px", 
  display: "flex", alignItems: "center", justifyContent: "space-between",
  boxShadow: "0 4px 20px rgba(21, 101, 192, 0.08)" 
}}>
  
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <img src={IMG_LOGO} alt="iSHMS" 
      style={{ width: 48, height: 48, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", objectFit: "cover" }} />
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>
Analysis Dashboard      </h1>
      <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
        Hospital Smart Health Monitoring System
      </p>
    </div>
  </div>

  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <div style={{ background: T.green + "15", border: `1px solid ${T.green}44`,
      borderRadius: 10, padding: "8px 16px", fontSize: 12, color: T.green, fontWeight: 600 }}>
      ● Azure · Connected
    </div>
    <div style={{ background: T.bluePale, border: `1px solid ${T.blue}33`,
      borderRadius: 10, padding: "8px 16px", fontSize: 12, color: T.blue, fontWeight: 600 }}>
      📅 {time.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
    </div>
  </div>
</div>
  );
}