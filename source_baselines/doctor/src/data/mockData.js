export const initialDoctorProfile = {
  id: "DOC-8942",
  name: "Dr. Rahul Vance",
  title: "MD, DM (Cardiology)",
  specialty: "Senior Interventional Cardiologist",
  hospital: "MedX Super Speciality Hospital & Heart Institute",
  department: "Department of Cardiovascular Sciences",
  experienceYears: 14,
  phone: "+91 98765 43210",
  email: "dr.rahul.vance@medxhealth.com",
  consultationFee: "₹800 ($80)",
  languages: ["English", "Hindi", "Marathi"],
  rating: 4.9,
  totalConsultations: 4820,
  photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
  about: "Dr. Rahul Vance is a highly acclaimed Interventional Cardiologist with over 14 years of experience in managing complex coronary interventions, heart failure management, and preventive cardiac medicine.",
  availability: {
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    breakTime: "01:00 PM - 02:00 PM",
    slotDuration: "30 Mins",
    onlineConsultation: true,
    inPersonConsultation: true
  }
};

export const initialSummaryStats = {
  patientsToday: 18,
  waiting: 4,
  completed: 11,
  reportsPending: 3,
  followupsDue: 7,
  unreadMessages: 5,
  todaysAppointments: 18,
  totalPatients: 248,
  pendingAppointments: 4,
  emergencyAlerts: 1
};

export const initialNeedsAttention = [
  {
    id: "ATT-1",
    severity: "Critical",
    color: "rose",
    patientId: "PX-10482",
    patientName: "Rajesh Kumar",
    item: "Emergency SOS triggered at Emergency Room 2",
    actionLabel: "Open Emergency",
    type: "sos"
  },
  {
    id: "ATT-2",
    severity: "High Priority",
    color: "amber",
    patientId: "PAT-1002",
    patientName: "Priya Shah",
    item: "Abnormal Holter monitor result requires physician review",
    actionLabel: "Review Report",
    type: "report",
    reportId: "LAB-806"
  },
  {
    id: "ATT-3",
    severity: "High Priority",
    color: "amber",
    patientId: "PAT-1003",
    patientName: "Amit Verma",
    item: "Prescription renewal requested (Ticagrelor 90mg)",
    actionLabel: "Review Request",
    type: "rx"
  },
  {
    id: "ATT-4",
    severity: "Follow-up",
    color: "sky",
    patientId: "PAT-1008",
    patientName: "Neha Gupta",
    item: "Post-Myocarditis recovery follow-up due today",
    actionLabel: "View Appointment",
    type: "appointment",
    aptId: "APT-508"
  }
];

export const initialPatientQueue = [
  {
    time: "09:00 AM",
    patientName: "Anjali Sharma",
    patientId: "PAT-1011",
    visitType: "Follow-up",
    status: "Waiting",
    age: 34,
    gender: "Female",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
  },
  {
    time: "09:30 AM",
    patientName: "Vikram Patel",
    patientId: "PAT-1012",
    visitType: "New Consultation",
    status: "Confirmed",
    age: 48,
    gender: "Male",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"
  },
  {
    time: "10:00 AM",
    patientName: "Rajesh Kumar",
    patientId: "PX-10482",
    visitType: "Emergency SOS",
    status: "Critical",
    age: 64,
    gender: "Male",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80"
  },
  {
    time: "10:30 AM",
    patientName: "Rahul Sharma",
    patientId: "PAT-1001",
    visitType: "Cardiology Follow-up",
    status: "In Consultation",
    age: 28,
    gender: "Male",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80"
  },
  {
    time: "11:15 AM",
    patientName: "Priya Patel",
    patientId: "PAT-1002",
    visitType: "Mitral Valve Review",
    status: "Confirmed",
    age: 42,
    gender: "Female",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
  },
  {
    time: "12:00 PM",
    patientName: "Amit Verma",
    patientId: "PAT-1003",
    visitType: "IHD TMT Evaluation",
    status: "Waiting",
    age: 56,
    gender: "Male",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
  }
];

export const availableRespondersPool = [
  {
    id: "RESP-1",
    name: "Nurse Priya Sharma",
    role: "Senior ER Nurse",
    department: "Emergency Station 2",
    phone: "+91 98112 44556",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "RESP-2",
    name: "Officer Vikram Singh",
    role: "Trauma Care Specialist",
    department: "Resuscitation Unit B",
    phone: "+91 98223 11223",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "RESP-3",
    name: "Dr. Ananya Roy",
    role: "Senior ER Registrar",
    department: "Department of Emergency Medicine",
    phone: "+91 98310 99881",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "RESP-4",
    name: "Technician Alok Nath",
    role: "Cardiac Telemetry Specialist",
    department: "ICU Diagnostics Lab",
    phone: "+91 98450 77889",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  }
];

