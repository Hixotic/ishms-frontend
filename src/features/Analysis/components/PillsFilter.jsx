import { T } from "../constants/theme";

export default function PillsFilter({ options, active, onChange }) {
  return (
    <div style={{ 
      display: "flex", 
      gap: 8, 
      padding: "5px",
      background: "#fff",
      borderRadius: 14,
      width: "fit-content",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      border: `1px solid ${T.border}`,
      marginBottom: "20px"
    }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "none",
            fontSize: 12,
            fontWeight: active === opt ? 700 : 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: active === opt ? T.blue : "transparent",
            color: active === opt ? "#fff" : T.muted,
            boxShadow: active === opt ? "0 2px 8px rgba(0, 0, 255, 0.2)" : "none"
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}