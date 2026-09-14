import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
  Heart,
  Plus,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Video,
  Trash2,
  X,
  UserPlus,
  CheckCircle2,
  Activity,
  SlidersHorizontal
} from 'lucide-react';

export default function MyPatients({
  patients = [],
  onViewPatient,
  onMessagePatient,
  onViewMedicalHistory,
  onStartConsultation,
  onCallPatient,
  onAddPatient,
  onDeletePatient
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Dynamic Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetPatient, setDeleteTargetPatient] = useState(null);

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 ',
    email: '',
    currentCondition: 'Routine Health Monitoring & Vitals Check',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    allergy: '',
    emergencyContact: '+91 98112 34567'
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterQuery, statusFilter, genderFilter, pageSize]);

  const filteredPatients = patients.filter(p => {
    const query = filterQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.id && p.id.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.currentCondition && p.currentCondition.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;

    return matchesQuery && matchesStatus && matchesGender;
  });

  const isShowAll = pageSize === 'All';
  const numericPageSize = isShowAll ? filteredPatients.length || 1 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / numericPageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * numericPageSize;
  const endIndex = isShowAll ? filteredPatients.length : startIndex + numericPageSize;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const handleSaveNewPatient = (e) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const newRecord = {
      id: `PX-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newPatientForm.name.trim(),
      age: Number(newPatientForm.age) || 30,
      gender: newPatientForm.gender,
      bloodGroup: newPatientForm.bloodGroup,
      phone: newPatientForm.phone.trim() || '+91 98112 34567',
      email: newPatientForm.email.trim() || `${newPatientForm.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      currentCondition: newPatientForm.currentCondition.trim() || 'General Consultation',
      status: newPatientForm.status,
      photo: newPatientForm.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: 'Not Scheduled',
      alertFlags: newPatientForm.allergy ? { allergy: newPatientForm.allergy } : null,
      emergencyPhone: newPatientForm.emergencyContact,
      prescriptions: [],
      clinicalNotes: [],
      labReports: []
    };

    if (onAddPatient) {
      onAddPatient(newRecord);
    }

    setShowAddModal(false);
    setNewPatientForm({
      name: '',
      age: 38,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 ',
      email: '',
      currentCondition: 'Routine Health Monitoring & Vitals Check',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      allergy: '',
      emergencyContact: '+91 98112 34567'
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetPatient) return;
    if (onDeletePatient) {
      onDeletePatient(deleteTargetPatient.id);
    }
    setDeleteTargetPatient(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600" />
            <span>My Patients Directory</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Total <strong className="text-slate-900 font-bold">{patients.length}</strong> patients enrolled under your clinical care
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge badge-primary">
            {filteredPatients.length} Active Results
          </span>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, condition, phone..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="form-control pl-10"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control font-bold"
            >
              <option value="All">All Patient Status</option>
              <option value="Active">Active Care</option>
              <option value="Critical">Critical High-Risk</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="form-control font-bold"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="form-control font-bold"
              title="Select Records Per Page"
            >
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={50}>50 / page</option>
              <option value="All">Show All</option>
            </select>
          </div>

        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPatients.length > 0 ? (
          paginatedPatients.map((patient) => (
            <div key={patient.id} className="job-card flex flex-col justify-between space-y-4">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                      alt={patient.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-xs flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight">{patient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        ID: <strong className="font-mono text-slate-800">{patient.id}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {patient.age} Yrs • {patient.gender} • Blood: <strong className="text-purple-700 font-bold">{patient.bloodGroup}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`badge ${
                    patient.status === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'badge-primary'
                  }`}>
                    {patient.status}
                  </span>
                </div>

                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-xs space-y-1">
                  <span className="font-bold text-purple-900 block text-[11px]">Current Clinical Condition:</span>
                  <p className="text-slate-800 font-medium line-clamp-2">{patient.currentCondition || 'General Clinical Observation'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block font-medium">Last Visit</span>
                    <strong className="text-slate-800">{patient.lastVisit || 'Today'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Next Visit</span>
                    <strong className="text-purple-700">{patient.nextAppointment ? String(patient.nextAppointment).split(' ')[0] : 'None'}</strong>
                  </div>
                </div>

                {patient.alertFlags?.allergy && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span className="truncate">Allergy: {patient.alertFlags.allergy}</span>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-5 gap-1">
                <button
                  onClick={() => onViewPatient(patient)}
                  className="btn btn-primary btn-sm"
                >
                  Profile
                </button>

                <button
                  onClick={() => onStartConsultation && onStartConsultation(null, patient)}
                  className="btn btn-outline btn-sm"
                  title="Start Telehealth Video Call"
                >
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                </button>

                <button
                  onClick={() => onCallPatient && onCallPatient(patient)}
                  className="btn btn-success btn-sm"
                  title="Call Patient Phone"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onMessagePatient(patient)}
                  className="btn btn-outline btn-sm"
                  title="Open Chat Messages"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                </button>

                <button
                  onClick={() => setDeleteTargetPatient(patient)}
                  className="btn btn-danger btn-sm"
                  title="Delete Patient Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm space-y-2">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-base">No patient records found</p>
            <p className="text-xs text-slate-500">No records match your selected search or filter criteria.</p>
            <button
              onClick={() => { setFilterQuery(''); setStatusFilter('All'); setGenderFilter('All'); }}
              className="btn btn-primary btn-sm mt-2"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredPatients.length > 0 && !isShowAll && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-purple-100 shadow-2xs text-xs">
          
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{startIndex + 1}–{Math.min(endIndex, filteredPatients.length)}</strong> of <strong className="text-slate-900 font-bold">{filteredPatients.length}</strong> Patient Records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl font-bold transition-all ${
                  validCurrentPage === pageNum
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-purple-50 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ADD NEW PATIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-purple-100 overflow-hidden my-8">
            
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Enroll New Patient Record</h3>
                  <p className="text-xs text-purple-200 font-medium">Add patient into your clinical directory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPatient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="form-label">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Roy"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label">Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="form-control"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="form-label">Blood Group</label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                    className="form-control"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="form-label">Current Clinical Condition / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Type 2 Diabetes Monitoring"
                    value={newPatientForm.currentCondition}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, currentCondition: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Enroll Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetPatient && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-rose-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Delete Patient Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>{deleteTargetPatient.name}</strong> ({deleteTargetPatient.id})? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetPatient(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-danger btn-sm"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
