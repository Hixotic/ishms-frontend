export const currentUser = {
  name: "System Admin",
  initials: "SA",
  role: "admin",
  department: "System",
};

export const kpiData = {
  totalPatients: 247,
  criticalPatients: 18,
  activeStaff: 64,
  pendingAlerts: 11,
};

export const activityFeed = [
  { id: 1, action: "Vitals submitted for Room 214", user: "Nurse Sarah A.", time: "3 min ago", type: "green" },
  { id: 2, action: "Discharge approved — John Mwangi", user: "Dr. Khalid Omar", time: "9 min ago", type: "blue" },
  { id: 3, action: "Patient marked critical — Room 308", user: "Nurse Layla H.", time: "17 min ago", type: "red" },
  { id: 4, action: "Missed medication alert — Room 112", user: "System", time: "34 min ago", type: "amber" },
  { id: 5, action: "ISBAR report submitted — Ward C", user: "Nurse Amara D.", time: "41 min ago", type: "green" },
  { id: 6, action: "Lab results updated — Patient #1042", user: "Dr. Priya N.", time: "58 min ago", type: "blue" },
  { id: 7, action: "New patient admitted — Room 309", user: "Dr. Khalid Omar", time: "1h ago", type: "blue" },
  { id: 8, action: "Drug interaction flagged — Room 219", user: "System", time: "1h 10min ago", type: "amber" },
];

export const quickStatus = {
  stableRooms: 31,
  highRiskRooms: 7,
  pendingISBAR: 9,
};

export const rooms = [
  { id: 1, num: "A-101", name: "James Kimura", nurse: "Sarah Al-Amin", status: "stable", news2: 1, age: 45, vitals: { bp: "118/76", hr: 72, rr: 14, spo2: "98%" }, lastUpdate: "8 min ago" },
  { id: 2, num: "A-102", name: "Fatima Al-Rashid", nurse: "Layla Hassan", status: "observation", news2: 5, age: 62, vitals: { bp: "138/88", hr: 92, rr: 20, spo2: "95%" }, lastUpdate: "12 min ago" },
  { id: 3, num: "A-103", name: "Priya Chandra", nurse: "Amara Diallo", status: "stable", news2: 0, age: 38, vitals: { bp: "115/72", hr: 68, rr: 13, spo2: "99%" }, lastUpdate: "5 min ago" },
  { id: 4, num: "A-104", name: "Omar Hassan", nurse: "Sarah Al-Amin", status: "critical", news2: 9, age: 71, vitals: { bp: "160/100", hr: 118, rr: 26, spo2: "89%" }, lastUpdate: "2 min ago" },
  { id: 5, num: "A-105", name: "Lin Wei", nurse: "Layla Hassan", status: "stable", news2: 2, age: 55, vitals: { bp: "122/80", hr: 74, rr: 15, spo2: "97%" }, lastUpdate: "20 min ago" },
  { id: 6, num: "A-106", name: "Sofia Mendes", nurse: "Amara Diallo", status: "observation", news2: 4, age: 48, vitals: { bp: "135/85", hr: 88, rr: 19, spo2: "94%" }, lastUpdate: "7 min ago" },
  { id: 7, num: "A-107", name: "Kwame Asante", nurse: "Sarah Al-Amin", status: "stable", news2: 1, age: 33, vitals: { bp: "120/78", hr: 70, rr: 14, spo2: "98%" }, lastUpdate: "15 min ago" },
  { id: 8, num: "A-108", name: "Elena Novak", nurse: "Layla Hassan", status: "critical", news2: 8, age: 79, vitals: { bp: "155/95", hr: 108, rr: 24, spo2: "91%" }, lastUpdate: "1 min ago" },
  { id: 9, num: "A-109", name: "Arjun Patel", nurse: "Amara Diallo", status: "stable", news2: 0, age: 29, vitals: { bp: "112/70", hr: 66, rr: 13, spo2: "99%" }, lastUpdate: "30 min ago" },
  { id: 10, num: "A-110", name: "Amina Jomo", nurse: "Sarah Al-Amin", status: "observation", news2: 5, age: 57, vitals: { bp: "140/90", hr: 94, rr: 21, spo2: "94%" }, lastUpdate: "4 min ago" },
  { id: 11, num: "A-111", name: "Carlos Ruiz", nurse: "Layla Hassan", status: "stable", news2: 2, age: 44, vitals: { bp: "125/82", hr: 76, rr: 15, spo2: "97%" }, lastUpdate: "18 min ago" },
  { id: 12, num: "A-112", name: "Hana Nakamura", nurse: "Amara Diallo", status: "stable", news2: 1, age: 36, vitals: { bp: "116/74", hr: 69, rr: 14, spo2: "98%" }, lastUpdate: "10 min ago" },
  { id: 13, num: "B-201", name: "David Okafor", nurse: "Mohamed Rauf", status: "stable", news2: 1, age: 52, vitals: { bp: "119/77", hr: 73, rr: 14, spo2: "98%" }, lastUpdate: "22 min ago" },
  { id: 14, num: "B-202", name: "Nadia Petrov", nurse: "Mohamed Rauf", status: "observation", news2: 6, age: 65, vitals: { bp: "142/92", hr: 96, rr: 22, spo2: "93%" }, lastUpdate: "6 min ago" },
  { id: 15, num: "B-203", name: "Hassan Al-Farsi", nurse: "Mohamed Rauf", status: "stable", news2: 0, age: 41, vitals: { bp: "114/71", hr: 67, rr: 13, spo2: "99%" }, lastUpdate: "35 min ago" },
  { id: 16, num: "B-204", name: "Mei Lin Zhang", nurse: "Mohamed Rauf", status: "critical", news2: 10, age: 83, vitals: { bp: "168/108", hr: 124, rr: 28, spo2: "87%" }, lastUpdate: "Just now" },
];

