import { useState } from "react";
import { Card, CardHeader, SectionTitle, Badge, Table, TableRow, TableCell, Select } from "../components/ui";
import { incidents } from "../data/mockData";
import { Filter } from "lucide-react";

export default function IncidentLogs() {
  const [severity, setSeverity] = useState("all");
  const [dept, setDept] = useState("all");

  const filtered = incidents.filter(i => {
    const matchSev = severity === "all" || i.status === severity;
    const matchDept = dept === "all" || i.dept === dept;
    return matchSev && matchDept;
  });

  const departments = ["all", ...new Set(incidents.map(i => i.dept))];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Incident Logs</h1>
        <p className="text-txt-secondary text-[13px] mt-0.5">{incidents.length} total incidents recorded</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Critical", value: incidents.filter(i => i.status === "critical").length, cls: "bg-red-50", textCls: "text-danger" },
          { label: "Pending", value: incidents.filter(i => i.status === "pending").length, cls: "bg-amber-50", textCls: "text-warning" },
          { label: "Resolved", value: incidents.filter(i => i.status === "resolved").length, cls: "bg-green-50", textCls: "text-success" },
        ].map(k => (
          <div key={k.label} className={`${k.cls} rounded-2xl p-4 text-center`}>
            <div className={`font-manrope text-[28px] font-extrabold ${k.textCls}`}>{k.value}</div>
            <div className="text-[12px] font-semibold text-txt-secondary mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <SectionTitle>All Incidents</SectionTitle>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-txt-muted" />
            <Select value={severity} onChange={setSeverity}
              options={["all","critical","pending","resolved"].map(s => ({ value: s, label: s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1) }))}
              className="w-36"
            />
            <Select value={dept} onChange={setDept}
              options={departments.map(d => ({ value: d, label: d === "all" ? "All Departments" : d }))}
              className="w-36"
            />
          </div>
        </CardHeader>

        <Table headers={["Timestamp", "Incident", "Staff", "Department", "Status"]}>
          {filtered.map(inc => (
            <TableRow key={inc.id}>
              <TableCell><span className="text-txt-muted text-[12px]">{inc.timestamp}</span></TableCell>
              <TableCell><span className="font-medium text-txt-primary">{inc.incident}</span></TableCell>
              <TableCell><span className="text-txt-secondary">{inc.staff}</span></TableCell>
              <TableCell><span className="text-txt-secondary">{inc.dept}</span></TableCell>
              <TableCell><Badge variant={inc.status}>{inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}</Badge></TableCell>
            </TableRow>
          ))}
        </Table>

        {filtered.length === 0 && (
          <div className="py-10 text-center text-txt-muted text-[13px]">No incidents match your filters.</div>
        )}
      </Card>
    </div>
  );
}
