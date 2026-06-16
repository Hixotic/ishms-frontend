import React, { useState, useMemo } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Search, Bell, Menu, X, ChevronRight } from "lucide-react";
import { getPatients } from "../APIS/apiHandler";

export default function MainLayout() {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const patients = getPatients?.() || [];

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const q = searchTerm.toLowerCase();

    return patients
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          String(p.id).toLowerCase().includes(q) ||
          String(p.roomNumber).toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [searchTerm, patients]);

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 w-full h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 md:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="font-black text-blue-600 text-lg">iSHMS</div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* CENTER SEARCH */}
        <div className="relative hidden md:flex w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
          />

          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg overflow-hidden">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/patient/${p.id}`}
                  onClick={clearSearch}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      Room {p.roomNumber}
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* ================= MOBILE SEARCH ================= */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b p-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-10 pr-3 py-2 border rounded-xl"
            />
          </div>

          {results.length > 0 && (
            <div className="mt-2 border rounded-xl overflow-hidden">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/patient/${p.id}`}
                  onClick={() => {
                    clearSearch();
                    setMobileOpen(false);
                  }}
                  className="block px-4 py-3 hover:bg-gray-50"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    Room {p.roomNumber}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