export const alerts = [
  { id: 1, patient: "Omar Hassan", room: "A-104", type: "High NEWS2 Score", detail: "NEWS2 score: 9 · Respiratory rate elevated · SpO₂ dropping", severity: "critical", time: "2 min ago", resolved: false },
  { id: 2, patient: "Fatima Al-Rashid", room: "A-102", type: "Missed Medication", detail: "Metformin 500mg dose missed — 09:00 scheduled", severity: "critical", time: "34 min ago", resolved: false },
  { id: 3, patient: "James Kimura", room: "A-101", type: "Drug Interaction Warning", detail: "Possible interaction: Warfarin + Aspirin detected", severity: "warning", time: "1h ago", resolved: false },
  { id: 4, patient: "Amina Jomo", room: "A-110", type: "Lab Results Flagged", detail: "Potassium level above normal range — review recommended", severity: "info", time: "2h ago", resolved: false },
  { id: 5, patient: "Elena Novak", room: "A-108", type: "High NEWS2 Score", detail: "NEWS2 score: 8 · BP critically elevated", severity: "critical", time: "1 min ago", resolved: false },
  { id: 6, patient: "Nadia Petrov", room: "B-202", type: "Missed Medication", detail: "Lisinopril 10mg dose missed — 08:00 scheduled", severity: "warning", time: "3h ago", resolved: false },
  { id: 7, patient: "Mei Lin Zhang", room: "B-204", type: "High NEWS2 Score", detail: "NEWS2 score: 10 · Immediate attention required", severity: "critical", time: "Just now", resolved: false },
  { id: 8, patient: "David Okafor", room: "B-201", type: "Lab Results Flagged", detail: "Hemoglobin slightly below normal threshold", severity: "info", time: "4h ago", resolved: true },
  { id: 9, patient: "Grace Mwende", room: "ICU-03", type: "High NEWS2 Score", detail: "NEWS2 score: 7 · Heart rate irregular · Monitor closely", severity: "warning", time: "12 min ago", resolved: false },
  { id: 10, patient: "Khalid Mansour", room: "C-115", type: "Missed Medication", detail: "Insulin dose overdue — 14:30 scheduled", severity: "critical", time: "8 min ago", resolved: false },
  { id: 11, patient: "Sofia Andersson", room: "A-207", type: "Drug Interaction Warning", detail: "Ciprofloxacin + Tizanidine — muscle weakness risk", severity: "warning", time: "45 min ago", resolved: false },
  { id: 12, patient: "Raj Patel", room: "B-310", type: "Lab Results Flagged", detail: "Creatinine elevated — renal function review needed", severity: "info", time: "1h 20min ago", resolved: false },
];

