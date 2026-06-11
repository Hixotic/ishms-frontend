import { T } from "../constants/theme";

export default function RiskBadge({ risk }) {
  const colors = {
    Critical: T.red,
    High: "#fb8c00",
    Medium: T.yellow,
    Low: T.green,
  };

  const displayRisk = risk || "N/A";
  const color = colors[risk] || T.muted;

  return (
    <span
      style={{
        background: color + "22",
        color: color,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {displayRisk}
    </span>
  );
}