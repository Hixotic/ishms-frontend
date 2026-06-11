import { T, RISK_COLOR } from "../constants/theme";
export default function Skeleton({h=72,r=10}) {
  return <div style={{height:h,borderRadius:r,
    background:"linear-gradient(90deg,#e8edf5 25%,#f5f7fb 50%,#e8edf5 75%)",
    backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}} />;
}
