import axios from "axios";

// حط هنا رابط السيرفر بتاعك أو رابط Azure
const BASE = "https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net/api/analytics";
const api  = axios.create({ baseURL: BASE });

export const ExecutiveAPI = {
  getSummary      : () => api.get("/executive/summary"),
  getDeptLoad     : () => api.get("/executive/department-load"),
  getAlertTrend   : (days = 7) => api.get(`/executive/alert-trend?days=${days}`),
  getSlaCompliance: () => api.get("/executive/sla-compliance"),
};

export const ClinicalAPI = {
  getRiskBoard  : (dept, band) => 
    api.get("/clinical/risk-board", { params: { department: dept, riskBand: band } }),
  getVitalTrend : (id, hours = 24) => 
    api.get(`/clinical/vital-trend/${id}?hours=${hours}`),
  getAlertFeed  : (limit = 20) => 
    api.get(`/clinical/alert-feed?limit=${limit}`),
  getEscalations: () => api.get("/clinical/escalations"),
};

export const OperationsAPI = {
  getBedMap          : (dept) => 
    api.get("/operations/bed-map", { params: { department: dept } }),
  getPeakHours       : () => api.get("/operations/peak-hours"),
  getBedShortageRisk : () => api.get("/operations/bed-shortage-risk"),
  // تم إيقاف الـ workload بناءً على طلبك
};