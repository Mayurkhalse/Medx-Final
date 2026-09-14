import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Save, Check } from 'lucide-react';

const HospitalProfile = () => {
  const { token, API_HOST } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/hospital/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data) {
          setProfile(data);
          setName(data.name || '');
          setAddress(data.address || '');
          setPhone(data.contactPhone || '');
          setEmail(data.contactEmail || '');
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (token) fetchProfile();
  }, [token, API_HOST]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);

    try {
      const res = await fetch(`${API_HOST}/api/hospital/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, address, contactPhone: phone, contactEmail: email })
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={28} color="var(--accent-1)" />
          Hospital Profile & Facility Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Official institutional identification, primary contact points, and licensing details
        </p>
      </div>

      {saved && (
        <div style={{ backgroundColor: 'var(--flag-success-light)', color: 'var(--flag-success)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} />
          <span>Hospital profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Facility / Hospital Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Facility Address</label>
          <input
            type="text"
            className="form-input"
            placeholder="100 Medical Center Parkway, Suite 400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Contact Telephone</label>
            <input
              type="text"
              className="form-input"
              placeholder="+1 (555) 234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Official Contact Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Institution ID: <code>{profile?._id || '--'}</code>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Save size={16} />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalProfile;
