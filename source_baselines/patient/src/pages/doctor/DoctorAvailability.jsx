import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Plus, Trash2, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorAvailability() {
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/doctor/availability');
      if (res.data.success) {
        setWeeklyAvailability(res.data.weeklyAvailability || []);
      }
    } catch (err) {
      console.error('Failed to load availability', err);
      setMessage({ type: 'danger', text: 'Failed to load availability slots.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex) => {
    const existing = weeklyAvailability.find(a => a.dayOfWeek === dayIndex);
    if (existing) {
      setWeeklyAvailability(weeklyAvailability.map(a => 
        a.dayOfWeek === dayIndex ? { ...a, isAvailable: !a.isAvailable } : a
      ));
    } else {
      setWeeklyAvailability([
        ...weeklyAvailability,
        { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00', isAvailable: true }
      ]);
    }
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setWeeklyAvailability(weeklyAvailability.map(a => 
      a.dayOfWeek === dayIndex ? { ...a, [field]: value } : a
    ));
  };

  const handleRemoveSlot = (dayIndex) => {
    setWeeklyAvailability(weeklyAvailability.filter(a => a.dayOfWeek !== dayIndex));
  };

  const handleAddSlot = (dayIndex) => {
    if (!weeklyAvailability.some(a => a.dayOfWeek === dayIndex)) {
      setWeeklyAvailability([
        ...weeklyAvailability,
        { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00', isAvailable: true }
      ]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await axios.put('/api/doctor/availability', { weeklyAvailability });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Schedule & availability successfully saved!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update schedule.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted">
        <RefreshCw className="animate-spin mr-2" size={20} /> Loading schedule...
      </div>
    );
  }

  return (
    <div className="doctor-availability-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="text-primary" /> Weekly Practice Hours & Availability
          </h1>
          <p className="text-muted text-sm mt-1">
            Configure your active clinical hours for patient triage and on-demand appointments.
          </p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          Save Hours
        </button>
      </div>

      {message.text && (
        <div className={`badge badge-${message.type} p-4 mb-6 flex items-center gap-2 w-full`} style={{ borderRadius: 'var(--radius-md)' }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header border-b border-white-10 pb-4 mb-4 flex items-center justify-between">
          <span className="font-semibold text-sm uppercase tracking-wider text-muted">Clinical Day</span>
          <span className="font-semibold text-sm uppercase tracking-wider text-muted">Duty Timings</span>
          <span className="font-semibold text-sm uppercase tracking-wider text-muted">Status / Action</span>
        </div>

        <div className="flex flex-col gap-4">
          {DAYS.map((dayName, idx) => {
            const slot = weeklyAvailability.find(a => a.dayOfWeek === idx);
            const isConfigured = !!slot;
            const isActive = slot?.isAvailable;

            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 rounded-lg transition-all"
                style={{
                  background: isConfigured && isActive ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: isConfigured && isActive ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid var(--border-color)'
                }}
              >
                <div className="flex items-center gap-3" style={{ minWidth: '160px' }}>
                  <Calendar size={18} className={isConfigured && isActive ? 'text-primary' : 'text-muted'} />
                  <div>
                    <span className="font-medium text-white">{dayName}</span>
                    <div className="text-xs text-muted">
                      {isConfigured && isActive ? 'Active for consultations' : 'Off-duty / Closed'}
                    </div>
                  </div>
                </div>

                {isConfigured ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">From:</span>
                      <input 
                        type="time" 
                        className="input-field" 
                        style={{ padding: '0.4rem 0.6rem', width: '130px' }}
                        value={slot.startTime || '09:00'}
                        disabled={!isActive}
                        onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">To:</span>
                      <input 
                        type="time" 
                        className="input-field" 
                        style={{ padding: '0.4rem 0.6rem', width: '130px' }}
                        value={slot.endTime || '17:00'}
                        disabled={!isActive}
                        onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-muted text-sm italic">No working hours scheduled</span>
                )}

                <div className="flex items-center gap-3">
                  {isConfigured ? (
                    <>
                      <button 
                        type="button"
                        className={`badge ${isActive ? 'badge-success' : 'badge-neutral'} cursor-pointer`}
                        onClick={() => handleToggleDay(idx)}
                      >
                        {isActive ? 'Available' : 'Paused'}
                      </button>
                      <button 
                        type="button"
                        className="text-muted hover:text-red-400 p-2"
                        title="Remove Day"
                        onClick={() => handleRemoveSlot(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button"
                      className="btn btn-secondary text-xs flex items-center gap-1"
                      onClick={() => handleAddSlot(idx)}
                    >
                      <Plus size={14} /> Add Hours
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
