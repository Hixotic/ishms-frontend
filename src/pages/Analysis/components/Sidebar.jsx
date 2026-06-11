import { NavLink } from "react-router-dom";
import { LayoutDashboard, Stethoscope, Settings } from "lucide-react";
import SideHeroCard from "./SideHeroCard";
import { T } from "../constants/theme";

const NAV = [
  {
    id: "executive",
    label: "Executive",
    icon: <LayoutDashboard size={22} color={T.blue} />,
    sub: "Hospital Overview",
  },
  {
    id: "clinical",
    label: "Clinical",
    icon: <Stethoscope size={22} color={T.red} />,
    sub: "Risk & Alerts",
  },
  {
    id: "operations",
    label: "Operations",
    icon: <Settings size={22} color="#fb8c00" />,
    sub: "Beds & Workflow",
  },
];

export default function Sidebar({ time }) {
  return (
    <aside
      style={{
        width: 300,
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,

        display: "flex",
        flexDirection: "column",

        background: T.white,
        borderRight: `1px solid ${T.border}`,

        paddingTop: 28,
        paddingBottom: 20,

        boxShadow: "6px 0 28px rgba(15,23,42,0.05)",
      }}
    >
      {/* NAVIGATION */}
      <nav
        style={{
          flex: 1,
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            color: T.muted,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0 14px",
            marginBottom: 24,
          }}
        >
          Navigation
        </p>

        {NAV.map((n) => (
          <NavLink
            key={n.id}
            to={`/${n.id}`}
            style={({ isActive }) => ({
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 16,

              padding: "14px 16px",
              marginBottom: 14,

              borderRadius: 18,
              textDecoration: "none",
              position: "relative",

              background: isActive ? "#eef2ff" : "transparent",

              color: isActive ? T.blue : "#475569",

              fontWeight: isActive ? 700 : 600,
              fontSize: 14,

              transition: "all 0.25s ease",
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: -16,
                      width: 5,
                      height: 32,
                      borderRadius: "0 6px 6px 0",
                      background: T.blue,
                      boxShadow: `0 0 10px ${T.blue}55`,
                    }}
                  />
                )}

                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,

                    background: isActive
                      ? `${T.blue}15`
                      : "rgba(148,163,184,0.12)",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    flexShrink: 0,

                    transition: "0.25s ease",
                  }}
                >
                  {n.icon}
                </span>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: "inherit",
                      color: "inherit",
                    }}
                  >
                    {n.label}
                  </p>

                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: isActive ? T.blue : T.muted,
                    }}
                  >
                    {n.sub}
                  </p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* HERO CARD */}
      <div
        style={{
          padding: "0 20px",
          marginTop: 8,
          marginBottom: 24,
        }}
      >
        <SideHeroCard />
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: "auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 16,
            padding: "14px 16px",

            display: "flex",
            alignItems: "center",
            gap: 10,

            border: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: T.green,
              boxShadow: `0 0 10px ${T.green}`,
              animation: "pulse 2s infinite",
            }}
          />

          <span
            style={{
              color: T.blue,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            LIVE
          </span>

          <span
            style={{
              color: "#475569",
              fontSize: 12,
              marginLeft: "auto",
              fontFamily: "monospace",
            }}
          >
            {time.toLocaleTimeString()}
          </span>
        </div>

        <p
          style={{
            color: T.muted,
            fontSize: 10,
            textAlign: "center",
            marginTop: 14,
            letterSpacing: "0.04em",
          }}
        >
          iSHMS v1.0 · {new Date().toLocaleDateString()}
        </p>
      </div>
    </aside>
  );
}