import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { patientApi } from "../lib/api";
import * as mockData from "../lib/mockData";
import PatientCard from "../components/PatientCard";
import { Search, AlertCircle, RefreshCw } from "lucide-react";

export default function NurseDashboard() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const normalizeStatus = (status = "") => {
    const normalized = String(status).trim().toLowerCase().replace(/\s+/g, "_");
    if (["stable", "critical", "needs_care"].includes(normalized))
      return normalized;
    return "unknown";
  };

  const normalizePatient = (patient) => {
    const vitals =
      patient.latestVitalSign || patient.lastVitals || patient.vitals || null;
    return {
      ...patient,
      normalizedStatus: normalizeStatus(patient.status),
      name: patient.name || patient.fullName || "Unknown Patient",
      roomNumber:
        patient.roomNumber ||
        (patient.bedId != null ? String(patient.bedId) : ""),
      lastVitals: vitals,
      vitals,
      vitalSigns: vitals ? [vitals] : [],
    };
  };

  const {
    data: patients = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      try {
        let data = await patientApi.getAllPatients();
        if (!data || data.length === 0) {
          data = [...mockData.mockPatients];
        }
        return data.map(normalizePatient);
      } catch (err) {
        console.error("Error fetching patients:", err);
        return mockData.mockPatients.map(normalizePatient);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const getFilteredPatients = () => {
    let filtered = patients;
    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.normalizedStatus === selectedStatus);
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.fullName && p.fullName.toLowerCase().includes(query)) ||
          String(p.id).toLowerCase().includes(query) ||
          String(p.roomNumber).toLowerCase().includes(query) ||
          String(p.bedId).toLowerCase().includes(query),
      );
    }
    const statusOrder = { critical: 0, needs_care: 1, stable: 2, unknown: 3 };
    filtered.sort((a, b) => {
      const orderA = statusOrder[a.normalizedStatus] ?? 4;
      const orderB = statusOrder[b.normalizedStatus] ?? 4;
      return orderA - orderB;
    });
    return filtered;
  };

  const filteredPatients = getFilteredPatients();
  const stableCount = patients.filter(
    (p) => p.normalizedStatus === "stable",
  ).length;
  const criticalCount = patients.filter(
    (p) => p.normalizedStatus === "critical",
  ).length;
  const needsCareCount = patients.filter(
    (p) => p.normalizedStatus === "needs_care",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle
              className="text-amber-600 dark:text-amber-400"
              size={20}
            />
            <p className="text-amber-800 dark:text-amber-200">
              Failed to load live patient data. Showing cached/mock data.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border-l-4 border-status-stable">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Stable Patients
                </p>
                <p className="text-3xl font-bold text-status-stable">
                  {stableCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-status-stable/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-status-stable">✓</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-sm border-l-4 border-status-critical">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Critical Cases
                </p>
                <p className="text-3xl font-bold text-status-critical">
                  {criticalCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-status-critical/10 rounded-xl flex items-center justify-center animate-pulse">
                <span className="text-2xl text-status-critical">!</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-sm border-l-4 border-status-needs-care">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Needs Care
                </p>
                <p className="text-3xl font-bold text-status-needs-care">
                  {needsCareCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-status-needs-care/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-status-needs-care">⚠</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm mb-8 border border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="text"
                placeholder="Search patient by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {["all", "stable", "critical", "needs_care"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-6 py-2.5 rounded-2xl font-semibold transition-all duration-200 ${
                    selectedStatus === status
                      ? status === "all"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : `bg-status-${status} text-white shadow-lg shadow-status-${status}/20`
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {status === "needs_care"
                    ? "Needs Care"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <button
                onClick={() => refetch()}
                className={`p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all ${isFetching ? "animate-spin" : ""}`}
                title="Refresh data"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground mt-4 font-medium">
              Loading patients...
            </p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/nurse/patient/${patient.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground text-lg font-medium">
              No results found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
