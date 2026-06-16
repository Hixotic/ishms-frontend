import { api } from "../client";

// ─── Auth ──────────────────────────────────────────────────────────────────
export { authService } from "./authService";

// ─── Analytics / Dashboard ────────────────────────────────────────────────
export const analyticsService = {
  getSummary:       ()           => api.get("/Analytics"),
  getDeptLoad:      ()           => api.get("/Analytics/executive/department-load"),
  getAlertTrend:    (days = 7)   => api.get(`/Analytics/executive/alert-trend?days=${days}`),
  getSlaCompliance: ()           => api.get("/Analytics/executive/sla-compliance"),
  getRiskBoard:     (dept, band) => api.get(`/Analytics/clinical/risk-board${dept ? `?department=${dept}` : ""}${band ? `&riskBand=${band}` : ""}`),
  getVitalTrend:    (patientId, hours = 24) => api.get(`/Analytics/clinical/vital-trend/${patientId}?hours=${hours}`),
  getAlertFeed:     (limit = 20) => api.get(`/Analytics/clinical/alert-feed?limit=${limit}`),
  getEscalations:   ()           => api.get("/Analytics/clinical/escalations"),
  getBedMap:        (dept)       => api.get(`/Analytics/operations/bed-map${dept ? `?department=${dept}` : ""}`),
  getPeakHours:     ()           => api.get("/Analytics/operations/peak-hours"),
  getBedShortage:   ()           => api.get("/Analytics/operations/bed-shortage-risk"),
};

// ─── Alerts ────────────────────────────────────────────────────────────────
export const alertService = {
  getByRole:   (role)    => api.get(`/Alert/role/${role}`),
  getByUser:   (userId)  => api.get(`/Alert/user/${userId}`),
  markRead:    (alertId) => api.post(`/Alert/read/${alertId}`),
};

// ─── Patients ──────────────────────────────────────────────────────────────
export const patientService = {
  getAll:          ()           => api.get("/Patient"),
  getById:         (id)         => api.get(`/Patient/${id}`),
  create:          (data)       => api.post("/Patient", data),
  delete:          (id)         => api.delete(`/Patient/${id}`),
  updateNurse:     (id, data)   => api.put(`/Patient/${id}/nurse`, data),
  updateDoctor:    (id, data)   => api.put(`/Patient/${id}/doctor`, data),
  discharge:       (patientId)  => api.post(`/Patient/discharge/${patientId}`),
  checkMedication: (id)         => api.get(`/Patient/${id}/medication/check`),
  createVital:     (data)       => api.post("/Patient/vital", data),
  updateVital:     (id, data)   => api.put(`/Patient/vital/${id}`, data),
  getISBAR:        (id)         => api.get(`/Patient/${id}/isbar`),
};

// ─── Beds / Ward Heatmap ───────────────────────────────────────────────────
export const bedService = {
  assign:              (data)       => api.post("/Bed/assign", data),
  getAvailable:        ()           => api.get("/Bed/available"),
  getAvailableByDept:  (deptId)     => api.get(`/Bed/available/${deptId}`),
  getOccupied:         ()           => api.get("/Bed/occupied"),
};

// ─── Departments ───────────────────────────────────────────────────────────
export const departmentService = {
  getAll: () => api.get("/Department"),
};

// ─── Tasks / Staff Activity ────────────────────────────────────────────────
export const taskService = {
  getByRole:    (role)    => api.get(`/Task/role/${role}`),
  getByUser:    (userId)  => api.get(`/Task/user/${userId}`),
  getByPatient: (patientId) => api.get(`/Task/patient/${patientId}`),
  complete:     (taskId)  => api.post(`/Task/complete/${taskId}`),
};

// ─── Medical Reports ───────────────────────────────────────────────────────
export const medicalReportService = {
  create:       (data)      => api.post("/MedicalReport", data),
  getByPatient: (patientId) => api.get(`/MedicalReport/patient/${patientId}`),
  getMyReports: ()          => api.get("/MedicalReport/my-reports"),
  getByDoctor:  (doctorId)  => api.get(`/MedicalReport/doctor/${doctorId}`),
};
