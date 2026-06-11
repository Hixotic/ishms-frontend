import { T, RISK_COLOR } from "../constants/theme";

import { useState } from 'react';

export default function KpiCard({ title, value, unit, icon }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16, // خليتها 16 بدل 18 عشان تبقى أنعم
        padding: "16px",
        paddingInline:"0px",
        height: 120, // صغرتها سيكة عشان تتناسب مع الداشبورد
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #f1f5f9",
        boxShadow: isHovered 
          ? "0 10px 20px rgba(0,0,0,0.08)" 
          : "0 4px 6px rgba(0,0,0,0.04)", // شادو أخف بكتير وأشيك
        transform: isHovered ? "translateY(-4px)" : "translateY(0)", // حركة بسيطة وناعمة
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>

      <p style={{ 
        color: "#64748b", // لون رمادي أهدى للعنوان
        fontSize: 11, 
        fontWeight: 600, // مريح للعين
        textTransform: 'uppercase', // شكل احترافي أكتر
        letterSpacing: '0.5px',
        margin: 0 
      }}>
        {title}
      </p>

      <h2 style={{ 
        fontSize: 22,
        fontWeight: 700, 
        color: "#1e293b", 
        margin: "4px 0 0 0",
      }}>
{value}
  {unit && (
    <span style={{ fontSize: 13, marginLeft: 4, color: "#94a3b8", fontWeight: 500 }}>
      {unit}
    </span>
  )}
</h2>
    </div>
  );
}