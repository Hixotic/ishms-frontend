import { useState, useEffect } from "react";
import { Users, HeartPulse, Activity, Bell, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, SectionTitle, Badge } from "../components/ui";
import { analyticsService } from "../api/services/index";
import { kpiData, activityFeed, quickStatus, alerts as mockAlerts } from "../data/mockData";

const dotColors = { green:"bg-success", blue:"bg-accent", red:"bg-danger", amber:"bg-warning" };

function Skeleton({ className="" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

function KPICard({ icon: Icon, iconBg, label, value, badge, badgeVariant, loading }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} />
        </div>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      {loading
        ? <Skeleton className="h-9 w-20 mb-1" />
        : <div className="font-manrope text-[32px] font-extrabold text-txt-primary leading-none">{value}</div>}
      <div className="text-[12px] text-txt-secondary font-medium mt-1.5">{label}</div>
    </Card>
  );
}

// Normalise API alert → shape our UI expects
function normaliseAlert(a) {
  return {
    id:       a.id ?? a.alertId,
    type:     a.type ?? a.alertType ?? a.title ?? "Alert",
    room:     a.room ?? a.bedNumber ?? a.location ?? "—",
    patient:  a.patientName ?? a.patient ?? "—",
    detail:   a.detail ?? a.message ?? a.description ?? "",
    severity: (a.severity ?? a.level ?? "info").toLowerCase(),
    time:     a.time ?? a.createdAt ?? "",
    resolved: a.isRead ?? a.resolved ?? false,
  };
}

// Normalise API summary → KPI shape (falls back to mock data when API is unavailable)
function normaliseKPIs(data) {
  if (!data) {
    return {
      totalPatients:    kpiData.totalPatients,
      criticalPatients: kpiData.criticalPatients,
      activeStaff:      kpiData.activeStaff,
      pendingAlerts:    kpiData.pendingAlerts,
      stableRooms:      quickStatus.stableRooms,
      highRiskRooms:    quickStatus.highRiskRooms,
      pendingISBAR:     quickStatus.pendingISBAR,
    };
  }
  return {
    totalPatients:   data.totalPatients   ?? data.patientCount   ?? kpiData.totalPatients,
    criticalPatients:data.criticalPatients?? data.criticalCount  ?? kpiData.criticalPatients,
    activeStaff:     data.activeStaff     ?? data.staffOnDuty    ?? kpiData.activeStaff,
    pendingAlerts:   data.pendingAlerts   ?? data.alertCount     ?? kpiData.pendingAlerts,
    stableRooms:     data.stableRooms     ?? data.stableBeds     ?? quickStatus.stableRooms,
    highRiskRooms:   data.highRiskRooms   ?? data.criticalBeds   ?? quickStatus.highRiskRooms,
    pendingISBAR:    data.pendingISBAR    ?? data.isbarPending   ?? quickStatus.pendingISBAR,
  };
}

export default function Dashboard() {
  const [kpis,     setKpis]     = useState(null);
  const [alerts,   setAlerts]   = useState([]);
  const [feed,     setFeed]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [lastFetch,setLastFetch]= useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summary, alertFeed] = await Promise.all([
        analyticsService.getSummary().catch(() => null),
        analyticsService.getAlertFeed(10).catch(() => null),
      ]);
      setKpis(normaliseKPIs(summary));
      if (alertFeed?.length) {
        setAlerts(alertFeed.map(normaliseAlert));
      } else {
        setAlerts(mockAlerts);
      }
      if (summary?.recentActivity) {
        setFeed(summary.recentActivity);
      } else {
        setFeed(activityFeed);
      }
      setLastFetch(new Date());
    } catch {
      setKpis(normaliseKPIs(null));
      setAlerts(mockAlerts);
      setFeed(activityFeed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const kpi      = kpis  || normaliseKPIs(null);
  const topAlerts= alerts.filter(a => !a.resolved).slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Dashboard Overview</h1>
            <p className="text-txt-secondary text-[13px] mt-0.5">
              {lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : "Loading…"}
            </p>
          </div>
          <button onClick={fetchAll} title="Refresh"
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Users}      iconBg="bg-blue-50 text-accent"  label="Total Patients"   value={kpi.totalPatients}    badge="+3 today"  badgeVariant="success" loading={loading} />
          <KPICard icon={HeartPulse} iconBg="bg-red-50 text-danger"   label="Critical Patients" value={kpi.criticalPatients} badge="↑ 2 hrs"   badgeVariant="danger"  loading={loading} />
          <KPICard icon={Activity}   iconBg="bg-green-50 text-success" label="Active Staff"      value={kpi.activeStaff}      badge="On shift"  badgeVariant="success" loading={loading} />
          <KPICard icon={Bell}       iconBg="bg-amber-50 text-warning" label="Pending Alerts"    value={kpi.pendingAlerts}    badge="urgent"    badgeVariant="warning" loading={loading} />
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <SectionTitle>Recent Activity</SectionTitle>
              <Link to="/incidents" className="text-[12px] text-accent font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </CardHeader>
            <div className="divide-y divide-slate-50">
              {loading
                ? [1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <Skeleton className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))
                : feed.map(item => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[item.type] ?? "bg-accent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-txt-primary">{item.action}</p>
                      <p className="text-[11px] text-txt-muted mt-0.5">{item.user} · {item.time}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Quick Status */}
            <Card>
              <CardHeader><SectionTitle>Quick Status</SectionTitle></CardHeader>
              <div className="grid grid-cols-3 gap-2 p-4">
                {loading
                  ? [1,2,3].map(i => <Skeleton key={i} className="h-16" />)
                  : <>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="font-manrope text-[26px] font-extrabold text-green-600">{kpi.stableRooms}</div>
                      <div className="text-[11px] font-semibold text-green-700 mt-0.5">Stable rooms</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <div className="font-manrope text-[26px] font-extrabold text-red-600">{kpi.highRiskRooms}</div>
                      <div className="text-[11px] font-semibold text-red-700 mt-0.5">High risk</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <div className="font-manrope text-[26px] font-extrabold text-amber-600">{kpi.pendingISBAR}</div>
                      <div className="text-[11px] font-semibold text-amber-700 mt-0.5">ISBAR pending</div>
                    </div>
                  </>
                }
              </div>
            </Card>

            {/* Top Alerts */}
            <Card>
              <CardHeader>
                <SectionTitle>Top Alerts</SectionTitle>
                <Link to="/alerts" className="text-[12px] text-accent font-semibold hover:underline flex items-center gap-1">
                  See all <ArrowRight size={12} />
                </Link>
              </CardHeader>
              <div className="p-3 flex flex-col gap-2">
                {loading
                  ? [1,2,3].map(i => <Skeleton key={i} className="h-10" />)
                  : topAlerts.map(a => {
                    const styles = { critical:"bg-red-50 text-red-700", warning:"bg-amber-50 text-amber-700", info:"bg-blue-50 text-blue-700" };
                    return (
                      <div key={a.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${styles[a.severity] ?? styles.info}`}>
                        <span className="text-[12px] font-semibold">{a.type} — {a.room}</span>
                        <span className="text-[10px] font-medium capitalize">{a.severity}</span>
                      </div>
                    );
                  })
                }
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
