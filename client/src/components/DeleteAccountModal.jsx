import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertTriangle, X, ShieldAlert, Trash2 } from 'lucide-react';

export function DeleteAccountModal({ isOpen, onClose }) {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !user) return null;

  const isConfirmed = confirmText.trim() === 'DELETE' || confirmText.trim().toLowerCase() === user.email.toLowerCase();

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      await deleteAccount(confirmText.trim());
      onClose();
      navigate('/login?deactivated=true');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to deactivate account.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--medx-radius-lg, 12px)',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #FEE2E2',
            backgroundColor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>
                Deactivate & Delete Account
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
                Irreversible account deactivation
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#991B1B',
              padding: '0.35rem',
              borderRadius: '6px'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleDelete} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '6px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, marginTop: 0, marginBottom: '1rem' }}>
            You are about to permanently deactivate the account for <strong>{user.email}</strong>.
            You will be logged out immediately and will no longer be able to log in with these credentials.
          </p>

          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '0.875rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            color: '#92400E',
            lineHeight: 1.45
          }}>
            <strong>Clinical Data Preservation Notice:</strong> In compliance with medical record regulations and clinical audit standards, previously generated medical reports, doctor consultations, prescriptions, and critical incident logs remain securely archived in the clinical system and cannot be erased.
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              To confirm, please type <strong style={{ color: '#DC2626' }}>DELETE</strong> below:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="medx-input"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                fontSize: '0.875rem',
                borderColor: confirmText && !isConfirmed ? '#FCA5A5' : undefined
              }}
              autoFocus
            />
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #E2E8F0'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="medx-btn medx-btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || loading}
              style={{
                backgroundColor: isConfirmed ? '#DC2626' : '#FCA5A5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--medx-radius-md, 8px)',
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isConfirmed ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={16} />
              {loading ? 'Deactivating...' : 'Deactivate Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
