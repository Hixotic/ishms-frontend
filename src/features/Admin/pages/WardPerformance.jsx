import { Card, CardHeader, SectionTitle, Table, TableRow, TableCell } from "../components/ui";
import { wardPerformance } from "../data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, AlertTriangle, Clock, CheckSquare } from "lucide-react";

export default function WardPerformance() {
  const { totalPatients, criticalCases, avgResponseTime, completedTasks, nursePerformance, weeklyChart } = wardPerformance;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Ward Performance</h1>
        <p className="text-txt-secondary text-[13px] mt-0.5">Ward A operational overview — this week</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, bg: "bg-blue-50 text-accent", label: "Total Patients", value: totalPatients },
          { icon: AlertTriangle, bg: "bg-red-50 text-danger", label: "Critical Cases", value: criticalCases },
          { icon: Clock, bg: "bg-amber-50 text-warning", label: "Avg Response Time", value: avgResponseTime },
          { icon: CheckSquare, bg: "bg-green-50 text-success", label: "Completed Tasks", value: completedTasks },
        ].map(k => (
          <Card key={k.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.bg}`}><k.icon size={18} /></div>
            <div className="font-manrope text-[28px] font-extrabold text-txt-primary leading-none">{k.value}</div>
            <div className="text-[12px] text-txt-muted font-medium mt-1">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader><SectionTitle>Weekly Admissions vs Discharges</SectionTitle></CardHeader>
        <div className="p-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChart} barGap={4} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", fontSize: 13 }} />
              <Bar dataKey="admitted" name="Admitted" fill="#2563EB" radius={[6,6,0,0]} />
              <Bar dataKey="discharged" name="Discharged" fill="#22C55E" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Nurse Performance */}
      <Card>
        <CardHeader><SectionTitle>Nurse Performance</SectionTitle></CardHeader>
        <Table headers={["Nurse", "Assigned Patients", "Completed Tasks", "Pending Tasks", "Completion Rate"]}>
          {nursePerformance.map(n => {
            const total = n.completed + n.pending;
            const rate = Math.round((n.completed / total) * 100);
            return (
              <TableRow key={n.name}>
                <TableCell><span className="font-medium text-txt-primary">{n.name}</span></TableCell>
                <TableCell><span className="font-semibold text-accent">{n.assigned}</span></TableCell>
                <TableCell><span className="font-semibold text-success">{n.completed}</span></TableCell>
                <TableCell><span className="font-semibold text-warning">{n.pending}</span></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-[12px] font-semibold text-txt-primary">{rate}%</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
