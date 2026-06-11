import { T, RISK_COLOR } from "../constants/theme";

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const sortedPayload = [...payload].sort((a, b) => {
    const order = { "Critical": 1, "High": 2, "Medium": 3 };
    return (order[a.name] || 99) - (order[b.name] || 99);
  });

  return (
    <div style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 4px 16px #00000015"
    }}>
      <p style={{ color: T.muted, marginBottom: 4 }}>{label}</p>
      {sortedPayload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}