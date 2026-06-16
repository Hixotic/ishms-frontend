const DEPARTMENTS = [
  { name: "Cardiology", total: 50, startId: 1 },
  { name: "Neurology", total: 50, startId: 50 },
  { name: "Emergency", total: 50, startId: 150 },
  { name: "ICU", total: 50, startId: 100 },
];

// Returns: B012
export function formatBedId(bedId) {
  if (!bedId) return "";
  return `${String(bedId).padStart(3, "0")}`;
}

// Returns: P001
export function formatPatientId(patientId) {
  if (!patientId) return "";
  return `P${String(patientId).padStart(3, "0")}`;
}

// Returns: Cardiology
export function HandleDepartmentByBedId(bedId) {
  const dept = DEPARTMENTS.find(d => bedId >= d.startId && bedId < d.startId + d.total);
  return dept ? dept.name : "";
}

// Returns: Cardiology-3
export function HandleRoomByBedId(bedId) {
  const dept = DEPARTMENTS.find(d => bedId >= d.startId && bedId < d.startId + d.total);
  if (!dept) return "";
  
  const roomNumber = Math.ceil((bedId - dept.startId + 1) / 5);
  return `${dept.name}-${roomNumber}`;
}