import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Building2,
  Sparkles,
  Smartphone,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function ReceptionQRModal({ isOpen, onClose, doctorName, department }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const checkInUrl = `${window.location.origin}/check-in`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(checkInUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [isOpen, checkInUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div
        className="medx-card reception-standee-modal"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2rem',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B'
          }}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Printable Standee Content */}
        <div id="reception-standee-printable" style={{ textAlign: 'center' }}>
          {/* Hospital Header */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Building2 size={20} color="#2563EB" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.05em', color: '#2563EB', textTransform: 'uppercase' }}>
              Med-X Metro Super Specialty Teaching Hospital
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--medx-navy)', margin: '0.25rem 0' }}>
            Outpatient Self Check-In Kiosk
          </h2>

          {doctorName && (
            <div style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', fontWeight: 600, marginBottom: '1rem' }}>
              Attending: <strong style={{ color: 'var(--medx-navy)' }}>{doctorName}</strong> {department ? `• ${department}` : ''}
            </div>
          )}

          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
            Scan this QR code with your mobile phone camera upon reaching the clinic lobby to confirm your arrival and get your live queue token.
          </p>

          {/* QR Code Container */}
          <div style={{
            display: 'inline-block',
            padding: '1rem',
            backgroundColor: '#FFFFFF',
            border: '3px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            marginBottom: '1.25rem'
          }}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Hospital Self Check-In QR Code"
                style={{ width: '240px', height: '240px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={48} color="#94A3B8" />
              </div>
            )}
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginTop: '0.5rem', letterSpacing: '0.03em' }}>
              SCAN TO CHECK IN & GET TOKEN
            </div>
          </div>

          {/* 3 Step Instructions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563EB', fontWeight: 800, fontSize: '0.8125rem' }}>
                <Smartphone size={15} /> Step 1
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                Scan QR code with phone camera
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontWeight: 800, fontSize: '0.8125rem' }}>
                <ShieldCheck size={15} /> Step 2
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                Sign in & enter Appointment ID
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', fontWeight: 800, fontSize: '0.8125rem' }}>
                <Clock size={15} /> Step 3
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                Get Live Token & wait in lobby
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="medx-btn medx-btn-secondary"
              onClick={handleCopyLink}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {copied ? <Check size={15} color="#16A34A" /> : <Copy size={15} />}
              {copied ? 'Link Copied!' : 'Copy Portal URL'}
            </button>

            <a
              href={checkInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="medx-btn medx-btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            >
              <ExternalLink size={15} />
              Open Portal
            </a>

            <button
              type="button"
              className="medx-btn medx-btn-primary"
              onClick={handlePrint}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} />
              Print Standee
            </button>
          </div>

          <div style={{ fontSize: '0.71875rem', color: '#94A3B8', marginTop: '1rem' }}>
            Check-in destination: <code style={{ backgroundColor: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{checkInUrl}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
