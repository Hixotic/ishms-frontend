/**
 * ISHMS Mock Data & Logic (Migrated to JS)
 */

// Generate realistic vital signs data for the past 48 hours
// Updated to match your vitalSigns schema (heartRate, oxygenLevel, etc.)
const generateVitalsHistory = (baseScore, hours = 24) => {
  const history = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i -= 4) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 2;
    const score = Math.max(0, Math.min(12, baseScore + variation));
    
    history.push({
      recordedAt: timestamp.toISOString(),
      heartRate: Math.round(70 + (score * 5) + (Math.random() - 0.5) * 10),
      respirationRate: Math.round(16 + (score * 2) + (Math.random() - 0.5) * 3),
      systolicPressure: Math.round(120 - (score * 3) + (Math.random() - 0.5) * 10),
      diastolicPressure: Math.round(80 - (score * 2) + (Math.random() - 0.5) * 5),
      temperature: Number((36.5 + (score * 0.1) + (Math.random() - 0.5) * 0.5).toFixed(1)),
      oxygenLevel: Math.round(98 - (score * 0.8)),
      newsScore: Math.round(score)
    });
  }
  return history;
};

export const MOCK_PATIENTS = [
  {
    id: "P001",
    fullName: "Aisha Al-Farouq",
    mrn: "#44921-02",
    ward: "Ward 4",
    bed: "Bed 12",
    age: 67,
    gender: "Female",
    status: "Critical",
    newsScore: 8,
    background: "67-year-old female with a history of COPD, hypertension, and type 2 diabetes. Admitted 3 days ago with acute exacerbation of COPD.",
    previousMedications: [
      "Salbutamol 2.5mg nebulised PRN",
      "Ipratropium 0.5mg nebulised TDS",
      "Metformin 500mg PO BD",
    ],
    currentTreatment: "High-flow oxygen therapy 15L/min. IV hydrocortisone 100mg TDS. Salbutamol nebulisers every 2 hours.",
    alertMessage: "NEWS2 elevated to 8. Respiratory distress detected.",
    alertTime: "12 mins ago",
    vitalSigns: generateVitalsHistory(8)
  },
  {
    id: "P002",
    fullName: "Omar Al-Mansour",
    mrn: "#11284-33",
    ward: "ICU",
    bed: "Bed 01",
    age: 74,
    gender: "Male",
    status: "Critical",
    newsScore: 7,
    background: "74-year-old male post-cardiac arrest. Resuscitated in ED 18 hours ago. History of ischaemic heart disease.",
    previousMedications: ["Warfarin 3mg PO OD", "Bisoprolol 5mg PO OD"],
    currentTreatment: "Intubated and ventilated. Propofol infusion for sedation. Noradrenaline 0.1 mcg/kg/min.",
    alertMessage: "Post-arrest. Haemodynamically unstable.",
    alertTime: "18 hrs ago",
    inConsult: "Dr. Sarah",
    vitalSigns: generateVitalsHistory(7)
  },
  {
    id: "P003",
    fullName: "Karim Nasser",
    mrn: "#33102-99",
    ward: "Ward 2",
    bed: "Bed 04",
    age: 58,
    gender: "Male",
    status: "Unstable",
    newsScore: 5,
    background: "58-year-old male with known heart failure (EF 35%) and COPD.",
    previousMedications: ["Furosemide 40mg PO OD", "Digoxin 125mcg PO OD"],
    currentTreatment: "IV furosemide 40mg BD. Oxygen 2L/min via nasal cannula.",
    alertMessage: "Borderline SpO2 drop. Monitor oxygen therapy.",
    alertTime: "45 mins ago",
    vitalSigns: generateVitalsHistory(5)
  },
  {
    id: "P004",
    fullName: "Layla Hassan",
    mrn: "#28741-11",
    ward: "Ward 3",
    bed: "Bed 07",
    age: 45,
    gender: "Female",
    status: "Unstable",
    newsScore: 5,
    background: "45-year-old female admitted with acute pancreatitis secondary to gallstones.",
    previousMedications: ["Oral contraceptive pill", "Ibuprofen PRN"],
    currentTreatment: "IV fluids 1L NS over 8 hours. Morphine PCA. NBM.",
    alertMessage: "Elevated inflammatory markers. Surgical review pending.",
    alertTime: "2 hrs ago",
    vitalSigns: generateVitalsHistory(5)
  },
  {
    id: "P005",
    fullName: "Yusuf Khalid",
    mrn: "#55103-44",
    ward: "Ward 1",
    bed: "Bed 02",
    age: 71,
    gender: "Male",
    status: "Stable",
    newsScore: 2,
    background: "71-year-old male admitted for elective right total knee replacement.",
    previousMedications: ["Amlodipine 5mg PO OD"],
    currentTreatment: "Enoxaparin 40mg SC OD. Regular analgesia. Physiotherapy commenced.",
    alertMessage: null,
    alertTime: null,
    vitalSigns: generateVitalsHistory(2)
  },
  {
    id: "P006",
    fullName: "Mariam Saeed",
    mrn: "#67832-05",
    ward: "Ward 2",
    bed: "Bed 09",
    age: 63,
    gender: "Female",
    status: "Stable",
    newsScore: 3,
    background: "63-year-old female with atrial fibrillation, on long-term anticoagulation.",
    previousMedications: ["Warfarin 5mg PO OD", "Aspirin 75mg PO OD"],
    currentTreatment: "Warfarin withheld. INR monitoring BD.",
    alertMessage: "AI Drug Interaction Warning: Concurrent Aspirin use detected.",
    alertTime: "2:02 PM",
    vitalSigns: generateVitalsHistory(3)
  },
  {
    id: "P007",
    fullName: "Fatima Al-Rashid",
    mrn: "#39201-77",
    ward: "Ward 4",
    bed: "Bed 03",
    age: 80,
    gender: "Female",
    status: "Stable",
    newsScore: 1,
    background: "80-year-old female with congestive cardiac failure admitted for routine diuretic adjustment.",
    previousMedications: ["Furosemide 20mg PO OD", "Ramipril 2.5mg PO OD"],
    currentTreatment: "Furosemide 40mg IV STAT given at 13:58.",
    alertMessage: null,
    alertTime: null,
    vitalSigns: generateVitalsHistory(1)
  },
  {
    id: "P008",
    fullName: "Tariq Abdullah",
    mrn: "#80123-22",
    ward: "Ward 3",
    bed: "Bed 11",
    age: 55,
    gender: "Male",
    status: "Stable",
    newsScore: 2,
    background: "55-year-old male admitted overnight with community-acquired pneumonia.",
    previousMedications: ["Salbutamol inhaler PRN"],
    currentTreatment: "Amoxicillin 500mg PO TDS. Clarithromycin 500mg PO BD.",
    alertMessage: null,
    alertTime: null,
    vitalSigns: generateVitalsHistory(2)
  }
];

