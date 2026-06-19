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
   * Merges partial fields into the matching patient in the list by p.id.
   * Zero API calls — instant in-memory update.
   * Patient shape reference: { id, fullName, status, newsScore, flowStatus, ... }
   */
  const patchPatient = useCallback((patientId, fields) => {
    if (patientId == null) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, ...fields } : p)),
    );
  }, []);

  /**
   * handleSignalREvent
   *
   * Dispatcher passed to <SignalRProvider onEvent={handleSignalREvent}>.
   * Patches only the exact fields each payload carries against the confirmed
   * patient shape — p.id, p.flowStatus, p.newsScore, p.status.
   *
   * ReceiveStatusUpdate  → patch flowStatus (remove patient if "Discharged")
   * ReceiveNewsUpdate    → patch newsScore and/or status
   * ReceiveTask          → nothing on the list card changes; profile fetches fresh on open
   * ReceiveAlert         → notification handled by useSignalR; no list patch needed
   * ReceiveMedicalReport → commented out, no use yet
   */
  const handleSignalREvent = useCallback(
    (eventName, data) => {
      // patientId in the SignalR payload maps to p.id in the patient object
      const id = data?.patientId;

      switch (eventName) {
        case "ReceiveStatusUpdate": {
          const newStatus = data?.newStatus;
          if (!newStatus) break;
          if (newStatus === "Discharged") {
            setPatients((prev) => prev.filter((p) => p.id !== id));
          } else {
            // newStatus maps to p.flowStatus (e.g. "ObservationalStable", "WaitingDoctor")
            patchPatient(id, { flowStatus: newStatus });
          }
          break;
        }

        case "ReceiveNewsUpdate": {
          const patch = {};
          // newsScore → p.newsScore (number, e.g. 0, 5, 8)
          if (data?.newsScore !== undefined) patch.newsScore = data.newsScore;
          // status    → p.status    (string, e.g. "Stable", "Critical")
          if (data?.status !== undefined) patch.status = data.status;
          if (Object.keys(patch).length) patchPatient(id, patch);
          break;
        }

        case "ReceiveTask":
          // No field on the patient list card reflects tasks — nothing to patch.
          break;

        case "ReceiveAlert":
          // useSignalR already stored the notification. No list patch needed.
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
        const name = (p.fullName || "").toLowerCase();
        const pid = String(p.id || "");
        return name.includes(term) || pid.includes(term);
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
