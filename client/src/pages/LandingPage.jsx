import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  BrainCircuit,
  Building2,
  FlaskConical,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Database
} from 'lucide-react';

export function LandingPage() {
  const problems = [
    {
      icon: Clock,
      title: '1. Fragmented Records & Delayed Emergency Care',
      description: 'Critical patient history and vital signs are scattered across disparate platforms, slowing emergency response and life-saving interventions.'
    },
    {
      icon: BrainCircuit,
      title: '2. Diagnostic Data Overload & Biomarker Complexity',
      description: 'Complex laboratory reports present hundreds of unstructured metrics without immediate clinical reference evaluation or multivariable risk stratification.'
    },
    {
      icon: HeartPulse,
      title: '3. Clinical Fatigue & Fragmented Workstations',
      description: 'Attending physicians must juggle disparate systems for consultation scheduling, prescription authoring, and triage prioritization.'
    },
    {
      icon: Building2,
      title: '4. Inefficient Hospital Bed & Resource Allocation',
      description: 'Institutional facilities lack real-time visibility into ICU availability, departmental balancing, and operational care queue throughput.'
    },
    {
      icon: Database,
      title: '5. Lack of Interoperability Across Facilities & Labs',
      description: 'Diagnostic labs, outpatient clinics, and tertiary hospitals operate in data silos, requiring repetitive testing and manual verification.'
    }
  ];

  const roles = [
    {
      id: 'patient',
      name: 'Patient Portal',
      icon: Activity,
      color: '#1D4ED8',
      bg: '#EFF6FF',
      description: 'Upload reports, track biomarker trends, consult attending physicians, and access emergency SOS.'
    },
    {
      id: 'doctor',
      name: 'Doctor Workstation',
      icon: Stethoscope,
      color: '#15803D',
      bg: '#F0FDF4',
      description: 'Triage patient queue, author structured prescriptions, respond to emergency alarms, and dispatch ambulances.'
    },
    {
      id: 'hospital_admin',
      name: 'Hospital Operations',
      icon: Building2,
      color: '#7E22CE',
      bg: '#FAF5FF',
      description: 'Manage bed and ICU occupancy, coordinate staff rosters, oversee departmental triage, and audit inpatient cases.'
    },
    {
      id: 'lab_admin',
      name: 'Diagnostic Laboratory',
      icon: FlaskConical,
      color: '#C2410C',
      bg: '#FFF7ED',
      description: 'Ingest laboratory panels, verify clinical biomarker values, and digitally sign off on diagnostic authenticity.'
    }
  ];

  return (
    <div className="medx-container">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 0 2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--medx-primary-light)',
          color: 'var(--medx-primary)',
          padding: '0.375rem 1rem',
          borderRadius: 'var(--medx-radius-full)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={16} /> Med-X Unified Healthcare Ecosystem
        </div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--medx-navy)',
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em'
        }}>
          One Unified Platform for <span style={{ color: 'var(--medx-primary)' }}>Patients</span>, <span style={{ color: '#15803D' }}>Clinicians</span> & <span style={{ color: '#7E22CE' }}>Hospitals</span>
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--medx-text-secondary)',
          maxWidth: '780px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Med-X integrates complete blood biomarker intelligence, clinical triage workflows, hospital bed operations, and diagnostic lab verification into a single, high-reliability platform.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/register" className="medx-btn medx-btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="medx-btn medx-btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Sign In to Workspace
          </Link>
        </div>
      </section>

      {/* Role Portals Grid */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem', color: 'var(--medx-navy)' }}>
          Four Dedicated Healthcare Workspaces
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.id} className="medx-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    backgroundColor: r.bg,
                    color: r.color,
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--medx-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--medx-navy)' }}>
                    {r.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {r.description}
                  </p>
                </div>
                <Link
                  to={`/login?role=${r.id}`}
                  className="medx-btn medx-btn-outline"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  Enter Portal <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5 Core Healthcare Problems Section */}
      <section style={{
        backgroundColor: 'var(--medx-surface)',
        border: '1px solid var(--medx-border)',
        borderRadius: 'var(--medx-radius-xl)',
        padding: '3rem 2rem',
        marginBottom: '3rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Problem Resolution
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--medx-navy)', marginTop: '0.5rem' }}>
            Five Core Healthcare Challenges Solved by Med-X
          </h2>
          <p style={{ color: 'var(--medx-text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0', fontSize: '0.9375rem' }}>
            Directly addressing the critical bottlenecks identified in modern clinical operations and emergency medical care.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} style={{
                padding: '1.5rem',
                borderRadius: 'var(--medx-radius-lg)',
                backgroundColor: 'var(--medx-bg)',
                border: '1px solid var(--medx-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    backgroundColor: 'var(--medx-primary-light)',
                    color: 'var(--medx-primary)',
                    padding: '0.5rem',
                    borderRadius: 'var(--medx-radius-md)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                    {p.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', lineHeight: 1.5 }}>
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
