export const MOCK_ORDERS = [
  {
    id: "O001",
    patientId: "P005",
    patientName: "Yusuf Khalid",
    drug: "Enoxaparin",
    dose: "40mg SC OD",
    status: "VERIFIED",
    time: "12:15 PM",
    prescribedBy: "Dr. Ahmed",
    warning: null,
  },
  {
    id: "O002",
    patientId: "P006",
    patientName: "Mariam Saeed",
    drug: "Warfarin",
    dose: "5mg PO Nocté",
    status: "FLAGGED",
    time: "2:02 PM",
    prescribedBy: "Dr. Ahmed",
    warning: "AI Drug Interaction Warning: Concurrent Aspirin use detected.",
  },
  {
    id: "O003",
    patientId: "P007",
    patientName: "Fatima Al-Rashid",
    drug: "Furosemide",
    dose: "40mg IV STAT",
    status: "PENDING",
    time: "1:58 PM",
    prescribedBy: "Dr. Ahmed",
    warning: null,
  },
  {
    id: "O004",
    patientId: "P001",
    patientName: "Aisha Al-Farouq",
    drug: "Hydrocortisone",
    dose: "100mg IV TDS",
    status: "VERIFIED",
    time: "1:30 PM",
    prescribedBy: "Dr. Ahmed",
    warning: null,
  },
  {
    id: "O005",
    patientId: "P003",
    patientName: "Karim Nasser",
    drug: "Furosemide",
    dose: "40mg IV BD",
    status: "PENDING",
    time: "1:10 PM",
    prescribedBy: "Dr. Ahmed",
    warning: null,
  },
];

export const MOCK_HANDOVERS = [
  {
    id: "han_201",
    patientName: "Tariq Abdullah",
    type: "Shift End Handover",
    time: "08:00 AM",
    isAiAssisted: true,
    sections: {
      identity: "Tariq Abdullah, 55-year-old male, MRN #80123-22.",
      situation: "Stable overnight. Requirement for 2L O2 maintained SpO2 at 92%. Morning nebulizers administered.",
      background: "Admitted overnight with community-acquired pneumonia. Responding well to antibiotics.",
      assessment: "Chest sounds improving, inflammatory markers trending down.",
      recommendation: "Continue current antibiotic course, repeat CXR in 24 hours."
    }
  },
  {
    id: "han_202",
    patientName: "Ibrahim Saleh",
    type: "Internal Transfer",
    time: "06:15 AM",
    isAiAssisted: false,
    sections: {
      situation: "Transferring to Ward 4 for specialized cardiac monitoring.",
      background: "Post-MI 48 hours ago.",
    }
  }
];

export const MOCK_BED_DATA = [
  { id: '1A', status: 'available' },
  { id: '1B', status: 'occupied', patient: 'K. Mansour', days: 3 },
  { id: '1C', status: 'available' },
  { id: '1D', status: 'cleaning' },
  { id: '1E', status: 'occupied', patient: 'F. Hassan', days: 1 },
  { id: '1F', status: 'available' },
  { id: '2A', status: 'reserved' },
  { id: '2B', status: 'available' },
  { id: '2C', status: 'occupied', patient: 'N. Salem', days: 5 },
  { id: '2D', status: 'available' },
  { id: '2E', status: 'occupied', patient: 'A. Youssef', days: 2 },
  { id: '2F', status: 'cleaning' },
  { id: '3A', status: 'available' },
  { id: '3B', status: 'available' },
  { id: '3C', status: 'occupied', patient: 'M. Khalil', days: 7 },
  { id: '3D', status: 'available' },
  { id: '3E', status: 'reserved' },
  { id: '3F', status: 'available' },
];

export const MOCK_TASKS = [
  { text: 'Process insurance claim for MRN-0042', priority: 'high' },
  { text: 'Verify bed availability for afternoon admissions', priority: 'med' },
  { text: 'Send discharge summary to MRN-0019', priority: 'high' },
  { text: 'Update ward census report', priority: 'low' },
  { text: 'Confirm tomorrow\'s scheduled admissions', priority: 'med' },
];