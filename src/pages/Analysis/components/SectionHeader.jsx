import { T } from "../constants/theme";

export default function SectionHeader({ children, ts, onRefresh }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center", 
      position: "relative", 
      marginBottom: 16
    }}>
<h3 style={{
  fontSize: 14,
  fontWeight: 700,
  color: T.text,
  margin: 0,
  textAlign: "center",
  display: "flex",      
  alignItems: "center",  
  gap: "8px"             
}}>
  {children}
</h3>
      
      {(ts || onRefresh) && (
        <div style={{ position: "absolute", right: 0, display: "flex", gap: 8, alignItems: "center" }}>
          {ts && <span style={{ fontSize: 10, color: T.muted }}>{ts.toLocaleTimeString()}</span>}
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                color: T.muted,
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
                fontSize: 11
              }}
            >↻</button>
          )}
        </div>
      )}
    </div>
  );
}