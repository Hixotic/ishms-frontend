import React, { useState, useMemo } from "react";
import { Link, Outlet } from "react-router-dom";
import { Settings, Menu, X, Bell, Search, User, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { getAllPatients } from "../lib/mockData";
import { useAuth } from "../../Auth/AuthProvider";

export default function NurseNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();

  const patients = getAllPatients();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return patients
      .filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          (patient.roomNumber &&
            patient.roomNumber.toLowerCase().includes(query)) ||
          patient.id.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [searchQuery, patients]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handlePatientSelect = () => setSearchQuery("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground shadow-sm backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 md:py-4">
            <Link to="/nurse">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-primary/80 hover:bg-primary/5 cursor-pointer">
                <img
                  src="/icons.png"
                  alt="ISHMS Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>

            <div className="hidden md:flex min-w-[360px] flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search patients, beds, or alerts"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-2xl border border-border bg-background px-12 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-background shadow-lg z-50 overflow-hidden">
                    {searchResults.map((patient) => (
                      <Link
                        key={patient.id}
                        to={`/nurse/patient/${patient.id}`}
                        onClick={handlePatientSelect}
                      >
                        <div className="px-4 py-3 hover:bg-secondary/50 border-b border-border/50 last:border-b-0 cursor-pointer transition flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {patient.name}
                            </span>
                            <span className="text-xs text-muted-foreground">{`Room ${patient.roomNumber}`}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              patient.status === "critical"
                                ? "bg-red-100 text-red-800"
                                : patient.status === "stable"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/nurse/alerts">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/5 cursor-pointer">
                  <Bell size={18} />
                  <span>Alerts</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="hidden sm:inline-flex gap-2 rounded-2xl px-3 py-2 text-sm"
              >
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </Button>
              <button className="hidden sm:inline-flex items-center rounded-2xl border border-border bg-secondary px-3 py-2 text-muted-foreground transition hover:bg-secondary/80">
                <User size={18} />
                <span className="ml-2 text-sm font-medium">Nurse</span>
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex md:hidden items-center justify-center rounded-2xl border border-border bg-secondary p-2 text-foreground transition hover:bg-secondary/80"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button onClick={() => auth.logout()} className={"px-4"}>
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden space-y-3 rounded-3xl border border-border bg-secondary p-4 shadow-sm mb-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search patients, beds, or alerts"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-2xl border border-border bg-background px-12 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Link to="/nurse/alerts" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/5 cursor-pointer">
                  <Bell size={18} />
                  <span>Alerts</span>
                </div>
              </Link>
              <button
                onClick={() => {
                  setSettingsOpen(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/5"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Page content injected here by React Router ───────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Theme</label>
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="gap-2 rounded-2xl"
              >
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
