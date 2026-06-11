import Doctor from "../assets/Doctor.png";
import DoctorClinical from "../assets/medicines.png";
import DoctorOperations from "../assets/Doctorwithbed.png";
import logo from "../assets/logo.png";
import { useLocation } from 'react-router-dom';
import { T, RISK_COLOR } from "../constants/theme";
export default function SideHeroCard() {
  const location = useLocation(); 
let dashboardTitle = "Analysis Dashboard"; 
  if (location.pathname === '/executive') dashboardTitle = "Executive Dashboard";
  if (location.pathname === '/clinical') dashboardTitle = "Clinical Dashboard";
  if (location.pathname === '/operations') dashboardTitle = "Operations Dashboard";
let activeDoctor = Doctor; 
if (location.pathname === '/clinical') activeDoctor = DoctorClinical;
if (location.pathname === '/operations') activeDoctor = DoctorOperations;
  return (
    <div style={{
      background: "linear-gradient(180deg,#008cff 0%,#1aa7ff 55%,#53d4ff 100%)",
      borderRadius: 30,
      padding: "28px 24px 0",
      overflow: "hidden",
      position: "relative",
      minHeight: 500,
      display: "flex",
      flexDirection: "column"
    }}>

      {/* LOGO */}
      <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "Right", 
  marginBottom: 20
       }}>
  <img
    src={logo}
    alt="logo"
    style={{
      width: 200, 
      height: 120,
      objectFit: "contain"
    }}
      />

        <div style={{
          width: 45,
          height: 45,
          borderRadius: 14,
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 22,
          backdropFilter: "blur(10px)"
        }}>
        
        </div>
      </div>

      {/* TITLE */}
     <div style={{ zIndex: 2, textAlign: "center",marginTop: "-20px", marginBottom: "20px" }}> 
  <h1 style={{
    color: "#fff",
    fontSize: 42,
    fontWeight: 900,
    lineHeight: 1.05,
    marginBottom: 6
  }}>
          Hospital
        </h1>

        <p style={{
          color:"#fff",
          fontSize:22,
          fontWeight:700,
          opacity:0.95
        }}>
           {dashboardTitle}
        </p>
      </div>

      {/* IMAGE */}
      <img
        src={activeDoctor}
        alt="Doctor"
        style={{
          position:"absolute",
          bottom:0,
          left:"50%",
          transform:"translateX(-50%)",
          width:"88%",
          objectFit:"contain",
          zIndex:1
        }}
      />

      {/* DECOR */}
      <div style={{
        position:"absolute",
        width:180,
        height:180,
        borderRadius:"50%",
        background:"rgba(255,255,255,0.12)",
        bottom:-70,
        right:-50
      }} />

      <div style={{
        position:"absolute",
        width:120,
        height:120,
        borderRadius:"50%",
        background:"rgba(255,255,255,0.08)",
        top:120,
        left:-40
      }} />
    </div>
  );
}