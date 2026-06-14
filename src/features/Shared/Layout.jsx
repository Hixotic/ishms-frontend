import React, { useState, createContext, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  UserPlus,
  LayoutGrid,
  DoorOpen,
  AlertCircle,
  ChartBar,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../Auth/AuthProvider";
import PatientDetailsModal from "../Reception/components/PatientDetailsModal";
import { useData } from "./IContext";
import { formatPatientId } from "../APIS/Handler";

// SEARCH CONTEXT: Contains all patient and alert data shared across the layout and child pages
// Use this in any child component to avoid re-fetching data
export const SearchContext = createContext();

export default function MainLayout() {
  const [fullWidth, setFullWidth] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  // Get all hospital data from context (patients, alerts, etc.)
  const {
    searchTerm,
    setSearchTerm,
    filteredPatients,
    patients,
    patientsLoading,
    alerts,
    alertsLoading,
    isDoctor,
    isReceptionist,
  } = useData();

  // Local UI states
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const role = auth.user?.role?.toLowerCase();

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePatientSelect = (patient) => {
    setSearchTerm("");
    setShowDropdown(false);
    if (isReceptionist) {
      setSelectedPatient(patient);
      setShowPatientModal(true);
    } else {
      navigate(`/patients/${patient.id}`);
    }
  };

  // UI Handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotif = () => setNotifOpen(!notifOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifOpen &&
        !e.target.closest(".notif-panel") &&
        !e.target.closest(".notif-btn")
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Navigation Items Config
  const navItems = useMemo(() => {
    const common = [
      {
        to: "/",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        section: "Overview",
      },
    ];

    const receptionItems = [
      {
        to: "/admission",
        label: "New Admission",
        icon: <UserPlus size={18} />,
        section: "Operations",
      },
      {
        to: "/beds",
        label: "Bed Management",
        icon: <LayoutGrid size={18} />,
        section: "Operations",
      },
      {
        to: "/discharge",
        label: "Discharge Monitor",
        icon: <DoorOpen size={18} />,
        section: "Operations",
      },
      {
        to: "/AlertsPage",
        label: "Alerts",
        icon: <AlertCircle size={18} />,
        section: "Information",
      },
      {
        to: "/executive",
        label: "Analytics",
        icon: <ChartBar size={18} />,
        section: "Information",
      },
    ];

    const doctorItems = [
      {
        to: "/TasksPage",
        label: "Tasks Panel",
        icon: <ClipboardList size={18} />,
        section: "Operations",
      },
      {
        to: "/AlertsPage",
        label: "Alerts Panel",
        icon: <AlertCircle size={18} />,
        section: "Operations",
      },
      {
        to: "/executive",
        label: "Analytics",
        icon: <BarChart3 size={18} />,
        section: "Information",
      },
    ];

    return [...common, ...(isDoctor ? doctorItems : receptionItems)];
  }, [isDoctor]);

  const sections = [...new Set(navItems.map((item) => item.section))];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-slate-900">
      {/* MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        ${sidebarOpen ? "w-64" : "w-20"} 
        bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-50
        ${isMobile ? "fixed h-screen left-0" : "relative"} 
        ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
      `}
      >
        {/* LOGO */}
        <div
          className={`flex items-center justify-between border-b border-slate-100 h-20 ${sidebarOpen ? "px-6" : "px-4"}`}
        >
          {sidebarOpen ? (
            <div className="flex flex-col">
              <span className="text-2xl font-black text-blue-600 tracking-tight leading-none">
                iSHMS
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">
                {role} Portal
              </span>
            </div>
          ) : (
            /* HIDDEN LOGO WHEN CLOSED: Removed the "iS" text as requested */
            <div className="w-full flex justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            </div>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
          {sections.map((section) => (
            <div key={section} className="space-y-1">
              {sidebarOpen && (
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                  {section}
                </h3>
              )}
              {navItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <SidebarLink
                    key={item.to}
                    {...item}
                    collapsed={!sidebarOpen}
                    isActive={location.pathname === item.to}
                  />
                ))}
            </div>
          ))}
        </nav>

        {/* USER PROFILE */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${sidebarOpen ? "bg-white shadow-sm border border-slate-100" : "justify-center"}`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg flex-shrink-0">
              {auth.user?.fullName?.charAt(0) || role.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {auth.user?.fullName || "User"}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {role}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => auth.logout()}
            className={`mt-3 flex items-center gap-3 w-full p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm ${sidebarOpen ? "px-4" : "justify-center"}`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
              {navItems.find((i) => i.to === location.pathname)?.label ||
                "Dashboard"}
            </h1>
          </div>

          {/* SEARCH */}
          <div className="flex-1 max-w-md mx-4 relative group">
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Search patients by name or patient Id..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-transparent border-2 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm font-semibold transition-all outline-none"
              />
            </div>

            {/* SEARCH RESULTS */}
            {showDropdown && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredPatients.length > 0 ? (
                  <div className="p-2">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePatientSelect(p)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            p.status === "Critical"
                              ? "bg-red-500"
                              : p.status === "Unstable"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        >
                          {p.name?.charAt(0) || "P"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">
                            {p.name || p.fullName}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {formatPatientId(p.id)} •{" "}
                            {p.bedId || p.bed || "No Bed"}
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover/item:text-blue-600 transition-transform group-hover/item:translate-x-1"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      No patients found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try a different name or patient Id
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={toggleNotif}
                className={`notif-btn w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                  notifOpen
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <Bell size={20} />
                {alerts.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </button>

              {/* NOTIFICATION PANEL */}
              {notifOpen && (
                <div className="notif-panel absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase">
                      {alerts.length} New
                    </span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                    {alertsLoading ? (
                      <div className="p-10 text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-bold text-slate-400">
                          Syncing alerts...
                        </p>
                      </div>
                    ) : alerts.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          All caught up!
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          No new alerts to show
                        </p>
                      </div>
                    ) : (
                      alerts.slice(0, 5).map((alert) => (
                        <button
                          key={alert.id || alert.alertId || Math.random()}
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(isDoctor ? "/AlertsPage" : "/alerts");
                          }}
                          className="w-full flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all text-left group/notif"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover/notif:scale-110 transition-transform">
                            <AlertCircle size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">
                              {alert.title || alert.type || "System Alert"}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {alert.message || "New notification received"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              {alert.createdAt
                                ? new Date(alert.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "Just now"}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(isDoctor ? "/AlertsPage" : "/alerts");
                    }}
                    className="w-full p-4 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 border-t border-slate-100 transition-colors"
                  >
                    View All Alerts
                  </button>
                </div>
              )}
            </div>

            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-800">
                {auth.user?.fullName?.split(" ")[0] || "User"}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                {role}
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {/* CUSTOMIZE SPACING: Adjust p-4, md:p-6 values to change padding around content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className={fullWidth ? "w-full" : "max-w-7xl mx-auto"}>
            <Outlet context={{ setFullWidth }} />
          </div>
        </div>

        {/* MODALS */}
        {isReceptionist && selectedPatient && (
          <PatientDetailsModal
            patient={selectedPatient}
            isOpen={showPatientModal}
            onClose={() => {
              setShowPatientModal(false);
              setSelectedPatient(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function SidebarLink({ to, label, icon, collapsed, isActive }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all group
        ${
          isActive
            ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }
        ${collapsed ? "justify-center" : "px-4"}
      `}
      title={collapsed ? label : ""}
    >
      <span
        className={`transition-transform group-hover:scale-110 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`}
      >
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
      {!collapsed && isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
      )}
    </Link>
  );
}
