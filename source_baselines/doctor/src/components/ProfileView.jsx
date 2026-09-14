import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Award, Stethoscope, Edit3, X, Save, Star, ShieldCheck } from 'lucide-react';

export default function ProfileView({ doctorProfile, onUpdateDoctorProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...doctorProfile });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateDoctorProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600" />
            <span>My Doctor Profile</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your professional credentials, hospital affiliation, and contact details
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ ...doctorProfile });
            setIsEditing(true);
          }}
          className="btn btn-primary btn-sm"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="card p-8 space-y-8 bg-white">
        
        {/* Top Profile Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-8 text-center sm:text-left">
          <img
            src={doctorProfile.photo}
            alt={doctorProfile.name}
            className="w-28 h-28 rounded-3xl object-cover border-4 border-purple-200 shadow-md"
          />
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                  <span>{doctorProfile.name}</span>
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </h2>
                <p className="text-sm font-bold text-purple-700">{doctorProfile.title}</p>
                <p className="text-xs text-slate-500 font-medium">{doctorProfile.specialty}</p>
              </div>

              <div className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100 text-center sm:text-right">
                <span className="text-xs font-bold text-slate-500 block">Consultation Fee</span>
                <span className="text-lg font-black text-purple-900">{doctorProfile.consultationFee}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
              <span>🏥 {doctorProfile.hospital}</span>
              <span>• Experience: <strong>{doctorProfile.experienceYears} Years</strong></span>
              <span className="flex items-center gap-1 text-amber-600 font-bold"><Star className="w-3.5 h-3.5 fill-amber-500" /> {doctorProfile.rating} (4.8k Reviews)</span>
            </div>
          </div>
        </div>

        {/* Detailed Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              Contact & Affiliation
            </h3>
            
            <div className="p-3.5 bg-purple-50/40 rounded-xl space-y-2 border border-purple-100">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-purple-600" />
                <span>Phone: <strong className="text-slate-900 font-bold">{doctorProfile.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-purple-600" />
                <span>Email: <strong className="text-slate-900 font-bold">{doctorProfile.email}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Department: <strong className="text-slate-900 font-bold">{doctorProfile.department}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Languages: <strong className="text-slate-900 font-bold">{doctorProfile.languages?.join(', ')}</strong></span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              About Doctor & Clinical Expertise
            </h3>
            
            <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-100 text-slate-700 leading-relaxed italic">
              "{doctorProfile.about}"
            </div>
          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Doctor Profile</h3>
              <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="form-label">Doctor Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="form-label">Title & Qualifications</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="space-y-1">
                <label className="form-label">Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <label className="form-label">Consultation Fee</label>
                  <input
                    type="text"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="form-label">Hospital</label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="space-y-1">
                <label className="form-label">About Bio</label>
                <textarea
                  rows={3}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