export const initialEmergencyWorkflowData = {
  alertId: "EMG-901",
  patientName: "Rajesh Kumar",
  patientId: "PX-10482",
  bloodGroup: "O-",
  location: "Emergency Room 2",
  sosTriggerTime: "10:42 AM",
  status: "CRITICAL",
  vitals: { hr: 118, bp: "88/56", spo2: 91 },
  doctorEta: "3–5 min",
  isDoctorOnWay: false,
  nurseNotified: false,
  responders: [
    {
      id: "RESP-1",
      name: "Nurse Priya Sharma",
      role: "Senior ER Nurse",
      department: "Emergency Station 2",
      phone: "+91 98112 44556",
      acceptedAt: "10:43:02 AM",
      status: "Responding — En Route to ER-2",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    }
  ],
  timeline: [
    { time: "10:42:03 AM", event: "Patient triggered SOS from Emergency Room 2", actor: "Patient Rajesh Kumar" },
    { time: "10:42:08 AM", event: "Doctor notified on MedX Workstation", actor: "MedX System" },
    { time: "10:42:31 AM", event: "Doctor Dr. Rahul Vance acknowledged emergency alert", actor: "Dr. Rahul Vance" },
    { time: "10:43:02 AM", event: "Emergency Alert ACCEPTED by Nurse Priya Sharma (Senior ER Nurse • Emergency Station 2)", actor: "Nurse Priya Sharma" }
  ],
  interventions: [
    { id: "INT-1", action: "High-flow O2 therapy administered (4L/min)", authorizedBy: "Dr. Rahul Vance", performedBy: "Nurse Priya Sharma", time: "10:44:15 AM", status: "Recorded" },
    { id: "INT-2", action: "STAT 12-lead ECG recorded & vital monitor attached", authorizedBy: "Dr. Rahul Vance", performedBy: "Nurse Priya Sharma", time: "10:45:00 AM", status: "Recorded" }
  ]
};

export const initialRecentActivity = [
  { id: "ACT-1", patientName: "Rajesh Kumar", patientId: "PX-10482", event: "Emergency SOS triggered", time: "10:42 AM", type: "emergency" },
  { id: "ACT-2", patientName: "Priya Shah", patientId: "PAT-1002", event: "Lab report uploaded (24-Hr Holter)", time: "10:31 AM", type: "clinical" },
  { id: "ACT-3", patientName: "Amit Verma", patientId: "PAT-1003", event: "Prescription renewal requested", time: "10:12 AM", type: "rx" },
  { id: "ACT-4", patientName: "Neha Gupta", patientId: "PAT-1008", event: "Follow-up appointment booked", time: "09:58 AM", type: "appointment" }
];

export const initialMyDaySchedule = [
  { time: "09:00 AM", title: "Consultation — Anjali Sharma", type: "Consultation" },
  { time: "09:30 AM", title: "Consultation — Vikram Patel", type: "Consultation" },
  { time: "10:00 AM", title: "Emergency Case — Rajesh Kumar (ER-2)", type: "Emergency" },
  { time: "10:45 AM", title: "Follow-up — Rahul Sharma", type: "Follow-up" },
  { time: "11:30 AM", title: "Cath Lab Procedure — Coronary Angiography", type: "Procedure" },
  { time: "12:30 PM", title: "Clinical Break & Lunch", type: "Break" },
  { time: "01:00 PM", title: "OPD Consultation Session", type: "Consultation" }
];

