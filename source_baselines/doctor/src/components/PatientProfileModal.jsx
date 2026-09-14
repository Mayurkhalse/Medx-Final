import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Heart,
  Activity,
  FileText,
  Pill,
  Clock,
  Plus,
  Download,
  Eye,
  ShieldAlert,
  CheckCircle2,
  Thermometer,
  Droplets,
  Stethoscope,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function PatientProfileModal({
  patient,
  doctorProfile,
  onClose,
  onSavePrescription,
  onSaveClinicalNote,
  onSaveFollowup,
  onViewLabReport,
  onViewPrescription,
  onDownloadReport,
  onStartConsultation,
  onCallPatient
}) {
  const [activeSection, setActiveSection] = useState('overview');

  // Form states for modals/inline forms
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [newRx, setNewRx] = useState({
    diagnosis: '',
    medicineName: '',
    dosage: '',
    frequency: '1-0-1',
    duration: '30 Days',
    instructions: 'Take after meal',
    notes: ''
  });

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    date: new Date().toISOString().split('T')[0],
    reason: 'Routine BP & Cardiac Evaluation',
    recommendedTests: 'BP Log, Lipid Profile',
    instructions: 'Bring morning BP log readings.'
  });

  if (!patient) return null;

  // Handlers for interactive actions
  const handleAddPrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!newRx.medicineName) return;

    const prescriptionData = {
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      doctor: doctorProfile?.name || 'Dr. Rahul Vance',
      diagnosis: newRx.diagnosis || 'Routine Cardiology Review',
      medicines: [
        {
          name: newRx.medicineName,
          dosage: newRx.dosage || '1 Tab',
          frequency: newRx.frequency,
          duration: newRx.duration,
          instructions: newRx.instructions
        }
      ],
      notes: newRx.notes
    };

    onSavePrescription(patient.id, prescriptionData);
    setShowAddPrescription(false);
    setNewRx({
      diagnosis: '',
      medicineName: '',
      dosage: '',
      frequency: '1-0-1',
      duration: '30 Days',
      instructions: 'Take after meal',
      notes: ''
    });
  };

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const noteData = {
      id: `CN-${Math.floor(100 + Math.random() * 900)}`,
      date: now.toISOString().split('T')[0],
      time: timeString,
      doctor: doctorProfile?.name || 'Dr. Rahul Vance',
      note: newNoteText
    };

    onSaveClinicalNote(patient.id, noteData);
    setShowAddNote(false);
    setNewNoteText('');
  };

  const handleAddFollowupSubmit = (e) => {
    e.preventDefault();
    if (!newFollowup.date) return;

    const followupData = {
      id: `FLP-${Math.floor(100 + Math.random() * 900)}`,
      date: newFollowup.date,
      reason: newFollowup.reason,
      recommendedTests: newFollowup.recommendedTests,
      instructions: newFollowup.instructions,
      status: 'Upcoming'
    };

    onSaveFollowup(patient.id, followupData);
    setShowAddFollowup(false);
  };

  // Section list
  const sections = [
    { id: 'overview', label: 'Clinical Overview' },
    { id: 'personal', label: 'Personal Information' },
    { id: 'history', label: 'Medical History' },
    { id: 'allergies', label: 'Allergies' },
    { id: 'medications', label: 'Current Medications' },
    { id: 'vitals', label: 'Patient Vitals' },
    { id: 'reports', label: 'Lab Reports' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'appointments', label: 'Appointment History' },
    { id: 'notes', label: 'Clinical Notes' },
    { id: 'followup', label: 'Follow-up Plan' },
    { id: 'procedures', label: 'Surgeries & Procedures' },
    { id: 'vaccinations', label: 'Vaccination History' },
    { id: 'family', label: 'Family History' },
    { id: 'emergency', label: 'Emergency Info' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* PATIENT HEADER */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={patient.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                alt={patient.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-400/40 border-2 border-white shadow-md"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-white">{patient.name}</h2>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-mono">
                    ID: {patient.id}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    patient.status === 'Critical' ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30' : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                  }`}>
                    {patient.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 mt-2">
                  <span>{patient.age} Yrs • {patient.gender}</span>
                  <span>Blood Group: <strong className="text-purple-300 font-bold">{patient.bloodGroup}</strong></span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {patient.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {patient.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddPrescription(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Prescription</span>
              </button>
              <button
                onClick={() => setShowAddNote(true)}
                className="btn btn-outline btn-sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Plus className="w-4 h-4" />
                <span>+ Clinical Note</span>
              </button>
            </div>
          </div>

          {/* ALERT BANNERS */}
          {patient.alertFlags && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
              {patient.alertFlags.allergy && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span><strong>Allergy Alert:</strong> {patient.alertFlags.allergy}</span>
                </div>
              )}
              {patient.alertFlags.chronic && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span><strong>Chronic Condition:</strong> {patient.alertFlags.chronic}</span>
                </div>
              )}
              {patient.alertFlags.importantNote && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800">
                  <Activity className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span><strong>Medical Note:</strong> {patient.alertFlags.importantNote}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFILE NAVIGATION SIDEBAR & BODY CONTENT */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 bg-white border-r border-slate-200 p-3 overflow-y-auto max-h-[160px] md:max-h-none flex-shrink-0">
            <div className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === sec.id
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{sec.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeSection === sec.id ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">

            {/* SECTION 1: CLINICAL OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                
                {/* Vitals Summary Strip */}
                <div className="medx-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-600" />
                      <span>Latest Patient Vitals ({patient.vitals?.latest?.recordedAt || 'Today'})</span>
                    </h3>
                    <span className="text-xs font-semibold text-sky-600">BMI: {patient.bmi || '23.0'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <span className="text-[11px] font-medium text-slate-500 block">Blood Pressure</span>
                      <span className="text-lg font-extrabold text-slate-900">{patient.vitals?.latest?.bp || '120/80'}</span>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <span className="text-[11px] font-medium text-slate-500 block">Heart Rate</span>
                      <span className="text-lg font-extrabold text-slate-900">{patient.vitals?.latest?.hr || '78 BPM'}</span>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                      <span className="text-[11px] font-medium text-slate-500 block">Oxygen (SpO2)</span>
                      <span className="text-lg font-extrabold text-slate-900">{patient.vitals?.latest?.spo2 || '98%'}</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-[11px] font-medium text-slate-500 block">Temperature</span>
                      <span className="text-lg font-extrabold text-slate-900">{patient.vitals?.latest?.temp || '98.6°F'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick 2-Column Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Medications Quick Box */}
                  <div className="medx-card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600" />
                        <span>Active Medications ({patient.currentMedications?.length || 0})</span>
                      </h4>
                      <button onClick={() => setActiveSection('medications')} className="text-xs text-sky-600 font-semibold hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="space-y-2">
                      {patient.currentMedications?.length > 0 ? (
                        patient.currentMedications.slice(0, 3).map((med, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                            <div>
                              <strong className="text-slate-900 font-bold block">{med.name}</strong>
                              <span className="text-slate-500">{med.dosage} • {med.frequency}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-semibold text-[10px]">
                              {med.route}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No active medications logged.</p>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Follow-up Quick Box */}
                  <div className="medx-card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>Follow-up & Schedule</span>
                      </h4>
                      <button
                        onClick={() => setShowAddFollowup(true)}
                        className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Set Follow-up
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {patient.followupPlan?.length > 0 ? (
                        patient.followupPlan.map((flp, idx) => (
                          <div key={idx} className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>📅 Date: {flp.date}</span>
                              <span className="px-2 py-0.5 rounded bg-sky-600 text-white text-[10px]">{flp.status}</span>
                            </div>
                            <p className="text-slate-600 mt-1">{flp.reason}</p>
                            {flp.recommendedTests && <p className="text-sky-700 font-medium text-[11px] mt-0.5">Tests: {flp.recommendedTests}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No upcoming follow-up plan set.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 2: PERSONAL INFORMATION */}
            {activeSection === 'personal' && (
              <div className="medx-card p-6 space-y-6">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Personal & Demographic Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Full Name</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Patient ID</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">{patient.id}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Date of Birth / Age</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.dob} ({patient.age} Yrs)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Gender</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.gender}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Phone Number</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Email Address</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Blood Group</span>
                    <span className="font-bold text-sky-700 text-sm font-black">{patient.bloodGroup}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Height & Weight</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.height || '172 cm'} / {patient.weight || '68 kg'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">City & Address</span>
                    <span className="font-bold text-slate-900 text-sm">{patient.address}, {patient.city}</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 sm:col-span-2">
                    <span className="text-rose-600 font-medium block">Emergency Contact</span>
                    <span className="font-bold text-rose-950 text-sm">{patient.emergencyContact} ({patient.emergencyPhone})</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: MEDICAL HISTORY */}
            {activeSection === 'history' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Medical History & Past Diagnoses
                </h3>

                <div className="space-y-3">
                  {patient.medicalHistory?.length > 0 ? (
                    patient.medicalHistory.map((rec, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-slate-900">{rec.condition}</strong>
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                            rec.status === 'Ongoing' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                        <p className="text-slate-500">Date Logged: {rec.date} • Attending: {rec.doctor} ({rec.hospital})</p>
                        <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2 font-mono">
                          Notes: {rec.notes}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No prior medical history records available.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 4: ALLERGIES */}
            {activeSection === 'allergies' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
                  <span>Known Allergies</span>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    Strict Caution Required
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.allergies?.length > 0 ? (
                    patient.allergies.map((all, idx) => (
                      <div key={idx} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-rose-950">{all.allergy}</strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            all.severity === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {all.severity} Severity
                          </span>
                        </div>
                        <p className="text-rose-800 font-medium">{all.category}</p>
                        <p className="text-slate-600">Reaction: {all.reaction}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold text-xs text-center">
                      No known drug or food allergies reported by patient.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 5: CURRENT MEDICATIONS */}
            {activeSection === 'medications' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Current Medications & Prescriptions Active
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-3">Medicine Name</th>
                        <th className="p-3">Dosage</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Route</th>
                        <th className="p-3">Start Date</th>
                        <th className="p-3">Doctor</th>
                        <th className="p-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {patient.currentMedications?.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{med.name}</td>
                          <td className="p-3 font-semibold text-slate-700">{med.dosage}</td>
                          <td className="p-3 font-semibold text-sky-700 bg-sky-50/50">{med.frequency}</td>
                          <td className="p-3 text-slate-600">{med.route}</td>
                          <td className="p-3 text-slate-600">{med.startDate}</td>
                          <td className="p-3 text-slate-700">{med.prescribingDoctor}</td>
                          <td className="p-3 text-slate-600">{med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 6: PATIENT VITALS */}
            {activeSection === 'vitals' && (
              <div className="medx-card p-6 space-y-6">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
                  <span>Patient Vitals History</span>
                  <span className="text-xs text-slate-500 font-medium">Recorded at last visit</span>
                </h3>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-center">
                    <span className="text-slate-500 block font-medium">Blood Pressure</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{patient.vitals?.latest?.bp || '120/80'}</span>
                    <span className="text-[10px] text-sky-700 font-semibold">mmHg (Optimal)</span>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-center">
                    <span className="text-slate-500 block font-medium">Heart Rate</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{patient.vitals?.latest?.hr || '78'}</span>
                    <span className="text-[10px] text-teal-700 font-semibold">BPM (Normal Sinus)</span>
                  </div>

                  <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 text-center">
                    <span className="text-slate-500 block font-medium">Oxygen (SpO2)</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{patient.vitals?.latest?.spo2 || '98%'}</span>
                    <span className="text-[10px] text-cyan-700 font-semibold">Normal Saturation</span>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-slate-500 block font-medium">Body Temp</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{patient.vitals?.latest?.temp || '98.6°F'}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Afebrile</span>
                  </div>
                </div>

                {/* Vitals History Table */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">Historical Readings Log</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">BP (mmHg)</th>
                          <th className="p-2.5">HR (BPM)</th>
                          <th className="p-2.5">SpO2</th>
                          <th className="p-2.5">Temp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {patient.vitals?.history?.map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-900">{h.date}</td>
                            <td className="p-2.5 font-bold text-sky-700">{h.bp}</td>
                            <td className="p-2.5 text-slate-700">{h.hr}</td>
                            <td className="p-2.5 text-slate-700">{h.spo2}%</td>
                            <td className="p-2.5 text-slate-700">{h.temp}°F</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: LAB REPORTS */}
            {activeSection === 'reports' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
                  <span>Laboratory & Diagnostic Reports</span>
                  <span className="text-xs font-semibold text-slate-500">{patient.labReports?.length || 0} Reports</span>
                </h3>

                <div className="space-y-3">
                  {patient.labReports?.length > 0 ? (
                    patient.labReports.map((report) => (
                      <div key={report.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900">{report.name}</strong>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              report.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                              report.status === 'Borderline' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-1">Date: {report.date} • Ordering Doctor: {report.doctor}</p>
                          <p className="text-slate-700 font-mono text-[11px] mt-1 bg-white p-2 rounded border border-slate-200">
                            {report.details}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => onViewLabReport(report)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Report
                          </button>
                          <button
                            onClick={() => onDownloadReport(report)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No laboratory reports logged.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 8: PRESCRIPTIONS */}
            {activeSection === 'prescriptions' && (
              <div className="medx-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-base text-slate-900">Prescription History</h3>
                  <button
                    onClick={() => setShowAddPrescription(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> + New Prescription
                  </button>
                </div>

                <div className="space-y-4">
                  {patient.prescriptions?.length > 0 ? (
                    patient.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">Prescription #{rx.id}</span>
                            <span className="text-slate-500 block text-[11px]">Date: {rx.date} • Prescribed by {rx.doctor}</span>
                          </div>
                          <button
                            onClick={() => onViewPrescription(rx)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-700" /> View Prescription
                          </button>
                        </div>

                        {rx.diagnosis && (
                          <p className="text-slate-700 font-semibold bg-white p-2 rounded border border-slate-200">
                            Diagnosis: {rx.diagnosis}
                          </p>
                        )}

                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 text-[11px] block">Medicines:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rx.medicines?.map((m, i) => (
                              <div key={i} className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                                <strong className="text-slate-900 block">{m.name} ({m.dosage})</strong>
                                <span className="text-sky-700 font-medium">{m.frequency} • {m.duration}</span>
                                <span className="text-slate-500 block italic">{m.instructions}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No prescriptions recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 9: APPOINTMENT HISTORY */}
            {activeSection === 'appointments' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Appointment History
                </h3>

                <div className="space-y-3">
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 font-bold block text-sm">Next Scheduled Appointment</strong>
                      <span className="text-sky-800 font-semibold">{patient.nextAppointment || 'None'}</span>
                    </div>
                    <button
                      onClick={() => onStartConsultation && onStartConsultation({ patientId: patient.id, patientName: patient.name, age: patient.age, gender: patient.gender, reason: patient.currentCondition, mode: 'In-person' })}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors"
                    >
                      Start Consultation
                    </button>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500">Last Clinical Visit Date: <strong>{patient.lastVisit}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 10: CLINICAL NOTES */}
            {activeSection === 'notes' && (
              <div className="medx-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-base text-slate-900">Clinical Consultation Notes</h3>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> + Add Clinical Note
                  </button>
                </div>

                <div className="space-y-3">
                  {patient.clinicalNotes?.length > 0 ? (
                    patient.clinicalNotes.map((cn) => (
                      <div key={cn.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-500 font-medium">
                          <span>📅 {cn.date} at {cn.time}</span>
                          <span className="font-bold text-slate-900">{cn.doctor}</span>
                        </div>
                        <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 text-xs leading-relaxed">
                          {cn.note}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No clinical consultation notes written.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 11: FOLLOW-UP PLAN */}
            {activeSection === 'followup' && (
              <div className="medx-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-base text-slate-900">Follow-up Management</h3>
                  <button
                    onClick={() => setShowAddFollowup(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" /> Set Follow-up
                  </button>
                </div>

                <div className="space-y-3">
                  {patient.followupPlan?.length > 0 ? (
                    patient.followupPlan.map((flp) => (
                      <div key={flp.id} className="p-4 bg-sky-50/70 rounded-xl border border-sky-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-slate-900">Follow-up Date: {flp.date}</strong>
                          <span className="px-2.5 py-0.5 rounded bg-sky-600 text-white font-bold text-[10px]">{flp.status}</span>
                        </div>
                        <p className="text-slate-700 font-medium">Reason: {flp.reason}</p>
                        {flp.recommendedTests && <p className="text-sky-800 font-bold">Recommended Tests: {flp.recommendedTests}</p>}
                        {flp.instructions && <p className="text-slate-600 italic">Instructions: {flp.instructions}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No active follow-up plan scheduled.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 12: PROCEDURES */}
            {activeSection === 'procedures' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Surgery & Procedure History
                </h3>
                <div className="space-y-3">
                  {patient.surgeries?.length > 0 ? (
                    patient.surgeries.map((surg) => (
                      <div key={surg.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <strong className="text-sm font-bold text-slate-900 block">{surg.procedure}</strong>
                        <p className="text-slate-500">Date: {surg.date} • Facility: {surg.hospital} • Surgeon: {surg.doctor}</p>
                        <p className="text-slate-700 font-medium">Outcome: {surg.outcome}</p>
                        <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">Notes: {surg.notes}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No previous surgical or invasive procedures recorded.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 13: VACCINATIONS */}
            {activeSection === 'vaccinations' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Vaccination & Immunization Record
                </h3>
                <div className="space-y-3">
                  {patient.vaccinations?.length > 0 ? (
                    patient.vaccinations.map((vac, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900 font-bold block">{vac.vaccine}</strong>
                          <span className="text-slate-500">{vac.dose} • Administered on {vac.date}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          {vac.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No vaccination logs recorded.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 14: FAMILY HISTORY */}
            {activeSection === 'family' && (
              <div className="medx-card p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
                  Family Medical History
                </h3>
                <div className="space-y-3">
                  {patient.familyHistory?.length > 0 ? (
                    patient.familyHistory.map((fam, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <strong className="text-slate-900 font-bold block">{fam.condition} ({fam.familyMember})</strong>
                        <p className="text-slate-600 mt-1">{fam.notes}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No family medical history documented.</p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 15: EMERGENCY INFORMATION */}
            {activeSection === 'emergency' && (
              <div className="medx-card p-6 space-y-6">
                <h3 className="font-bold text-base text-rose-900 border-b border-rose-200 pb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Emergency Information Summary</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                    <span className="font-bold text-rose-950 block text-sm">Blood Group & Allergies</span>
                    <p className="text-slate-900 font-extrabold text-base">Blood Group: {patient.bloodGroup}</p>
                    <p className="text-rose-800 font-medium">
                      Allergies: {patient.allergies?.map(a => a.allergy).join(', ') || 'No known allergies'}
                    </p>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                    <span className="font-bold text-rose-950 block text-sm">Emergency Contact Persona</span>
                    <p className="text-slate-900 font-bold">{patient.emergencyContact}</p>
                    <p className="text-rose-900 font-mono font-bold text-sm">{patient.emergencyPhone}</p>
                    <button
                      onClick={() => onCallPatient ? onCallPatient({ name: `${patient.name} (${patient.emergencyContact || 'Emergency Contact'})`, phone: patient.emergencyPhone || patient.phone, photo: patient.photo }) : window.open(`tel:${patient.emergencyPhone}`)}
                      className="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Call Emergency Contact
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* SUB-MODAL 1: ADD PRESCRIPTION FORM MODAL */}
      {showAddPrescription && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-sky-600" />
                <span>+ Create New Prescription</span>
              </h3>
              <button onClick={() => setShowAddPrescription(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPrescriptionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis / Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension / Post-stent Review"
                  value={newRx.diagnosis}
                  onChange={(e) => setNewRx({ ...newRx, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name & Strength</label>
                <input
                  type="text"
                  placeholder="e.g. Telmisartan 40mg"
                  value={newRx.medicineName}
                  onChange={(e) => setNewRx({ ...newRx, medicineName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Tab"
                    value={newRx.dosage}
                    onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newRx.frequency}
                    onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="1-0-0">1-0-0 (Morning)</option>
                    <option value="0-0-1">0-0-1 (Night)</option>
                    <option value="1-0-1">1-0-1 (Twice Daily)</option>
                    <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days"
                    value={newRx.duration}
                    onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. After meals"
                    value={newRx.instructions}
                    onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Advice / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Low salt diet, exercise, etc."
                  value={newRx.notes}
                  onChange={(e) => setNewRx({ ...newRx, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPrescription(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: ADD CLINICAL NOTE FORM MODAL */}
      {showAddNote && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>+ Add Clinical Note</span>
              </h3>
              <button onClick={() => setShowAddNote(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation & Diagnostic Note</label>
                <textarea
                  rows={5}
                  placeholder="Enter detailed clinical observation..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: ADD FOLLOW-UP PLAN MODAL */}
      {showAddFollowup && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <span>+ Schedule Follow-up Plan</span>
              </h3>
              <button onClick={() => setShowAddFollowup(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFollowupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={newFollowup.date}
                  onChange={(e) => setNewFollowup({ ...newFollowup, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Follow-up</label>
                <input
                  type="text"
                  placeholder="e.g. Lipid Profile & Echo Review"
                  value={newFollowup.reason}
                  onChange={(e) => setNewFollowup({ ...newFollowup, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommended Tests</label>
                <input
                  type="text"
                  placeholder="e.g. Lipid Profile, 2D Echo"
                  value={newFollowup.recommendedTests}
                  onChange={(e) => setNewFollowup({ ...newFollowup, recommendedTests: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions for Patient</label>
                <input
                  type="text"
                  placeholder="e.g. Fasting 8 hrs prior"
                  value={newFollowup.instructions}
                  onChange={(e) => setNewFollowup({ ...newFollowup, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddFollowup(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
