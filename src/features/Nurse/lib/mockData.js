/**
 * هذا الملف يحتوي على البيانات الوهمية (Mock Data) المستخدمة في المشروع.
 * 
 * تم إنشاء ملف الربط الفعلي في: @/lib/api.js
 * رابط الـ API المستخدم: https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net/api
 * 
 * للتحويل إلى الـ API الحقيقي في أي صفحة (مثل Dashboard.jsx):
 * 1. استبدل: import { getAllPatients } from '@/lib/mockData';
 *    بـ: import { patientApi } from '@/lib/api';
 * 2. استخدم useEffect لجلب البيانات:
 *    const [patients, setPatients] = useState([]);
 *    useEffect(() => {
 *      patientApi.getAllPatients().then(setPatients);
 *    }, []);
 */

export const mockPatients = [
  {
    id: 'P001',
    name: 'Ahmed Mohammed',
    age: 65,
    gender: 'M',
    status: 'needs_care',
    roomNumber: '101',
    lastVitals: {
      temperature: 36.8,
      heartRate: 72,
      bloodPressure: '120/80',
      oxygenSaturation: 96,
      respiratoryRate: 16,
    },
    vitalTrend: [
      { timestamp: '08:00', bloodPressure: '122/82', heartRate: 75, oxygenSaturation: 97, respiratoryRate: 16 },
      { timestamp: '12:00', bloodPressure: '118/78', heartRate: 72, oxygenSaturation: 96, respiratoryRate: 16 },
      { timestamp: '16:00', bloodPressure: '120/80', heartRate: 72, oxygenSaturation: 96, respiratoryRate: 16 },
    ],
    admissionDiagnosis: 'Community-acquired pneumonia with stable oxygen support.',
    comorbidities: ['Type 2 diabetes', 'Controlled hypertension'],
    allergies: ['None reported'],
    medications: [
      {
        id: 'M001',
        name: 'Aspirin',
        dosage: '100 mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Ali',
        prescribedDate: '2026-05-01',
        route: 'Oral',
      },
      {
        id: 'M002',
        name: 'Metoprolol',
        dosage: '50 mg',
        frequency: 'Twice daily',
        prescribedBy: 'Dr. Ali',
        prescribedDate: '2026-05-01',
        route: 'Oral',
      },
    ],
    admissionDate: '2026-04-15',
    notes: 'Patient is stable and improving well',
  },
  {
    id: 'P002',
    name: 'Fatima Ali',
    age: 58,
    gender: 'F',
    status: 'unknown',
    roomNumber: '205',
    lastVitals: {
      temperature: 38.5,
      heartRate: 122,
      bloodPressure: '95/60',
      oxygenSaturation: 89,
      respiratoryRate: 24,
    },
    vitalTrend: [
      { timestamp: '08:00', bloodPressure: '100/65', heartRate: 110, oxygenSaturation: 92, respiratoryRate: 22 },
      { timestamp: '12:00', bloodPressure: '98/62', heartRate: 118, oxygenSaturation: 90, respiratoryRate: 23 },
      { timestamp: '16:00', bloodPressure: '95/60', heartRate: 122, oxygenSaturation: 89, respiratoryRate: 24 },
    ],
    admissionDiagnosis: 'Sepsis with acute respiratory decline after urinary tract infection.',
    comorbidities: ['Chronic kidney disease', 'Asthma'],
    allergies: ['Penicillin'],
    medications: [
      {
        id: 'M003',
        name: 'Ceftriaxone',
        dosage: '2 grams',
        frequency: 'Every 12 hours',
        prescribedBy: 'Dr. Sarah',
        prescribedDate: '2026-05-02',
        route: 'IV',
      },
      {
        id: 'M004',
        name: 'Oxygen',
        dosage: '2 L/min',
        frequency: 'Continuous',
        prescribedBy: 'Dr. Sarah',
        prescribedDate: '2026-05-02',
        route: 'Inhalation',
      },
    ],
    admissionDate: '2026-05-02',
    notes: 'Critical condition, under intensive monitoring',
  },
  {
    id: 'P003',
    name: 'Mahmoud Hassan',
    age: 72,
    gender: 'M',
    status: 'needs_care',
    roomNumber: '312',
    lastVitals: {
      temperature: 37.2,
      heartRate: 88,
      bloodPressure: '130/85',
      oxygenSaturation: 94,
      respiratoryRate: 18,
    },
    vitalTrend: [
      { timestamp: '08:00', bloodPressure: '134/87', heartRate: 90, oxygenSaturation: 95, respiratoryRate: 18 },
      { timestamp: '12:00', bloodPressure: '132/86', heartRate: 89, oxygenSaturation: 94, respiratoryRate: 18 },
      { timestamp: '16:00', bloodPressure: '130/85', heartRate: 88, oxygenSaturation: 94, respiratoryRate: 18 },
    ],
    admissionDiagnosis: 'Heart failure with mild fluid overload and orthostatic symptoms.',
    comorbidities: ['Hyperlipidemia', 'Benign prostatic hyperplasia'],
    allergies: ['Sulfa drugs'],
    medications: [
      {
        id: 'M005',
        name: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Mohammed',
        prescribedDate: '2026-04-20',
        route: 'Oral',
      },
      {
        id: 'M006',
        name: 'Furosemide',
        dosage: '40 mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Mohammed',
        prescribedDate: '2026-04-20',
        route: 'Oral',
      },
    ],
    admissionDate: '2026-04-25',
    notes: 'Needs additional care, blood pressure monitoring required',
  },
  {
    id: 'P004',
    name: 'Layla Ibrahim',
    age: 45,
    gender: 'F',
    status: 'unknown',
    roomNumber: '108',
    lastVitals: {
      temperature: 36.9,
      heartRate: 68,
      bloodPressure: '118/76',
      oxygenSaturation: 98,
      respiratoryRate: 15,
    },
    vitalTrend: [
      { timestamp: '08:00', bloodPressure: '119/77', heartRate: 70, oxygenSaturation: 98, respiratoryRate: 15 },
      { timestamp: '12:00', bloodPressure: '118/76', heartRate: 68, oxygenSaturation: 98, respiratoryRate: 15 },
      { timestamp: '16:00', bloodPressure: '118/76', heartRate: 68, oxygenSaturation: 98, respiratoryRate: 15 },
    ],
    admissionDiagnosis: 'Postoperative observation following laparoscopic cholecystectomy.',
    comorbidities: ['Migraine'],
    allergies: ['None reported'],
    medications: [
      {
        id: 'M007',
        name: 'Paracetamol',
        dosage: '500 mg',
        frequency: 'Every 6 hours',
        prescribedBy: 'Dr. Noor',
        prescribedDate: '2026-05-01',
        route: 'Oral',
      },
    ],
    admissionDate: '2026-05-01',
    notes: 'Stable condition, ready for discharge soon',
  },
  {
    id: 'P005',
    name: 'Omar Khalil',
    age: 55,
    gender: 'M',
    status: 'needs_care',
    roomNumber: '210',
    lastVitals: {
      temperature: 39.2,
      heartRate: 135,
      bloodPressure: '90/55',
      oxygenSaturation: 85,
      respiratoryRate: 28,
    },
    vitalTrend: [
      { timestamp: '08:00', bloodPressure: '92/58', heartRate: 128, oxygenSaturation: 87, respiratoryRate: 26 },
      { timestamp: '12:00', bloodPressure: '91/57', heartRate: 132, oxygenSaturation: 86, respiratoryRate: 27 },
      { timestamp: '16:00', bloodPressure: '90/55', heartRate: 135, oxygenSaturation: 85, respiratoryRate: 28 },
    ],
    admissionDiagnosis: 'Severe sepsis with hypotension and escalating vasopressor support.',
    comorbidities: ['Coronary artery disease', 'Type 2 diabetes'],
    allergies: ['Latex'],
    medications: [
      {
        id: 'M008',
        name: 'Dopamine',
        dosage: '10 mcg/kg/min',
        frequency: 'Continuous',
        prescribedBy: 'Dr. Hassan',
        prescribedDate: '2026-05-03',
        route: 'IV',
      },
      {
        id: 'M009',
        name: 'Vancomycin',
        dosage: '1 gram',
        frequency: 'Every 12 hours',
        prescribedBy: 'Dr. Hassan',
        prescribedDate: '2026-05-03',
        route: 'IV',
      },
    ],
    admissionDate: '2026-05-03',
    notes: 'Critical condition, in intensive care unit',
  },
];

