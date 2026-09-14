import React, { useState } from 'react';
import { X, Video, User, FileText, CheckCircle2, Mic, MicOff, Camera, PhoneOff, AlertCircle } from 'lucide-react';

export default function StartConsultationModal({ appointment, patient, onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState('video');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  if (!appointment) return null;

  const handleFinish = () => {
    onComplete({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      diagnosis,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-purple-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Clinical Consultation: {appointment.patientName}</span>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-purple-800 text-purple-200 border border-purple-600">
                  {appointment.mode}
                </span>
              </h3>
              <p className="text-xs text-purple-200">Patient ID: {appointment.patientId} • Age: {appointment.age} ({appointment.gender})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[480px]">
          
          {/* Main Video / Telehealth Window */}
          <div className="md:col-span-7 bg-slate-950 relative flex flex-col items-center justify-center p-6 text-white">
            {appointment.mode === 'Online' ? (
              <div className="w-full h-full min-h-[320px] rounded-2xl overflow-hidden relative bg-slate-900 flex items-center justify-center border border-slate-800">
                {patient?.photo ? (
                  <img
                    src={patient.photo}
                    alt={appointment.patientName}
                    className={`w-full h-full object-cover ${isVideoOff ? 'filter blur-md opacity-30' : ''}`}
                  />
                ) : (
                  <User className="w-24 h-24 text-slate-700" />
                )}

                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{appointment.patientName} (Live)</span>
                </div>

                <div className="absolute bottom-4 right-4 w-28 h-20 rounded-xl overflow-hidden border-2 border-purple-500 bg-slate-800 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"
                    alt="Dr. Vance"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 text-[9px] bg-black/70 px-1 rounded text-white">Dr. Vance</div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    title="End Call"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[320px] rounded-2xl bg-purple-900/20 border border-purple-800/40 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <User className="w-16 h-16 text-purple-400" />
                <h4 className="text-lg font-bold text-white">In-Person Consultation Workstation</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Patient is present in person at your clinical desk. Log clinical findings, diagnosis, and notes on the right panel.
                </p>
              </div>
            )}
          </div>

          {/* Right Clinical Notes & Prescribing Drawer */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-4 bg-white border-l border-slate-100 text-xs">
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-purple-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Consultation Log & Clinical Findings</span>
              </h4>

              <div className="space-y-1">
                <label className="form-label">Primary Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Essential Hypertension / Type 2 Diabetes"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="space-y-1">
                <label className="form-label">Clinical Observations & Advice</label>
                <textarea
                  rows={6}
                  placeholder="Enter clinical notes, patient complaints, vitals, and prescribed regimen..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="btn btn-primary btn-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Consultation</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
