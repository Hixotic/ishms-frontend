import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "../Auth/AuthProvider";
import { getPatients, getAlertsByRole } from "../APIS/apiHandler";

const IContext = createContext(undefined);

export function IProvider({ children }) {
  const auth = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const role = auth.user?.role?.toLowerCase() || "receptionist";
  const isDoctor = role === "doctor";
  const isReceptionist = role === "receptionist";

  const fetchData = async () => {
    try {
      setPatientsLoading(true);
      setAlertsLoading(true);

      const [patientsRes, alertsRes] = await Promise.all([
        getPatients(),
        getAlertsByRole(role),
      ]);

      setPatients(
        (patientsRes.data || []).filter((p) => p.flowStatus !== "Discharged"),
      );
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch hospital data:", error);
      setPatients([]);
      setAlerts([]);
    } finally {
      setPatientsLoading(false);
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  // ─── SignalR event handler ─────────────────────────────────────────────────

  /**
   * patchPatient
   *
   * Merges a partial fields object into the matching patient entry in the list.
   * Zero API calls — instant, no flicker.
   * The full patient profile page handles its own fetch when opened.
   */
  const patchPatient = useCallback((patientId, fields) => {
    if (!patientId) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, ...fields } : p)),
    );
  }, []);

  /**
   * handleSignalREvent
   *
   * Dispatcher passed to <SignalRProvider onEvent={handleSignalREvent}>.
   * Each case patches only the fields the payload actually carries —
   * everything else on the patient object is left untouched.
   *
   * ReceiveStatusUpdate  → patch flowStatus (+ remove if Discharged)
   * ReceiveNewsUpdate    → patch newsScore and status
   * ReceiveTask          → no list-level field to patch; tasks live on the profile page
   * ReceiveAlert         → notification handled by useSignalR; nothing to patch here
   * ReceiveMedicalReport → commented out, no use yet
   */
  const handleSignalREvent = useCallback(
    (eventName, data) => {
      const id = data?.patientId;

      switch (eventName) {
        case "ReceiveStatusUpdate": {
          const { newStatus } = data ?? {};
          if (!newStatus) break;
          if (newStatus === "Discharged") {
            // Remove discharged patients from the list entirely.
            setPatients((prev) => prev.filter((p) => p.id !== id));
          } else {
            patchPatient(id, { flowStatus: newStatus });
          }
          break;
        }

        case "ReceiveNewsUpdate": {
          const { newsScore, status } = data ?? {};
          // Only patch the fields that are present in the payload.
          const patch = {};
          if (newsScore !== undefined) patch.newsScore = newsScore;
          if (status !== undefined) patch.status = status;
          patchPatient(id, patch);
          break;
        }

        case "ReceiveTask":
          // Tasks are fetched fresh when the profile page opens — nothing to patch
          // at the list level since the patient card doesn't show task details.
          break;

        case "ReceiveAlert":
          // Notification already stored by useSignalR. Nothing to patch in the list.
          break;

        // ReceiveMedicalReport — no use yet, wired for later.
        // case "ReceiveMedicalReport":
        //   break;

        default:
          break;
      }
    },
    [patchPatient],
  );

  // ─── Derived / helper selectors ────────────────────────────────────────────

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return patients
      .filter((p) => {
        const name = (p.name || p.fullName || "").toLowerCase();
        const Pid = (p.patientId || "").toLowerCase();
        return name.includes(term) || Pid.includes(term);
      })
      .slice(0, 5);
  }, [searchTerm, patients]);

  const getPatientsByStatus = (status) => {
    if (status === "All") return patients;
    return patients.filter((p) => p.status === status);
  };

  const getPatientById = (patientId) =>
    patients.find((p) => p.id === patientId);

  const getAlertsByType = (type) => alerts.filter((a) => a.type === type);

  const getLatestAlerts = (count = 5) => alerts.slice(0, count);

  const contextValue = {
    // Search
    searchTerm,
    setSearchTerm,
    filteredPatients,

    // Patients
    patients,
    patientsLoading,
    getPatientById,
    getPatientsByStatus,

    // Alerts
    alerts,
    alertsLoading,
    getAlertsByType,
    getLatestAlerts,

    // User info
    userRole: role,
    isDoctor,
    isReceptionist,

    // Refresh (full re-fetch — use sparingly)
    refreshData: fetchData,

    // SignalR dispatcher — pass to <SignalRProvider onEvent={handleSignalREvent}>
    handleSignalREvent,
  };

  return <IContext.Provider value={contextValue}>{children}</IContext.Provider>;
}

/**
 * Custom Hook: useData
 *
 * Examples:
 *
 * 1. Get all patients:
 *    const { patients, patientsLoading } = useData();
 *
 * 2. Get specific patient:
 *    const { getPatientById } = useData();
 *    const patient = getPatientById('patient-123');
 *
 * 3. Get alerts:
 *    const { alerts, getLatestAlerts } = useData();
 *    const latest5 = getLatestAlerts(5);
 *
 * 4. Check user role:
 *    const { isDoctor, isReceptionist } = useData();
 *
 * 5. Use search:
 *    const { searchTerm, setSearchTerm, filteredPatients } = useData();
 *
 * 6. Refresh all data manually:
 *    const { refreshData } = useData();
 *    await refreshData();
 */
export const useData = () => {
  const ctx = useContext(IContext);
  if (!ctx) {
    return { patients: [], isReceptionist: false, isDoctor: false };
  }
  return ctx;
};

export default IContext;
