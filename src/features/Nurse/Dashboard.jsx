import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Search } from "lucide-react";
import PatientCard from "./components/PatientCard";
import { getPatients } from "./APIS/apiHandler";

/* -----------------------------
   SIMPLE CARD SYSTEM (FIXES ERROR)
   ----------------------------- */
function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}

/* -----------------------------
   STATUS NORMALIZER
   ----------------------------- */
const normalizeStatus = (status = "") => {
  const normalized = String(status).trim().toLowerCase();

  if (normalized.includes("critical")) return "critical";
  if (normalized.includes("needs")) return "needs_care";
  if (normalized.includes("stable")) return "stable";

  return "unknown";
};

/* -----------------------------
   PATIENT NORMALIZER
   ----------------------------- */
const normalizePatient = (patient) => {
  const vitals = patient.latestVitalSign || null;

  return {
    ...patient,
    normalizedStatus: normalizeStatus(patient.status),
    roomNumber: patient.bedId ? String(patient.bedId) : "",
    vitals,
  };
};

/* -----------------------------
   MAIN DASHBOARD
   ----------------------------- */
export default function NurseDashboard() {
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -----------------------------
     FETCH DATA (FIXED)
     ----------------------------- */
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getPatients();

        const patientsData = Array.isArray(res) ? res : res?.data || [];

        if (!Array.isArray(patientsData)) {
          throw new Error("Invalid API response format");
        }

        const normalized = patientsData.map(normalizePatient);
        setPatients(normalized);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients. Please try again.");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  /* -----------------------------
     FILTER LOGIC
     ----------------------------- */
  const getFilteredPatients = () => {
    let filtered = [...patients];

    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.normalizedStatus === selectedStatus);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (p) =>
          (p.fullName || "").toLowerCase().includes(query) ||
          String(p.id || "")
            .toLowerCase()
            .includes(query) ||
          String(p.roomNumber || "")
            .toLowerCase()
            .includes(query) ||
          String(p.bedId || "")
            .toLowerCase()
            .includes(query),
      );
    }

    const statusOrder = {
      critical: 0,
      needs_care: 1,
      stable: 2,
      unknown: 3,
    };

    filtered.sort(
      (a, b) =>
        (statusOrder[a.normalizedStatus] ?? 4) -
        (statusOrder[b.normalizedStatus] ?? 4),
    );

    return filtered;
  };

  const getPatientsByStatus = (status) =>
    patients.filter((p) => p.normalizedStatus === status);

  const filteredPatients = getFilteredPatients();

  const stableCount = getPatientsByStatus("stable").length;
  const criticalCount = getPatientsByStatus("critical").length;
  const needsCareCount = getPatientsByStatus("needs_care").length;

  /* -----------------------------
     UI
     ----------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Patient Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage patient status across all wards
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <Card className="p-4 mb-6 flex items-center gap-3 bg-amber-50 border-amber-200">
            <AlertCircle className="text-amber-600" size={20} />
            <p className="text-amber-800">{error}</p>
          </Card>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-l-4 border-green-500">
            <p className="text-sm text-muted-foreground">Stable Patients</p>
            <p className="text-3xl font-bold text-green-600">{stableCount}</p>
          </Card>

          <Card className="p-6 border-l-4 border-red-500">
            <p className="text-sm text-muted-foreground">Critical Cases</p>
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          </Card>

          <Card className="p-6 border-l-4 border-amber-500">
            <p className="text-sm text-muted-foreground">Needs Care</p>
            <p className="text-3xl font-bold text-amber-600">
              {needsCareCount}
            </p>
          </Card>
        </div>

        {/* SEARCH + FILTER */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute right-3 top-3 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Search patient by name, ID, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {["all", "stable", "critical", "needs_care"].map((status) => {
                const active = selectedStatus === status;

                const styles = {
                  all: "bg-blue-600 text-white",
                  stable: "bg-green-600 text-white",
                  critical: "bg-red-600 text-white animate-pulse",
                  needs_care: "bg-amber-600 text-white",
                };

                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-xl font-semibold ${
                      active ? styles[status] : "bg-white border"
                    }`}
                  >
                    {status === "needs_care"
                      ? "Needs Care"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">Loading patients...</p>
          </div>
        )}

        {/* GRID */}
        {!loading && filteredPatients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/nurse/patient/${patient.id}`)}
              />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}