export const mockAlerts = [
  {
    id: 'A001',
    patientId: 'P002',
    patientName: 'Fatima Ali',
    title: 'Critical Vitals Alert',
    description: 'Blood pressure critically low (95/60). Immediate attention required.',
    type: 'vitals',
    priority: 'high',
    timestamp: '2026-05-03T13:15:00Z',
    read: false,
  },
  {
    id: 'A002',
    patientId: 'P005',
    patientName: 'Omar Khalil',
    title: 'Medication Due',
    description: 'Vancomycin IV due now. Patient in Room 210.',
    type: 'medication',
    priority: 'high',
    timestamp: '2026-05-03T13:10:00Z',
    read: false,
  },
  {
    id: 'A003',
    patientId: 'P003',
    patientName: 'Mahmoud Hassan',
    title: 'Blood Pressure Check',
    description: 'Routine blood pressure monitoring due.',
    type: 'task',
    priority: 'medium',
    timestamp: '2026-05-03T13:05:00Z',
    read: false,
  },
  {
    id: 'A004',
    patientId: 'P001',
    patientName: 'Ahmed Mohammed',
    title: 'Vital Signs Stable',
    description: 'Latest vitals are within normal range.',
    type: 'notification',
    priority: 'low',
    timestamp: '2026-05-03T12:50:00Z',
    read: true,
  },
  {
    id: 'A005',
    patientId: 'P002',
    patientName: 'Fatima Ali',
    title: 'Oxygen Saturation Low',
    description: 'SpO2 at 89%. Increase oxygen support.',
    type: 'vitals',
    priority: 'high',
    timestamp: '2026-05-03T13:00:00Z',
    read: false,
  },
];

