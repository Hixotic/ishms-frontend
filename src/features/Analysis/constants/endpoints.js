const BASE = "https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net/api/Analytics";

export const EP = {
  Analytics: BASE,
  deptLoad: BASE + "/executive/department-load",
  alertTrend: BASE + "/executive/alert-trend",
  sla: BASE + "/executive/sla-compliance",

  riskBoard: BASE + "/clinical/risk-board",
  vitalTrend: BASE + "/clinical/vital-trend/{patientId}",
  alertFeed: BASE + "/clinical/alert-feed",
  escalations: BASE + "/clinical/escalations",

  bedMap: BASE + "/operations/bed-map",
  peakHours: BASE + "/operations/peak-hours",
  bedShortage: BASE + "/operations/bed-shortage-risk",
};