export const initialPatients = [
  {
    id: "PX-10482",
    name: "Rajesh Kumar",
    age: 64,
    gender: "Male",
    dob: "1962-07-11",
    bloodGroup: "O-",
    phone: "+91 97110 65432",
    email: "rajesh.kumar62@yahoo.com",
    address: "H.No. 405, Sector 15",
    city: "Chandigarh",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
    emergencyContact: "Sunil Kumar (Son)",
    emergencyPhone: "+91 97110 88776",
    height: "170 cm",
    weight: "76 kg",
    bmi: "26.3",
    lastVisit: "2026-08-22",
    nextAppointment: "2026-08-25 (Today at 10:00 AM)",
    currentCondition: "Congestive Heart Failure (Systolic) / Post-CABG",
    status: "Critical",
    clinicalFlags: ["⚠ Diabetes", "⚠ Hypertension", "⚠ Severe HFrEF"],
    alertFlags: {
      allergy: "Iodinated Radiocontrast (Severe Reaction)",
      chronic: "CHF (EF 35%) & Severe CAD",
      importantNote: "Strict fluid restriction 1.5L/day. Monitor daily weight."
    },
    vitals: {
      latest: { bp: "88/56 mmHg", hr: "118 BPM", spo2: "91%", temp: "98.2°F", weight: "76 kg", height: "170 cm", bmi: "26.3", recordedAt: "2026-08-25 10:42 AM" },
      history: [
        { date: "Aug 25, 2026", bp: "88/56", hr: 118, spo2: 91, temp: 98.2 },
        { date: "Aug 22, 2026", bp: "102/64", hr: 72, spo2: 94, temp: 98.4 }
      ]
    },
    allergies: [
      { category: "Drug Allergies", allergy: "Iodinated Radiocontrast Media", reaction: "Anaphylactoid reaction / Bronchospasm", severity: "High" }
    ],
    medicalHistory: [
      { condition: "Coronary Artery Bypass Graft (CABG)", date: "2019-04-18", doctor: "Dr. Rahul Vance", hospital: "MedX Heart Center", notes: "Triple vessel bypass surgery.", status: "Completed" },
      { condition: "Heart Failure with Reduced Ejection Fraction (HFrEF)", date: "2023-10-12", doctor: "Dr. Rahul Vance", hospital: "MedX Hospital", notes: "Current LVEF 35%. NYHA Class II.", status: "Critical" }
    ],
    currentMedications: [
      { id: "MED-9", name: "Sacubitril/Valsartan (Entresto)", dosage: "49/51 mg", frequency: "Twice daily", route: "Oral", startDate: "2023-10-15", endDate: "Ongoing", prescribingDoctor: "Dr. Rahul Vance", instructions: "ARNI therapy for heart failure." },
      { id: "MED-10", name: "Furosemide (Lasix)", dosage: "40 mg", frequency: "Once daily (Morning)", route: "Oral", startDate: "2023-10-15", endDate: "Ongoing", prescribingDoctor: "Dr. Rahul Vance", instructions: "Diuretic for edema control." }
    ],
    labReports: [
      { id: "LAB-810", name: "NT-proBNP Heart Failure Marker", date: "2026-08-22", doctor: "Dr. Rahul Vance", status: "High", fileUrl: "#", details: "NT-proBNP: 1,850 pg/mL (Elevated cardiac wall stress)" }
    ],
    prescriptions: [],
    clinicalNotes: [],
    followupPlan: [],
    surgeries: [],
    vaccinations: [],
    familyHistory: []
  },
  {
    id: "PAT-1001",
    name: "Rahul Sharma",
    age: 28,
    gender: "Male",
    dob: "1997-04-14",
    bloodGroup: "B+",
    phone: "+91 98112 34567",
    email: "rahul.sharma97@gmail.com",
    address: "B-402, Green Valley Apartments, Sector 62",
    city: "New Delhi",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    emergencyContact: "Sunita Sharma (Mother)",
    emergencyPhone: "+91 98112 98765",
    height: "172 cm",
    weight: "68 kg",
    bmi: "23.0",
    lastVisit: "2026-08-10",
    nextAppointment: "2026-08-25 (Today at 10:30 AM)",
    currentCondition: "Post-Angioplasty Follow-up / Hypertension",
    status: "Active",
    clinicalFlags: ["⚠ Essential Hypertension", "⚠ Post-PCI Stent"],
    alertFlags: {
      allergy: "Penicillin (Moderate Skin Rash)",
      chronic: "Essential Hypertension",
      importantNote: "Requires BP check before prescribing beta blockers."
    },
    vitals: {
      latest: { bp: "120/80 mmHg", hr: "78 BPM", spo2: "98%", temp: "98.6°F", weight: "68 kg", height: "172 cm", bmi: "23.0", recordedAt: "2026-08-25 09:15 AM" },
      history: [
        { date: "Aug 25, 2026", bp: "120/80", hr: 78, spo2: 98, temp: 98.6 },
        { date: "Aug 10, 2026", bp: "128/84", hr: 82, spo2: 97, temp: 98.4 }
      ]
    },
    allergies: [
      { category: "Drug Allergies", allergy: "Penicillin", reaction: "Skin rash & urticaria", severity: "Moderate" }
    ],
    medicalHistory: [
      { condition: "Essential Hypertension", date: "2024-03-15", doctor: "Dr. Rahul Vance", hospital: "MedX Hospital", notes: "Managed with Telmisartan 40mg once daily.", status: "Ongoing" }
    ],
    currentMedications: [
      { id: "MED-1", name: "Telmisartan", dosage: "40 mg", frequency: "Once daily (Morning)", route: "Oral", startDate: "2024-03-15", endDate: "Ongoing", prescribingDoctor: "Dr. Rahul Vance", instructions: "Take after breakfast with water." }
    ],
    labReports: [
      { id: "LAB-801", name: "Complete Blood Count (CBC)", date: "2026-08-10", doctor: "Dr. Rahul Vance", status: "Normal", fileUrl: "#", details: "Hemoglobin: 14.2 g/dL, WBC: 7,200 /mcL" }
    ],
    prescriptions: [],
    clinicalNotes: [],
    followupPlan: [],
    surgeries: [],
    vaccinations: [],
    familyHistory: []
  },
  {
    id: "PAT-1002",
    name: "Priya Patel",
    age: 42,
    gender: "Female",
    dob: "1984-09-22",
    bloodGroup: "A+",
    phone: "+91 98221 87654",
    email: "priya.patel@outlook.com",
    address: "Flat 12A, Cyber City Towers",
    city: "Gurugram",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    emergencyContact: "Vikram Patel (Husband)",
    emergencyPhone: "+91 98221 11223",
    height: "160 cm",
    weight: "62 kg",
    bmi: "24.2",
    lastVisit: "2026-08-18",
    nextAppointment: "2026-08-25 (Today at 11:15 AM)",
    currentCondition: "Palpitations & Mitral Valve Prolapse Review",
    status: "Active",
    clinicalFlags: ["⚠ Mitral Valve Prolapse"],
    alertFlags: {
      allergy: "Sulfa Drugs",
      chronic: "Mild Mitral Valve Prolapse (MVP)",
      importantNote: "Reported stress-induced tachycardia."
    },
    vitals: {
      latest: { bp: "118/76 mmHg", hr: "84 BPM", spo2: "99%", temp: "98.4°F", weight: "62 kg", height: "160 cm", bmi: "24.2", recordedAt: "2026-08-25 09:30 AM" },
      history: []
    },
    allergies: [],
    medicalHistory: [],
    currentMedications: [],
    labReports: [
      { id: "LAB-806", name: "24-Hour Holter Monitoring", date: "2026-08-18", doctor: "Dr. Rahul Vance", status: "Borderline", fileUrl: "#", details: "Sinus rhythm with rare isolated PACs. Abnormal nocturnal pulse dips." }
    ],
    prescriptions: [],
    clinicalNotes: [],
    followupPlan: [],
    surgeries: [],
    vaccinations: [],
    familyHistory: []
  },
  {
    id: "PAT-1003",
    name: "Amit Verma",
    age: 56,
    gender: "Male",
    dob: "1970-01-18",
    bloodGroup: "O+",
    phone: "+91 98450 12345",
    email: "amit.verma@corp.in",
    address: "C-15, Rosewood Estates",
    city: "Noida",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    emergencyContact: "Meena Verma (Wife)",
    emergencyPhone: "+91 98450 99887",
    height: "178 cm",
    weight: "84 kg",
    bmi: "26.5",
    lastVisit: "2026-08-15",
    nextAppointment: "2026-08-25 (Today at 12:00 PM)",
    currentCondition: "Ischemic Heart Disease / Type 2 Diabetes",
    status: "Active",
    clinicalFlags: ["⚠ Diabetes Mellitus", "⚠ Coronary Artery Disease"],
    alertFlags: {
      allergy: "Aspirin (Mild Gastric Bleeding)",
      chronic: "Type 2 Diabetes & CAD",
      importantNote: "Requires Renal function monitoring."
    },
    vitals: {
      latest: { bp: "134/86 mmHg", hr: "72 BPM", spo2: "97%", temp: "98.6°F", weight: "84 kg", height: "178 cm", bmi: "26.5", recordedAt: "2026-08-25 10:00 AM" },
      history: []
    },
    allergies: [],
    medicalHistory: [],
    currentMedications: [],
    labReports: [],
    prescriptions: [],
    clinicalNotes: [],
    followupPlan: [],
    surgeries: [],
    vaccinations: [],
    familyHistory: []
  },
  {
    id: "PAT-1008",
    name: "Neha Gupta",
    age: 31,
    gender: "Female",
    dob: "1995-12-03",
    bloodGroup: "O+",
    phone: "+91 98990 12890",
    email: "sneha.g@digitalagency.com",
    address: "Flat 301, Sunshine Heights",
    city: "Mumbai",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    emergencyContact: "Alok Gupta (Brother)",
    emergencyPhone: "+91 98990 77661",
    height: "162 cm",
    weight: "55 kg",
    bmi: "21.0",
    lastVisit: "2026-08-05",
    nextAppointment: "2026-08-25 (Today at 05:15 PM)",
    currentCondition: "Post-Myocarditis Recovery",
    status: "Active",
    clinicalFlags: ["⚠ Post-Myocarditis"],
    alertFlags: {
      allergy: "Codeine (Nausea & Dizziness)",
      chronic: "Viral Myocarditis (Convalescent phase)",
      importantNote: "No intense athletic workouts for 6 months."
    },
    vitals: {
      latest: { bp: "112/70 mmHg", hr: "70 BPM", spo2: "99%", temp: "98.6°F", weight: "55 kg", height: "162 cm", bmi: "21.0", recordedAt: "2026-08-05 10:00 AM" },
      history: []
    },
    allergies: [],
    medicalHistory: [],
    currentMedications: [],
    labReports: [],
    prescriptions: [],
    clinicalNotes: [],
    followupPlan: [],
    surgeries: [],
    vaccinations: [],
    familyHistory: []
  }
];

