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
  Database,
  CheckCircle2
} from 'lucide-react';
import { HeroCarousel } from './landing/HeroCarousel.jsx';
import { CoverageSection } from './landing/CoverageSection.jsx';
import { HowItWorksSection } from './landing/HowItWorksSection.jsx';
import { ContactSection } from './landing/ContactSection.jsx';
import '../styles/landing.css';

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
      badge: 'Personal Health',
      icon: Activity,
      color: '#1D4ED8',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      description: 'Upload reports, track longitudinal biomarker trends, consult attending physicians, and access emergency SOS.'
    },
    {
      id: 'doctor',
      name: 'Doctor Workstation',
      badge: 'Clinical Workstation',
      icon: Stethoscope,
      color: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      description: 'Triage patient queue, author structured prescriptions, respond to emergency alarms, and dispatch ambulances.'
    },
    {
      id: 'hospital_admin',
      name: 'Hospital Operations',
      badge: 'Operational Control',
      icon: Building2,
      color: '#7E22CE',
      bg: '#FAF5FF',
      border: '#E9D5FF',
      description: 'Manage bed and ICU occupancy, coordinate staff rosters, oversee departmental triage, and audit inpatient cases.'
    },
    {
      id: 'lab_admin',
      name: 'Diagnostic Laboratory',
      badge: 'Diagnostic Precision',
      icon: FlaskConical,
      color: '#C2410C',
      bg: '#FFF7ED',
      border: '#FED7AA',
      description: 'Ingest laboratory panels, verify clinical biomarker values, and digitally sign off on diagnostic authenticity.'
    }
  ];

  return (
    <div className="landing-page" style={{ paddingBottom: '4rem' }}>
      {/* Restored Multi-Banner Hero Carousel */}
      <HeroCarousel />

      <div className="landing-container">
        {/* Four Dedicated Healthcare Workspaces */}
        <section style={{ padding: '3.5rem 0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--medx-primary-light)',
              color: 'var(--medx-primary)',
              padding: '0.375rem 1rem',
              borderRadius: 'var(--medx-radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>
              <ShieldCheck size={16} /> Four Authentic Workspaces
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
              Tailored for Every Healthcare Stakeholder
            </h2>
            <p style={{ color: 'var(--medx-text-secondary)', maxWidth: '680px', margin: '0.75rem auto 0', fontSize: '1rem', lineHeight: 1.6 }}>
              A cohesive product DNA with specialized workstations designed for patients, attending physicians, hospital operations, and diagnostic pathology.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem'
          }}>
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.id}
                  className="medx-card medx-card-hover stat-card-glow"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `1px solid ${r.border}`,
                    borderRadius: 'var(--medx-radius-lg)',
                    padding: '1.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{
                        backgroundColor: r.bg,
                        color: r.color,
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--medx-radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${r.color}15`
                      }}>
                        <Icon size={26} />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: r.bg,
                        color: r.color,
                        padding: '0.25rem 0.625rem',
                        borderRadius: 'var(--medx-radius-full)',
                        border: `1px solid ${r.border}`
                      }}>
                        {r.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--medx-navy)' }}>
                      {r.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--medx-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {r.description}
                    </p>
                  </div>

                  <Link
                    to={`/login?role=${r.id}`}
                    className="medx-btn medx-btn-outline"
                    style={{
                      width: '100%',
                      fontSize: '0.9rem',
                      borderColor: r.color,
                      color: r.color
                    }}
                  >
                    Enter Workspace <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5 Core Healthcare Problems Section */}
        <section
          id="problems"
          style={{
            backgroundColor: 'var(--medx-surface)',
            border: '1px solid var(--medx-border)',
            borderRadius: 'var(--medx-radius-xl)',
            padding: '3.5rem 2.5rem',
            boxShadow: 'var(--medx-shadow-sm)',
            marginTop: '1.5rem'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--medx-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'inline-block',
              marginBottom: '0.5rem'
            }}>
              Problem Space Resolution
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
              Five Core Healthcare Challenges Solved by Med-X
            </h2>
            <p style={{ color: 'var(--medx-text-secondary)', maxWidth: '680px', margin: '0.75rem auto 0', fontSize: '1rem', lineHeight: 1.6 }}>
              Directly addressing the critical bottlenecks identified in modern clinical operations and emergency medical care.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {problems.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1.75rem',
                    borderRadius: 'var(--medx-radius-lg)',
                    backgroundColor: 'var(--medx-surface-muted)',
                    border: '1px solid var(--medx-border)',
                    transition: 'all var(--medx-transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    <div style={{
                      backgroundColor: 'var(--medx-primary-light)',
                      color: 'var(--medx-primary)',
                      padding: '0.625rem',
                      borderRadius: 'var(--medx-radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={22} />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                      {p.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--medx-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Restored Editorial Coverage Ecosystem Canvas */}
        <CoverageSection />

        {/* Restored Progressive How-It-Works Journey Rail */}
        <HowItWorksSection />

        {/* Restored Institutional Inquiry & Brand Climax Channel */}
        <ContactSection />
      </div>
    </div>
  );
}

export default LandingPage;
