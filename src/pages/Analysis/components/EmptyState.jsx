import { T, RISK_COLOR } from "../constants/theme";
export default function EmptyState({
 text = "No data"
}) {
 return (
   <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:24}}>
     <div style={{width:48,height:48,borderRadius:24,background:T.border}} />
     <span style={{color:T.muted,fontSize:14}}>{text}</span>
   </div>
 );
}