import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Phone
} from 'lucide-react';

export default function AppointmentsView({
  appointments,
  patients,
  onViewPatient,
  onStartConsultation,
  onRescheduleAppointment,
  onCancelAppointment,
  onAcceptAppointment,
  onCallPatient
}) {
  const [activeTab, setActiveTab] = useState('Today');
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'Today') return apt.date === '2026-08-25';
    if (activeTab === 'Upcoming') return apt.status === 'Confirmed' || apt.status === 'Pending';
    if (activeTab === 'Completed') return apt.status === 'Completed';
    if (activeTab === 'Cancelled') return apt.status === 'Cancelled';
    return true;
  });

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate) return;

    onRescheduleAppointment(showRescheduleModal.id, rescheduleDate, rescheduleTime);
    setShowRescheduleModal(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span>Appointment Workspace</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Schedule, manage, start consultation, and review patient appointments
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full text-xs font-semibold overflow-x-auto">
          {['Today', 'Upcoming', 'Completed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full transition-all border-none ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const matchedPatient = patients.find(p => p.id === apt.patientId) || {
              id: apt.patientId,
              name: apt.patientName,
              age: apt.age,
              gender: apt.gender,
              photo: apt.photo,
              bloodGroup: 'B+',
              currentCondition: apt.reason
            };

            return (
              <div key={apt.id} className="job-card flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
                
                {/* Patient & Time Details */}
                <div className="flex items-center gap-4">
                  <img
                    src={apt.photo}
                    alt={apt.patientName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900">{apt.patientName}</h3>
                      <span className="badge badge-primary font-mono">
                        {apt.patientId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {apt.age} Yrs • {apt.gender} • <strong className="text-slate-800">{apt.type}</strong>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-medium bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 inline-block">
                      Reason: {apt.reason}
                    </p>
                  </div>
                </div>

                {/* Status & Mode */}
                <div className="flex flex-col md:items-end justify-center space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      ⏰ {apt.time} ({apt.date})
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      apt.mode === 'Online' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {apt.mode}
                    </span>
                  </div>
                  <span className={`badge ${
                    apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    apt.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                    apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    Status: {apt.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                  <button
                    onClick={() => onViewPatient(matchedPatient)}
                    className="btn btn-outline btn-sm"
                  >
                    View Patient
                  </button>

                  {apt.status === 'Pending' && (
                    <button
                      onClick={() => onAcceptAppointment(apt.id)}
                      className="btn btn-success btn-sm"
                    >
                      Accept
                    </button>
                  )}

                  {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                    <>
                      <button
                        onClick={() => onStartConsultation(apt, matchedPatient)}
                        className="btn btn-primary btn-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Consultation</span>
                      </button>

                      <button
                        onClick={() => onCallPatient ? onCallPatient(matchedPatient) : window.open(`tel:${matchedPatient.phone || '+919811234567'}`)}
                        className="btn btn-success btn-sm"
                        title="Call Patient Phone"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>

                      <button
                        onClick={() => setShowRescheduleModal(apt)}
                        className="btn btn-outline btn-sm"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => onCancelAppointment(apt.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No appointments found under tab "{activeTab}".
          </div>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Reschedule Appointment with {showRescheduleModal.patientName}
            </h3>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="form-label">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="form-label">New Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="form-control"
                >
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
