import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Pill, FlaskConical, Info, CheckCircle2, ArrowUpCircle, RefreshCw } from "lucide-react";
import { Card, Button, Badge, Toast } from "../components/ui";
import { alertService } from "../api/services/index";
import { alerts as mockAlerts } from "../data/mockData";
import { useToast } from "../hooks/useToast";

const severityConfig = {
  critical: { border:"border-l-danger",  iconBg:"bg-red-50 text-danger",   label:"Critical" },
  warning:  { border:"border-l-warning", iconBg:"bg-amber-50 text-warning", label:"Warning"  },
  info:     { border:"border-l-accent",  iconBg:"bg-blue-50 text-accent",   label:"Info"     },
};
const typeIcons = {
  "High NEWS2 Score":        AlertTriangle,
  "Missed Medication":       Pill,
  "Drug Interaction Warning":FlaskConical,
  "Lab Results Flagged":     Info,
};

// Map API alert → our shape
function normalise(a) {
  return {
    id:       a.id ?? a.alertId,
    type:     a.type ?? a.alertType ?? a.title ?? "Alert",
    patient:  a.patientName ?? a.patient ?? "—",
    room:     a.room ?? a.bedNumber ?? "—",
    detail:   a.detail ?? a.message ?? a.description ?? "",
    severity: (a.severity ?? a.level ?? "info").toLowerCase(),
    time:     a.time ?? a.createdAt ?? "",
    resolved: a.isRead ?? a.resolved ?? false,
  };
}

function Skeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-pulse flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 pt-1">
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
        <div className="h-2 bg-slate-100 rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

function AlertCard({ alert, onResolve, onEscalate }) {
  const cfg  = severityConfig[alert.severity] ?? severityConfig.info;
  const Icon = typeIcons[alert.type] ?? AlertTriangle;
  return (
    <Card className={`flex items-start gap-4 p-4 border-l-4 ${cfg.border} ${alert.resolved ? "opacity-50" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-txt-primary">
              {alert.type} — {alert.patient} · <span className="text-txt-muted font-medium">{alert.room}</span>
            </p>
            <p className="text-[12px] text-txt-muted mt-1">{alert.detail}</p>
          </div>
          <span className="text-[11px] text-txt-muted flex-shrink-0 mt-0.5">{alert.time}</span>
        </div>
        {!alert.resolved && (
          <div className="flex items-center gap-2 mt-3">
            {alert.severity === "critical" && (
              <Button size="sm" variant="danger" onClick={() => onEscalate(alert.id)}>
                <ArrowUpCircle size={13} /> Escalate
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onResolve(alert.id)}>
              <CheckCircle2 size={13} /> Mark Resolved
            </Button>
            <Button size="sm" variant="ghost">Review Alert</Button>
          </div>
        )}
        {alert.resolved && <div className="mt-2"><Badge variant="resolved">Resolved</Badge></div>}
      </div>
    </Card>
  );
}

export default function ClinicalAlerts() {
  const [alertList, setAlertList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const { toasts, show, remove }  = useToast();

  // Read logged-in user for role-based fetch
  const user = (() => { try { return JSON.parse(localStorage.getItem("ishms_user")); } catch { return null; } })();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (user?.role && user.role !== "admin") {
        data = await alertService.getByRole(user.role);
      } else if (user?.id) {
        data = await alertService.getByUser(user.id);
      } else {
        data = await alertService.getByRole("Admin");
      }
      const mapped = Array.isArray(data) ? data.map(normalise) : [];
      setAlertList(mapped.length ? mapped : mockAlerts);
    } catch {
      setAlertList(mockAlerts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const resolve = async (id) => {
    try { await alertService.markRead(id); } catch { /* optimistic */ }
    setAlertList(l => l.map(a => a.id === id ? { ...a, resolved: true } : a));
    show("Alert marked as resolved", "success");
  };

  const escalate = (id) => show("Alert escalated to senior staff", "error");

  const visible = alertList.filter(a => {
    if (filter === "unresolved") return !a.resolved;
    if (filter === "resolved")   return  a.resolved;
    if (filter === "critical")   return  a.severity === "critical" && !a.resolved;
    return true;
  });
  const unresolved = alertList.filter(a => !a.resolved).length;

  return (
    <div className="flex flex-col gap-5">
      <Toast toasts={toasts} remove={remove} />
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Clinical Alerts</h1>
          <p className="text-txt-secondary text-[13px] mt-0.5">{unresolved} unresolved alert{unresolved !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAlerts} title="Refresh"
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="flex gap-2 text-[12px]">
            {[["all","All"],["unresolved","Unresolved"],["critical","Critical"],["resolved","Resolved"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${filter === v ? "bg-accent text-white" : "bg-card border border-slate-200 text-txt-secondary hover:bg-surf"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} />)
          : visible.length === 0
            ? (
              <Card className="p-10 text-center">
                <CheckCircle2 size={32} className="text-success mx-auto mb-3" />
                <p className="font-semibold text-txt-primary">No alerts to show</p>
                <p className="text-[13px] text-txt-muted mt-1">All clear for this filter</p>
              </Card>
            )
            : visible.map(alert => (
              <AlertCard key={alert.id} alert={alert} onResolve={resolve} onEscalate={escalate} />
            ))
        }
      </div>
    </div>
  );
}
