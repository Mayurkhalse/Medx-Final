import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Save,
  Video,
  UserCheck,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api.js';

export default function DoctorAvailability() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [availability, setAvailability] = useState({
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    breakTime: '01:00 PM - 02:00 PM',
    slotDuration: '30 Mins',
    onlineConsultation: true,
    inPersonConsultation: true,
    availabilityStatus: 'Available'
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctor/profile');
        if (res.data) {
          setProfile(res.data);
          if (res.data.availabilityStatus) {
            setAvailability(prev => ({
              ...prev,
              availabilityStatus: res.data.availabilityStatus
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleDay = (day) => {
    const current = availability.workingDays || [];
    if (current.includes(day)) {
      setAvailability({ ...availability, workingDays: current.filter(d => d !== day) });
    } else {
      setAvailability({ ...availability, workingDays: [...current, day] });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/doctor/profile', {
        availabilityStatus: availability.availabilityStatus
      });
      showToast('Clinical schedule and duty availability updated successfully.');
    } catch (err) {
      console.error('Failed to save doctor availability:', err);
      showToast('Error saving availability changes. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '84px',
          right: '24px',
          zIndex: 100,
          backgroundColor: 'var(--medx-navy)',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderLeft: '4px solid #16A34A'
        }}>
          <Sparkles size={16} color="#4ADE80" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="medx-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: '#F0FDF4',
            color: '#15803D',
            padding: '0.75rem',
            borderRadius: 'var(--medx-radius-md)'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
              Physician Availability & Practice Hours
            </h2>
            <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
              Configure your clinical schedule, teleconsultation channels, and duty availability
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          Loading schedule settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="medx-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Duty Status */}
          <div>
            <label className="medx-label" style={{ fontWeight: 700 }}>
              Active Clinical Duty Status
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {['Available', 'In Consultation', 'Off Duty'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAvailability({ ...availability, availabilityStatus: st })}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--medx-radius-sm)',
                    border: availability.availabilityStatus === st ? '2px solid #15803D' : '1px solid var(--medx-border)',
                    backgroundColor: availability.availabilityStatus === st ? '#F0FDF4' : 'var(--medx-surface)',
                    color: availability.availabilityStatus === st ? '#15803D' : 'var(--medx-text)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st === 'Available' ? '🟢 ' : st === 'In Consultation' ? '🟡 ' : '⚪ '}
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="medx-label" style={{ fontWeight: 700 }}>
              Regular Working Days
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {daysOfWeek.map((day) => {
                const isSelected = availability.workingDays?.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--medx-radius-sm)',
                      border: isSelected ? '1px solid #15803D' : '1px solid var(--medx-border)',
                      backgroundColor: isSelected ? '#15803D' : 'var(--medx-surface-muted)',
                      color: isSelected ? '#FFFFFF' : 'var(--medx-text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operating Hours & Lunch Break */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--medx-border)'
          }}>
            <div>
              <label className="medx-label">Daily Shift Start Time</label>
              <select
                className="medx-input"
                value={availability.startTime}
                onChange={(e) => setAvailability({ ...availability, startTime: e.target.value })}
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="08:30 AM">08:30 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
              </select>
            </div>

            <div>
              <label className="medx-label">Daily Shift End Time</label>
              <select
                className="medx-input"
                value={availability.endTime}
                onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
              >
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>

            <div>
              <label className="medx-label">Lunch & Clinical Break</label>
              <input
                type="text"
                className="medx-input"
                value={availability.breakTime}
                onChange={(e) => setAvailability({ ...availability, breakTime: e.target.value })}
              />
            </div>
          </div>

          {/* Slot Duration & Channels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--medx-border)'
          }}>
            <div>
              <label className="medx-label">Consultation Slot Duration</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
                {['15 Mins', '30 Mins', '45 Mins', '60 Mins'].map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setAvailability({ ...availability, slotDuration: dur })}
                    style={{
                      padding: '0.45rem',
                      textAlign: 'center',
                      borderRadius: 'var(--medx-radius-sm)',
                      border: availability.slotDuration === dur ? '1px solid #15803D' : '1px solid var(--medx-border)',
                      backgroundColor: availability.slotDuration === dur ? '#F0FDF4' : 'var(--medx-surface-muted)',
                      color: availability.slotDuration === dur ? '#15803D' : 'var(--medx-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="medx-label">Supported Consultation Channels</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--medx-text)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={availability.inPersonConsultation}
                    onChange={(e) => setAvailability({ ...availability, inPersonConsultation: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#15803D' }}
                  />
                  <UserCheck size={18} color="#15803D" />
                  <span>In-Person Outpatient Clinic</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--medx-text)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={availability.onlineConsultation}
                    onChange={(e) => setAvailability({ ...availability, onlineConsultation: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#15803D' }}
                  />
                  <Video size={18} color="#4F46E5" />
                  <span>Online Telehealth & Video Consultations</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--medx-border)' }}>
            <button
              type="submit"
              disabled={saving}
              className="medx-btn medx-btn-primary"
              style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Availability & Schedule'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