// Helper Functions
export const getPatientById = (id) => MOCK_PATIENTS.find((p) => p.id === id);

export const getStatusColor = (status) => {
  switch (status) {
    case "Critical": return "#DC2626"; // Red
    case "Unstable": return "#F59E0B"; // Amber
    case "Stable":   return "#10B981"; // Green
    default:         return "#94A3B8";
  }
};

export const getStatusBg = (status) => {
  switch (status) {
    case "Critical": return "#FEF2F2";
    case "Unstable": return "#FFFBEB";
    case "Stable":   return "#F0FDF4";
    default:         return "#F8FAFC";
  }
};

// Drug database for prescriptions
export const drugDatabase = [
  { name: "Acetaminophen", commonDoses: ["500mg", "1000mg"], routes: ["PO", "IV"], category: "Analgesic" },
  { name: "Morphine", commonDoses: ["2mg", "5mg"], routes: ["IV", "PO"], category: "Opioid" },
  { name: "Heparin", commonDoses: ["5000 units"], routes: ["IV", "SC"], category: "Anticoagulant" },
  { name: "Warfarin", commonDoses: ["1mg", "2mg", "5mg"], routes: ["PO"], category: "Anticoagulant" },
  { name: "Furosemide", commonDoses: ["20mg", "40mg"], routes: ["PO", "IV"], category: "Diuretic" },
  { name: "Ceftriaxone", commonDoses: ["1g", "2g"], routes: ["IV"], category: "Antibiotic" },
  { name: "Ondansetron", commonDoses: ["4mg", "8mg"], routes: ["IV", "PO"], category: "Antiemetic" },
];

export const drugInteractions = [
  { drug1: "Warfarin", drug2: "Aspirin", severity: "high", description: "Significantly increased bleeding risk" },
  { drug1: "Lisinopril", drug2: "Potassium Chloride", severity: "medium", description: "Risk of hyperkalemia" },
];