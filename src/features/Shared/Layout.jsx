import React, {
  useState,
  createContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Search,
  UserPlus,
  LayoutGrid,
  DoorOpen,
  AlertCircle,
  ChevronRight,
  Sun,
  Moon,
  ChartBar,
} from "lucide-react";
import { useTheme } from "../Shared/ThemeContext";
import { useAuth } from "../Auth/AuthProvider";
import PatientDetailsModal from "../Reception/components/PatientDetailsModal";
import { useData } from "./IContext";
import { formatPatientId } from "../APIS/Handler";
import SignalRNotifications from "./SignalRNotifications";

export const SearchContext = createContext();

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

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

  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { theme, toggleTheme } = useTheme();
  const headerRef = useRef(null);

  // Safely handle potential undefined roles
  const role = auth.user?.role?.toLowerCase() || "";

  // Responsive Layout Handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else if (window.innerWidth >= 1024) setSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on mobile route change
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handlePatientSelect = (patient) => {
    // Hide dropdown and clear search immediately
    setShowDropdown(false);
    setSearchTerm("");

    if (isReceptionist) {
      setSelectedPatient(patient);
      setShowPatientModal(true);
    } else {
      navigate(`/patients/${patient.id}`);
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const clearSearch = () => {
    setSearchTerm("");
    setShowDropdown(false);
  };

  // Memoized Navigation Items
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
        label: "Alerts Panel",
        icon: <AlertCircle size={18} />,
        section: "Information",
      },
      {
        to: "/TasksPage",
        label: "Tasks Panel",
        icon: <ClipboardList size={18} />,
        section: "Information",
      },
      {
        /* {
        to: "/executive",
        label: "Analytics",
        icon: <ChartBar size={18} />,
        section: "Analysis",
      },*/
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
        /* {
        to: "/executive",
        label: "Analytics",
        icon: <ChartBar size={18} />,
        section: "Analysis",
      },*/
      },
    ];

    return [...common, ...(isDoctor ? doctorItems : receptionItems)];
  }, [isDoctor]);

  const sections = [...new Set(navItems.map((item) => item.section))];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        ${sidebarOpen ? "w-64" : "w-20"} 
        bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-50
        ${isMobile ? "fixed h-screen left-0" : "relative"} 
        ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
      `}
      >
        <div
          className={`flex items-center ${sidebarOpen ? "justify-between px-6" : "justify-center px-4"} border-b border-slate-100 h-16`}
        >
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-xl font-black text-blue-600 tracking-tight leading-none">
                iSHMS
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-[0.2em]">
                {role || "Staff"} Portal
              </span>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
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

        <div className="p-4 border-t border-slate-100 bg-slate-100">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${sidebarOpen ? "bg-white shadow-sm border border-slate-100" : "justify-center"}`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg flex-shrink-0">
              {/* Safe null check for initials */}
              {auth.user?.fullName?.charAt(0) ||
                role?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {auth.user?.fullName || "User"}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {role || "Staff"}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header
          ref={headerRef}
          className="h-16 bg-white backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30"
        >
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

          {/* Search Area */}
          <div className="flex-1 max-w-md mx-4 relative group">
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Search patients by name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-12 pr-10 py-2 bg-slate-100 border-transparent border-2 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-2xl text-sm font-semibold transition-all outline-none"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {showDropdown && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredPatients?.length > 0 ? (
                  <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        // Use onMouseDown instead of onClick to bypass the onBlur timing conflict
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handlePatientSelect(p);
                        }}
                        className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group/item"
                      >
                        <div
                          className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold ${
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
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {p.name || p.fullName}
                          </p>
                          <p className="text-xs font-medium text-slate-500 truncate">
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
                      Try a different name or ID
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 overflow-hidden"
            >
              <Sun
                size={18}
                className={`absolute transition-all duration-500 text-amber-500 ${
                  theme === "light"
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-0 opacity-0"
                }`}
              />
              <Moon
                size={18}
                className={`absolute transition-all duration-500 text-indigo-400 ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </button>
            <SignalRNotifications
              headerRef={headerRef}
              onViewAll={() => navigate("/AlertsPage")}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 custom-scrollbar">
          <SearchContext.Provider
            value={{
              searchTerm,
              setSearchTerm,
              filteredPatients,
              patients,
              patientsLoading,
              alerts,
              alertsLoading,
            }}
          >
            <Outlet />
          </SearchContext.Provider>
        </div>

        {/* Updated Modal Rendering: Keeps component mounted to allow for exit animations */}
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={showPatientModal}
          onClose={() => setShowPatientModal(false)}
        />
      </main>
    </div>
  );
}

function SidebarLink({ to, label, icon, collapsed, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all group ${
        isActive
          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      } ${collapsed ? "justify-center" : "px-4"}`}
      title={collapsed ? label : ""}
    >
      <span
        className={`transition-transform group-hover:scale-110 ${
          isActive
            ? "text-blue-600"
            : "text-slate-400 group-hover:text-blue-500"
        }`}
      >
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
