import { create } from 'zustand';

export const usePatientStore = create((set) => ({
  patients: [],
  loading: false,
  error: null,
  setPatients: (patients) => set({ patients }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updatePatientStatus: (patientId, status) => set((state) => ({
    patients: state.patients.map((p) => 
      p.id === patientId ? { ...p, status } : p
    )
  })),
}));

export const useAlertStore = create((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) => set({ 
    alerts, 
    unreadCount: alerts.filter(a => !a.read).length 
  }),
  markAsRead: (alertId) => set((state) => {
    const newAlerts = state.alerts.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    );
    return {
      alerts: newAlerts,
      unreadCount: newAlerts.filter(a => !a.read).length
    };
  }),
  addAlert: (alert) => set((state) => {
    const newAlerts = [alert, ...state.alerts];
    return {
      alerts: newAlerts,
      unreadCount: newAlerts.filter(a => !a.read).length
    };
  }),
}));