export const initialAppointments = [
  {
    id: "APT-501",
    patientId: "PAT-1001",
    patientName: "Rahul Sharma",
    age: 28,
    gender: "Male",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    time: "10:30 AM",
    date: "2026-08-25",
    type: "Cardiology Follow-up",
    reason: "Post-Angioplasty & Stenting Routine BP Check",
    mode: "In-person",
    status: "In Consultation"
  },
  {
    id: "APT-502",
    patientId: "PAT-1002",
    patientName: "Priya Patel",
    age: 42,
    gender: "Female",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    time: "11:15 AM",
    date: "2026-08-25",
    type: "Mitral Valve Review",
    reason: "24-Hr Holter Monitor & Echo Discussion",
    mode: "In-person",
    status: "Confirmed"
  },
  {
    id: "APT-503",
    patientId: "PAT-1003",
    patientName: "Amit Verma",
    age: 56,
    gender: "Male",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    time: "12:00 PM",
    date: "2026-08-25",
    type: "Ischemic Heart Disease Review",
    reason: "TMT Treadmill Test Result & Diabetic Meds",
    mode: "In-person",
    status: "Waiting"
  },
  {
    id: "APT-508",
    patientId: "PAT-1008",
    patientName: "Neha Gupta",
    age: 31,
    gender: "Female",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    time: "05:15 PM",
    date: "2026-08-25",
    type: "Myocarditis Follow-up",
    reason: "Cardiac MRI Clearance for Exercise",
    mode: "In-person",
    status: "Confirmed"
  }
];

