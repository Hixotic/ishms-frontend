import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Grid3X3,
  AlertTriangle,
  Users,
  ClipboardList,
  UserPlus,
  Shield,
  Settings,
  BarChart2,
  FileText,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  CheckCircle2,
  Activity,
  Bed,
} from "lucide-react";
import { useState } from "react";

// ─── Nav definitions (paths fixed to match your app's route structure) ────────
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Ward Heatmap", icon: Grid3X3, path: "/admin/heatmap" },
  { label: "Clinical Alerts", icon: AlertTriangle, path: "/admin/alerts" },
  { label: "Staff Activity", icon: Users, path: "/admin/staff" },
  { label: "Incident Logs", icon: ClipboardList, path: "/admin/incidents" },
];

const adminItems = [
  { label: "User Management", icon: UserPlus, path: "/admin/users" },
  { label: "Roles & Permissions", icon: Shield, path: "/admin/roles" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const hodItems = [
  {
    label: "Ward Performance",
    icon: BarChart2,
    path: "/admin/ward-performance",
  },
  { label: "ISBAR Reviews", icon: FileText, path: "/admin/isbar" },
];

// ─── Single nav item ──────────────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  const { pathname } = useLocation();
  const active = pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : ""}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150
        ${
          active
            ? "bg-blue-50 text-accent"
            : "text-txt-secondary hover:bg-surf hover:text-txt-primary"
        }`}
    >
      <Icon size={17} className="flex-shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, setCollapsed, user }) {
  return (
    <aside
      className={`${collapsed ? "w-14" : "w-[220px]"} flex-shrink-0 bg-card border-r border-slate-100 flex flex-col py-4 transition-all duration-200 overflow-hidden`}
    >
      {/* Logo + collapse toggle */}
      <div className="px-3 mb-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="./icons.png" alt="iSHMS logo" className="w-10" />
            <span className="font-manrope font-extrabold text-accent text-[17px]">
              iSHMS
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-muted hover:bg-surf transition-colors ml-auto"
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest px-2 pt-1 pb-1.5">
            Main
          </p>
        )}
        {navItems.map((i) => (
          <NavItem key={i.path} item={i} collapsed={collapsed} />
        ))}

        {/* Admin-only section */}
        {user?.role?.toLowerCase() === "admin" && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest px-2 pt-4 pb-1.5">
                Admin
              </p>
            )}
            {collapsed && <div className="h-3" />}
            {adminItems.map((i) => (
              <NavItem key={i.path} item={i} collapsed={collapsed} />
            ))}
          </>
        )}

        {/* HOD-only section */}
        {user?.role?.toLowerCase() === "hod" && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest px-2 pt-4 pb-1.5">
                HOD
              </p>
            )}
            {collapsed && <div className="h-3" />}
            {hodItems.map((i) => (
              <NavItem key={i.path} item={i} collapsed={collapsed} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const [dropOpen, setDropOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // ── notifications (empty for now — wire up your real data here) ──
  const notifications = [];
  const unreadCount = 0;
  const criticalCount = 0;
  const warningCount = 0;

  const getFiltered = () => {
    if (filterTab === "critical")
      return notifications.filter((n) => n.type === "red");
    if (filterTab === "warning")
      return notifications.filter((n) => n.type === "amber");
    if (filterTab === "system")
      return notifications.filter(
        (n) => n.type === "green" || n.type === "blue",
      );
    return notifications;
  };

  const filteredActivity = getFiltered();

  const badgeStyle = (type) =>
    ({
      red: {
        bg: "bg-red-50",
        border: "border-l-red-500",
        badge: "bg-red-100 text-red-700",
      },
      amber: {
        bg: "bg-amber-50",
        border: "border-l-amber-500",
        badge: "bg-amber-100 text-amber-700",
      },
      green: {
        bg: "bg-green-50",
        border: "border-l-green-500",
        badge: "bg-green-100 text-green-700",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-l-blue-500",
        badge: "bg-blue-100 text-blue-700",
      },
    })[type] ?? {
      bg: "bg-blue-50",
      border: "border-l-blue-500",
      badge: "bg-blue-100 text-blue-700",
    };

  return (
    <>
      {/* Click-outside backdrops */}
      {alertsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAlertsOpen(false)}
        />
      )}
      {dropOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropOpen(false)}
        />
      )}

      <header className="h-16 bg-card border-b border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.05)] flex items-center px-5 gap-4 sticky top-0 z-50 flex-shrink-0">
        {/* ── Search ── */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search patients, staff, rooms…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-surf text-[13px] text-txt-primary outline-none focus:border-accent focus:bg-white transition-colors"
          />

          {/* Empty state */}
          {searchOpen && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-slate-100 shadow-lg p-6 text-center z-50">
              <p className="text-[13px] text-txt-muted">
                No patients or staff found
              </p>
            </div>
          )}

          {/* Search backdrop */}
          {searchOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setSearchOpen(false);
                setSearchTerm("");
              }}
            />
          )}
        </div>

        {/* ── Right side controls ── */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="relative w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-secondary hover:bg-surf transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-card rounded-xl border border-slate-100 shadow-lg overflow-hidden z-50 flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-accent" />
                      <span className="text-sm font-bold text-txt-primary">
                        Notifications
                      </span>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 overflow-x-auto">
                    {[
                      { id: "all", label: "All", count: 0 },
                      {
                        id: "critical",
                        label: "Critical",
                        count: criticalCount,
                      },
                      { id: "warning", label: "Warnings", count: warningCount },
                      { id: "system", label: "System", count: 0 },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterTab(tab.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                          filterTab === tab.id
                            ? "bg-accent text-white"
                            : "bg-white text-txt-secondary hover:text-txt-primary border border-slate-200"
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="ml-1 font-bold">({tab.count})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feed */}
                <div className="overflow-y-auto flex-1">
                  {filteredActivity.length > 0 ? (
                    filteredActivity.map((n) => {
                      const s = badgeStyle(n.type);
                      return (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-slate-50 last:border-b-0 ${s.bg} border-l-4 ${s.border}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-txt-primary flex-1">
                              {n.action}
                            </p>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${s.badge}`}
                            >
                              {n.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-txt-secondary font-medium">
                              {n.user}
                            </p>
                            <p className="text-xs text-txt-muted">{n.time}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <CheckCircle2
                        size={24}
                        className="mx-auto text-green-500 mb-2"
                      />
                      <p className="text-sm font-medium text-txt-primary">
                        No notifications
                      </p>
                      <p className="text-xs text-txt-muted mt-1">
                        {filterTab === "all"
                          ? "Dashboard is quiet"
                          : `No ${filterTab} notifications`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings shortcut */}
          <button
            onClick={() => navigate("/admin/settings")}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-txt-secondary hover:bg-surf transition-colors"
          >
            <Settings size={16} />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropOpen(!dropOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-surf transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-xs font-manrope">
                {user?.initials ?? "?"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-txt-primary leading-tight">
                  {user?.name ?? "User"}
                </p>
                <p className="text-[11px] text-txt-muted capitalize">
                  {user?.role ?? ""}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-txt-muted transition-transform ${dropOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-xl border border-slate-100 shadow-card-hover overflow-hidden z-50">
                <button
                  onClick={() => {
                    navigate("/admin/settings");
                    setDropOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-txt-primary hover:bg-surf transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setDropOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-danger hover:bg-red-50 border-t border-slate-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