export const staff = [
  { id: 1, name: "Sarah Al-Amin", initials: "SA", role: "Nurse", department: "Ward A", assignedPatients: 6, completedTasks: 14, lastActivity: "3 min ago", status: "active", color: "#2563EB" },
  { id: 2, name: "Dr. Khalid Omar", initials: "KO", role: "Doctor", department: "Ward B", assignedPatients: 4, completedTasks: 9, lastActivity: "9 min ago", status: "busy", color: "#7C3AED" },
  { id: 3, name: "Layla Hassan", initials: "LH", role: "Nurse", department: "Ward A", assignedPatients: 7, completedTasks: 11, lastActivity: "17 min ago", status: "active", color: "#059669" },
  { id: 4, name: "Dr. Priya Nair", initials: "PN", role: "Doctor", department: "ICU", assignedPatients: 5, completedTasks: 7, lastActivity: "58 min ago", status: "busy", color: "#DC2626" },
  { id: 5, name: "Amara Diallo", initials: "AD", role: "Nurse", department: "Ward A", assignedPatients: 5, completedTasks: 8, lastActivity: "41 min ago", status: "active", color: "#D97706" },
  { id: 6, name: "Mohamed Rauf", initials: "MR", role: "Nurse", department: "Ward B", assignedPatients: 0, completedTasks: 12, lastActivity: "4h ago", status: "offline", color: "#64748B" },
  { id: 7, name: "Dr. Yusuf Adeyemi", initials: "YA", role: "Doctor", department: "Ward A", assignedPatients: 3, completedTasks: 5, lastActivity: "22 min ago", status: "active", color: "#0891B2" },
  { id: 8, name: "Grace Mwende", initials: "GM", role: "Nurse", department: "ICU", assignedPatients: 4, completedTasks: 10, lastActivity: "5 min ago", status: "busy", color: "#BE185D" },
];

export const incidents = [
  { id: 1, timestamp: "Today 09:14", incident: "Patient fall — Room 103", staff: "Nurse Sarah A.", dept: "Ward A", status: "critical" },
  { id: 2, timestamp: "Today 08:30", incident: "Missed medication — Room 112", staff: "Nurse Layla H.", dept: "Ward A", status: "pending" },
  { id: 3, timestamp: "Yesterday 22:05", incident: "Equipment malfunction — ICU", staff: "Dr. Priya N.", dept: "ICU", status: "resolved" },
  { id: 4, timestamp: "Yesterday 18:41", incident: "Drug interaction flag — Room 219", staff: "Pharmacist", dept: "Ward B", status: "pending" },
  { id: 5, timestamp: "Yesterday 11:00", incident: "Visitor access violation", staff: "Security", dept: "Admin", status: "resolved" },
  { id: 6, timestamp: "2 days ago 14:20", incident: "IV line contamination suspected", staff: "Nurse Amara D.", dept: "Ward A", status: "resolved" },
  { id: 7, timestamp: "2 days ago 09:55", incident: "Patient elopement attempt", staff: "Nurse Mohamed R.", dept: "Ward B", status: "pending" },
  { id: 8, timestamp: "3 days ago 17:30", incident: "Incorrect dosage administered", staff: "Nurse Sarah A.", dept: "Ward A", status: "critical" },
];

export const users = [
  { id: 1, name: "Sarah Al-Amin", initials: "SA", email: "sarah.alamin@hospital.com", role: "Nurse", department: "Ward A", status: "active", lastLogin: "Today, 07:30", color: "#2563EB" },
  { id: 2, name: "Dr. Khalid Omar", initials: "KO", email: "k.omar@hospital.com", role: "Doctor", department: "Ward B", status: "active", lastLogin: "Today, 08:15", color: "#7C3AED" },
  { id: 3, name: "Admin Master", initials: "AM", email: "admin@hospital.com", role: "Admin", department: "System", status: "active", lastLogin: "Today, 09:00", color: "#DC2626" },
  { id: 4, name: "Amara Diallo", initials: "AD", email: "a.diallo@hospital.com", role: "Nurse", department: "Ward A", status: "suspended", lastLogin: "3 days ago", color: "#059669" },
  { id: 5, name: "Dr. Priya Nair", initials: "PN", email: "p.nair@hospital.com", role: "Doctor", department: "ICU", status: "active", lastLogin: "Today, 06:45", color: "#DC2626" },
  { id: 6, name: "Dr. Yusuf Adeyemi", initials: "YA", email: "y.adeyemi@hospital.com", role: "HOD", department: "Ward A", status: "active", lastLogin: "Today, 07:00", color: "#0891B2" },
  { id: 7, name: "Grace Mwende", initials: "GM", email: "g.mwende@hospital.com", role: "Nurse", department: "ICU", status: "active", lastLogin: "Yesterday", color: "#BE185D" },
];

