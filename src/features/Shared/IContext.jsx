import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
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

      setPatients(patientsRes.data || []);
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

  // Fetch data on mount and when role changes
  useEffect(() => {
    fetchData();
  }, [role]);

  /**
   * Filter patients based on search term
   * Searches by name, fullName, and MRN
   */
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

  /**
   * Get patients filtered by status
   * Useful for dashboard cards showing critical/unstable patients
   */
  const getPatientsByStatus = (status) => {
    if (status === "All") return patients;
    return patients.filter((p) => p.status === status);
  };

  /**
   * Get a single patient by ID
   * Useful when you need details of one patient
   */
  const getPatientById = (patientId) => {
    return patients.find((p) => p.id === patientId);
  };

  /**
   * Get alerts filtered by type
   * Useful for categorizing alerts
   */
  const getAlertsByType = (type) => {
    return alerts.filter((a) => a.type === type);
  };

  /**
   * Get the latest N alerts
   * Default is 5 (used by notification panel)
   */
  const getLatestAlerts = (count = 5) => {
    return alerts.slice(0, count);
  };

  // Context value object with all available data and functions
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

    // Refresh function
    refreshData: fetchData,
  };

  return <IContext.Provider value={contextValue}>{children}</IContext.Provider>;
}

/**
 * Custom Hook: useData
 *
 * Use this hook in any component to access hospital data
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
 * 6. Refresh data:
 *    const { refreshData } = useData();
 *    await refreshData();
 */
export const useData = () => {
  const ctx = useContext(IContext);
  if (!ctx) {
    // Return safe defaults instead of throwing
    return { patients: [], isReceptionist: false, isDoctor: false };
  }
  return ctx;
};

export default IContext;
