import { useState } from "react";
import { Card, CardHeader, SectionTitle, Badge, Table, TableRow, TableCell, Modal, Button, Toast } from "../components/ui";
import { isbarReports } from "../data/mockData";
import { useToast } from "../hooks/useToast";
import { FileText, Eye, CheckCircle2 } from "lucide-react";

const sampleReport = {
  I: "Patient Omar Hassan, 71-year-old male in Room A-104. Admitted 3 days ago with pneumonia.",
  S: "Patient currently showing deteriorating respiratory function. SpO₂ dropped to 89%. NEWS2 score of 9. Increased work of breathing noted.",
  B: "Admitted with community-acquired pneumonia. On IV amoxicillin-clavulanate. History of COPD. No known allergies.",
  A: "Deteriorating respiratory status. Possible sepsis developing. Current antibiotics may be insufficient.",
  R: "Requesting urgent review by senior physician. Consider stepping up to ICU. Possible change of antibiotic regime needed.",
};

export default function ISBARReviews() {
  const [reports, setReports] = useState(isbarReports);
  const [openReport, setOpenReport] = useState(null);
  const { toasts, show, remove } = useToast();

  const markReviewed = id => {
    setReports(r => r.map(rp => rp.id === id ? { ...rp, status: "reviewed" } : rp));
    setOpenReport(null);
    show("Report marked as reviewed", "success");
  };

  const pending = reports.filter(r => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-5">
      <Toast toasts={toasts} remove={remove} />

      <div>
        <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">ISBAR Reviews</h1>
        <p className="text-txt-secondary text-[13px] mt-0.5">{pending} report{pending !== 1 ? "s" : ""} pending review</p>
      </div>

      <Card>
        <CardHeader><SectionTitle>Submitted Reports</SectionTitle></CardHeader>
        <Table headers={["Nurse", "Patient", "Room", "Submission Time", "Status", "Actions"]}>
          {reports.map(r => (
            <TableRow key={r.id}>
              <TableCell><span className="font-medium text-txt-primary">{r.nurse}</span></TableCell>
              <TableCell><span className="text-txt-secondary">{r.patient}</span></TableCell>
              <TableCell><span className="text-txt-muted">{r.room}</span></TableCell>
              <TableCell><span className="text-txt-muted text-[12px]">{r.submitted}</span></TableCell>
              <TableCell><Badge variant={r.status}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenReport(r)}>
                    <Eye size={13} /> Open
                  </Button>
                  {r.status === "pending" && (
                    <Button size="sm" variant="success" onClick={() => markReviewed(r.id)}>
                      <CheckCircle2 size={13} /> Review
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal open={!!openReport} onClose={() => setOpenReport(null)}
        title={openReport ? `ISBAR Report — ${openReport.patient}` : ""}
        footer={
          openReport && (
            <>
              <Button variant="outline" onClick={() => setOpenReport(null)}>Close</Button>
              {openReport.status === "pending" && (
                <Button variant="primary" onClick={() => markReviewed(openReport.id)}>
                  <CheckCircle2 size={14} /> Mark Reviewed
                </Button>
              )}
            </>
          )
        }
      >
        {openReport && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] text-txt-muted mb-1">
              <FileText size={13} />
              <span>Submitted by {openReport.nurse} · {openReport.submitted}</span>
            </div>
            {Object.entries(sampleReport).map(([key, text]) => {
              const labels = { I: "Identification", S: "Situation", B: "Background", A: "Assessment", R: "Recommendation" };
              return (
                <div key={key} className="bg-surf rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-lg bg-accent text-white text-[11px] font-bold flex items-center justify-center font-manrope">{key}</span>
                    <span className="text-[12px] font-bold text-txt-secondary uppercase tracking-wide">{labels[key]}</span>
                  </div>
                  <p className="text-[13px] text-txt-primary leading-relaxed">{text}</p>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