export const getPatientById = (id) => {
  return mockPatients.find(p => p.id === id);
};

export const getAlertById = (id) => {
  return mockAlerts.find(a => a.id === id);
};

export const getPatientsByStatus = (status) => {
  return mockPatients.filter(p => p.status === status);
};

export const getAllAlerts = () => {
  return mockAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getUnreadAlerts = () => {
  return getAllAlerts().filter(a => !a.read);
};

export const getAlertsByPriority = (priority) => {
  return getAllAlerts().filter(a => a.priority === priority);
};

export const getAllPatients = () => {
  return mockPatients;
};

export const markAlertAsRead = (alertId) => {
  const alert = mockAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.read = true;
  }
};

export const addVitalSignsToMock = (vitalData) => {
  const patient = mockPatients.find(p => p.id === vitalData.patientId || p.id === `P00${vitalData.patientId}`);
  if (patient) {
    const newVital = {
      temperature: vitalData.temperature,
      heartRate: vitalData.heartRate,
      bloodPressure: `${vitalData.systolicPressure}/${vitalData.diastolicPressure}`,
      oxygenSaturation: vitalData.oxygenLevel,
      respiratoryRate: vitalData.respirationRate,
      recordedAt: vitalData.recordedAt,
      notes: vitalData.notes
    };
    
    // Update lastVitals
    patient.lastVitals = newVital;
    
    // Add to vitalTrend
    if (!patient.vitalTrend) patient.vitalTrend = [];
    patient.vitalTrend.unshift({
      timestamp: new Date(vitalData.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...newVital
    });

    // Also update vitalSigns array if it exists (used in some components)
    if (!patient.vitalSigns) patient.vitalSigns = [];
    patient.vitalSigns.unshift(newVital);
    
    console.log('Updated mock patient vitals:', patient);
    return true;
  }
  return false;
};
