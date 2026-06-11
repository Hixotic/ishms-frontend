export const MOCK_ISBAR = [
  {
    id: "IS001",
    patientId: "P008",
    patientName: "Tariq Abdullah",
    type: "Shift End Handover",
    time: "08:00 AM",
    aiAssisted: true,
    sections: {
      I: {
        label: "Identity & Patient Info",
        content: "Tariq Abdullah, 55M, MRN #80123-22, Ward 3 Bed 11. Admitted with community-acquired pneumonia.",
      },
      S: {
        label: "Situation",
        content: "Stable overnight. Requirement for 2L O2 maintained SpO2 at 92%. Morning nebulizers administered.",
      },
      B: {
        label: "Background",
        content: "No previous respiratory admissions. Mild asthma managed with PRN salbutamol. CXR: right lower lobe consolidation improving.",
      },
      A: {
        label: "Assessment",
        content: "Responding well to oral antibiotics. NEWS2 score 2, trending down from 4 on admission. Temperature settling.",
      },
      R: {
        label: "Recommendation",
        content: "Continue current antibiotic course. Wean oxygen as tolerated. Target discharge in 48 hours if continues to improve. Repeat CXR tomorrow.",
      },
    },
  },
  {
    id: "IS002",
    patientId: "P002",
    patientName: "Ibrahim Saleh",
    type: "Internal Transfer",
    time: "06:15 AM",
    aiAssisted: true,
    sections: {
      I: {
        label: "Identity & Patient Info",
        content: "Ibrahim Saleh, 68M, MRN #92034-18, transferred from ED to Ward 3 Bed 08 at 06:15.",
      },
      S: {
        label: "Situation",
        content: "Presented to ED with sudden onset chest pain radiating to jaw. ECG: ST elevation in leads II, III, aVF. Troponin rising.",
      },
      B: {
        label: "Background",
        content: "Known hypertension and hypercholesterolaemia. Smoker 20 pack years. Family history of IHD.",
      },
      A: {
        label: "Assessment",
        content: "Inferior STEMI. Thrombolysis administered in ED with partial reperfusion. Cardiology consulted.",
      },
      R: {
        label: "Recommendation",
        content: "Urgent cardiology review. Continue dual antiplatelet therapy. Serial ECGs and troponin. Bed rest. Cath lab on standby.",
      },
    },
  },
];