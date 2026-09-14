import React from 'react';
import { X, Printer, Pill, Download, Heart, ShieldCheck } from 'lucide-react';

export default function PrescriptionSlipModal({ prescription, patient, doctorProfile, onClose }) {
  if (!prescription) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-purple-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Prescription Slip #{prescription.id}</h3>
              <p className="text-xs text-purple-200">Date: {prescription.date} • Prescribed by {prescription.doctor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn btn-primary btn-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Rx</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Paper Pad */}
        <div className="p-8 bg-purple-50/20 max-h-[75vh] overflow-y-auto">
          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm space-y-6 text-slate-800 font-sans">
            
            {/* Header / Doctor Pad */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{doctorProfile?.name || 'Dr. Rahul Vance'}</h2>
                <p className="text-xs font-semibold text-purple-700">{doctorProfile?.title || 'MD, DM Cardiology'}</p>
                <p className="text-xs text-slate-500">{doctorProfile?.hospital || 'MedX Super Speciality Hospital'}</p>
                <p className="text-[11px] text-slate-400">Phone: {doctorProfile?.phone} • Email: {doctorProfile?.email}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-purple-600 font-extrabold text-xl justify-end">
                  <span>Med</span><span className="text-slate-900">X</span>
                  <Heart className="w-5 h-5 fill-purple-600 text-purple-600" />
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">Rx ID: {prescription.id}</p>
                <p className="text-xs font-medium text-slate-700">Date: {prescription.date}</p>
              </div>
            </div>

            {/* Patient Header Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-purple-50/30 rounded-xl text-xs border border-purple-100">
              <div>
                <span className="text-slate-400 block font-medium">Patient Name</span>
                <span className="font-bold text-slate-900">{patient?.name || 'Patient'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Age / Gender</span>
                <span className="font-bold text-slate-900">{patient?.age} Yrs / {patient?.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Patient ID</span>
                <span className="font-bold text-slate-900">{patient?.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-bold text-slate-900">{patient?.bloodGroup}</span>
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-100 text-xs">
                <span className="font-bold text-purple-900 block">Diagnosis / Clinical Condition:</span>
                <span className="text-slate-800 font-medium">{prescription.diagnosis}</span>
              </div>
            )}

            {/* Rx Medicine Table */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-purple-700">
                <span className="text-2xl font-serif font-black italic">Rx</span>
                <span className="text-xs font-semibold text-slate-500">Prescribed Medications</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/40 text-slate-700 font-bold border-b border-purple-100">
                    <tr>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescription.medicines?.map((med, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/20">
                        <td className="p-3 font-bold text-slate-900">{med.name}</td>
                        <td className="p-3 font-medium text-slate-700">{med.dosage}</td>
                        <td className="p-3 font-medium text-purple-700 bg-purple-50/50">{med.frequency}</td>
                        <td className="p-3 font-medium text-slate-700">{med.duration}</td>
                        <td className="p-3 text-slate-600">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Doctor Notes */}
            {prescription.notes && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Advice & Dietary Instructions:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                  "{prescription.notes}"
                </p>
              </div>
            )}

            {/* Doctor Signature */}
            <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>MedX Authenticated E-Prescription</span>
              </div>
              <div className="text-right space-y-1">
                <div className="w-32 h-10 border-b border-slate-400 ml-auto flex items-center justify-center font-serif text-slate-700 italic font-bold">
                  Dr. Rahul Vance
                </div>
                <p className="font-bold text-slate-900 text-xs">Signature & Registration No.</p>
                <p className="text-[10px] text-slate-400">Reg No: MCI-54912-A</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close Prescription
          </button>
        </div>

      </div>
    </div>
  );
}