export const wardPerformance = {
  totalPatients: 48,
  criticalCases: 5,
  avgResponseTime: "4.2 min",
  completedTasks: 142,
  nursePerformance: [
    { name: "Sarah Al-Amin", assigned: 6, completed: 14, pending: 2 },
    { name: "Layla Hassan", assigned: 7, completed: 11, pending: 4 },
    { name: "Amara Diallo", assigned: 5, completed: 8, pending: 3 },
    { name: "Mohamed Rauf", assigned: 4, completed: 12, pending: 1 },
    { name: "Grace Mwende", assigned: 4, completed: 10, pending: 2 },
  ],
  weeklyChart: [
    { day: "Mon", admitted: 8, discharged: 6 },
    { day: "Tue", admitted: 12, discharged: 9 },
    { day: "Wed", admitted: 7, discharged: 11 },
    { day: "Thu", admitted: 10, discharged: 8 },
    { day: "Fri", admitted: 14, discharged: 12 },
    { day: "Sat", admitted: 6, discharged: 7 },
    { day: "Sun", admitted: 9, discharged: 5 },
  ],
};

export const isbarReports = [
  { id: 1, nurse: "Sarah Al-Amin", patient: "James Kimura", room: "A-101", submitted: "Today, 08:45", status: "reviewed" },
  { id: 2, nurse: "Layla Hassan", patient: "Omar Hassan", room: "A-104", submitted: "Today, 09:10", status: "pending" },
  { id: 3, nurse: "Amara Diallo", patient: "Sofia Mendes", room: "A-106", submitted: "Today, 07:30", status: "pending" },
  { id: 4, nurse: "Sarah Al-Amin", patient: "Amina Jomo", room: "A-110", submitted: "Yesterday, 22:15", status: "reviewed" },
  { id: 5, nurse: "Layla Hassan", patient: "Elena Novak", room: "A-108", submitted: "Today, 09:55", status: "pending" },
  { id: 6, nurse: "Mohamed Rauf", patient: "Nadia Petrov", room: "B-202", submitted: "Yesterday, 18:00", status: "reviewed" },
];

export const permissions = {
  modules: ["Dashboard", "Ward Heatmap", "Clinical Alerts", "Staff Activity", "Incident Logs", "User Management", "Roles & Perms", "Settings", "Ward Performance", "ISBAR Reviews"],
  roles: ["Nurse", "Doctor", "HOD", "Admin"],
  matrix: {
    Nurse:  { view: [true,true,true,false,false,false,false,false,false,true], create:[false,false,false,false,false,false,false,false,false,true], edit:[false,false,false,false,false,false,false,false,false,false], delete:[false,false,false,false,false,false,false,false,false,false] },
    Doctor: { view: [true,true,true,true,false,false,false,false,false,true],  create:[false,false,false,false,false,false,false,false,false,false], edit:[false,false,true,false,false,false,false,false,false,false],  delete:[false,false,false,false,false,false,false,false,false,false] },
    HOD:    { view: [true,true,true,true,true,false,false,false,true,true],     create:[false,false,false,false,false,false,false,false,false,false], edit:[false,false,true,false,false,false,false,false,false,true],   delete:[false,false,false,false,false,false,false,false,false,false] },
    Admin:  { view: [true,true,true,true,true,true,true,true,true,true],        create:[true,false,false,true,true,true,false,false,false,false],     edit:[true,true,true,true,true,true,true,true,false,false],         delete:[false,false,false,false,true,true,false,false,false,false] },
  },
};