export const initialEmergencyAlerts = [
  {
    id: "EMG-901",
    patientId: "PX-10482",
    patientName: "Rajesh Kumar",
    age: 64,
    bloodGroup: "O-",
    location: "Emergency Room 2",
    coordinates: "28.6139° N, 77.2090° E",
    time: "10:42 AM Today",
    status: "SOS ACTIVE",
    alertType: "Acute Dyspnea & Chest Tightness",
    vitalsAtAlert: "BP: 88/56 mmHg | HR: 118 BPM | SpO2: 91%",
    vitalSeverity: "Critical High Risk"
  }
];

export const initialMessages = [
  {
    id: "MSG-CONV-1",
    patientId: "PAT-1001",
    patientName: "Rahul Sharma",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    lastMessage: "Doctor, my BP reading this morning was 120/80. Should I continue Telmisartan at the same dose?",
    time: "10:05 AM",
    unreadCount: 2,
    conversation: [
      { sender: "patient", text: "Good morning Dr. Vance! Hope you are doing well.", time: "09:58 AM" },
      { sender: "patient", text: "Doctor, my BP reading this morning was 120/80. Should I continue Telmisartan at the same dose?", time: "10:05 AM" }
    ]
  },
  {
    id: "MSG-CONV-2",
    patientId: "PAT-1002",
    patientName: "Priya Patel",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    lastMessage: "I have uploaded the 24-hour Holter report. Looking forward to our 11:15 AM meeting.",
    time: "09:30 AM",
    unreadCount: 1,
    conversation: [
      { sender: "patient", text: "Hello Doctor, I completed the Holter test yesterday.", time: "09:28 AM" },
      { sender: "patient", text: "I have uploaded the 24-hour Holter report. Looking forward to our 11:15 AM meeting.", time: "09:30 AM" }
    ]
  }
];
