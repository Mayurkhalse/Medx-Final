import React from 'react';
import { Link } from 'react-router-dom';

const patients = [
  ['PT-001', 'Alex Sharma', 'CBC processed', '22 Aug 2026', 'Updated'],
  ['PT-002', 'Priya Mehta', 'New laboratory report', '21 Aug 2026', 'New'],
  ['PT-003', 'Rahul Verma', 'Measurement changed', '20 Aug 2026', 'Review'],
  ['PT-004', 'Neha Kapoor', 'Report available', '19 Aug 2026', 'Updated']
];

const reports = [
  ['Alex Sharma', 'Complete Blood Count', '22 Aug 2026', 'Processed'],
  ['Priya Mehta', 'Comprehensive Metabolic Panel', '21 Aug 2026', 'New'],
  ['Rahul Verma', 'Lipid Profile', '20 Aug 2026', 'Review'],
  ['Neha Kapoor', 'Thyroid Panel', '19 Aug 2026', 'Processed']
];

const trends = [
  ['Alex Sharma', 'Hemoglobin', '13.6 g/dL', '+0.1 g/dL', 'Stable'],
  ['Priya Mehta', 'ALT', '36 U/L', '+4 U/L', 'Review'],
  ['Rahul Verma', 'Creatinine', '1.0 mg/dL', '+0.1 mg/dL', 'Review'],
  ['Neha Kapoor', 'TSH', '2.4 mIU/L', '-0.2 mIU/L', 'Stable']
];

const alerts = [
  ['Rahul Verma', 'Measurement changed', 'Recent observation differs from the previous value.', 'Review'],
  ['Priya Mehta', 'New report processed', 'A new laboratory report is available.', 'New'],
  ['Alex Sharma', 'Recent report available', 'Structured observations are ready for review.', 'Information']
];

const Header = ({ eyebrow, title, subtitle }) => (
  <>
    <div className="medx-page-header">
      <p className="medx-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="medx-subtitle">{subtitle}</p>
    </div>
  </>
);

const Stat = ({ label, value, detail }) => (
  <section className="medx-card">
    <p className="medx-eyebrow">{label}</p>
    <h2>{value}</h2>
    <p className="medx-muted">{detail}</p>
  </section>
);

const ProfessionalSection = ({ section }) => {
  const crumbs = {
    patients: 'Patient records',
    reports: 'Laboratory reports',
    monitoring: 'Health trends',
    alerts: 'Review queue',
    ask: 'Ask Med-X'
  };

  return (
    <div className="medx-page">

      <div className="medx-breadcrumb">
        <span>Med-X</span>
        <span>/</span>
        <span>Professional</span>
        <span>/</span>
        <strong>{crumbs[section]}</strong>
      </div>

      {section === 'patients' && (
        <>
          <Header
            eyebrow="PATIENT MANAGEMENT"
            title="Patient records"
            subtitle="Review patients, recent activity and available health information."
          />

          <div className="medx-card-grid">
            <Stat label="ACTIVE PATIENTS" value="24" detail="Patients in your workspace" />
            <Stat label="NEW ACTIVITY" value="6" detail="Updates since last review" />
            <Stat label="REPORTS" value="8" detail="Recently processed reports" />
          </div>

          <section className="medx-card medx-card-large">
            <div className="medx-page-header-row">
              <div>
                <p className="medx-eyebrow">RECENT PATIENT ACTIVITY</p>
                <h2>Patients requiring attention</h2>
              </div>
              <span className="medx-status-badge stable">Workspace active</span>
            </div>

            {patients.map(([id, name, activity, date, status]) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 20,
                  padding: '20px 0',
                  borderTop: '1px solid #eee'
                }}
              >
                <div>
                  <p className="medx-eyebrow">{id}</p>
                  <h3 style={{ margin: '4px 0' }}>{name}</h3>
                  <p className="medx-muted">{activity} · {date}</p>
                </div>

                <span className="medx-status-badge stable">{status}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {section === 'reports' && (
        <>
          <Header
            eyebrow="REPORT REVIEW"
            title="Laboratory reports"
            subtitle="Review recently processed laboratory information across your patients."
          />

          <div className="medx-card-grid">
            <Stat label="TOTAL REPORTS" value="38" detail="Available in workspace" />
            <Stat label="NEW" value="2" detail="Awaiting review" />
            <Stat label="PROCESSED" value="36" detail="Structured successfully" />
          </div>

          <section className="medx-card medx-card-large">
            <div className="medx-page-header-row">
              <div>
                <p className="medx-eyebrow">RECENT REPORTS</p>
                <h2>Report review queue</h2>
              </div>
              <span className="medx-status-badge stable">2 new</span>
            </div>

            {reports.map(([patient, type, date, status]) => (
              <div
                key={`${patient}-${type}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 0',
                  borderTop: '1px solid #eee'
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>{type}</h3>
                  <p className="medx-muted">{patient} · {date}</p>
                </div>
                <span className="medx-status-badge stable">{status}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {section === 'monitoring' && (
        <>
          <Header
            eyebrow="LONGITUDINAL MONITORING"
            title="Health trends"
            subtitle="Review meaningful changes in measurements across your patient workspace."
          />

          <div className="medx-card-grid">
            <Stat label="PATIENTS MONITORED" value="18" detail="With longitudinal observations" />
            <Stat label="CHANGES DETECTED" value="5" detail="Recent measurement changes" />
            <Stat label="STABLE" value="13" detail="No recent notable changes" />
          </div>

          <section className="medx-card medx-card-large">
            <div className="medx-page-header-row">
              <div>
                <p className="medx-eyebrow">RECENT CHANGES</p>
                <h2>Patient trends</h2>
              </div>
              <span className="medx-status-badge stable">Longitudinal view</span>
            </div>

            {trends.map(([patient, measurement, current, change, status]) => (
              <div
                key={`${patient}-${measurement}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                  gap: 20,
                  alignItems: 'center',
                  padding: '20px 0',
                  borderTop: '1px solid #eee'
                }}
              >
                <div>
                  <strong>{patient}</strong>
                  <p className="medx-muted">{measurement}</p>
                </div>
                <div><strong>{current}</strong></div>
                <div>{change}</div>
                <span className="medx-status-badge stable">{status}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {section === 'alerts' && (
        <>
          <Header
            eyebrow="PROFESSIONAL REVIEW"
            title="Review queue"
            subtitle="Review information Med-X has highlighted across your patient workspace."
          />

          <div className="medx-card-grid">
            <Stat label="TO REVIEW" value="3" detail="Items requiring attention" />
            <Stat label="NEW" value="2" detail="Recently added items" />
            <Stat label="INFORMATION" value="4" detail="Available updates" />
          </div>

          <section className="medx-card medx-card-large">
            <div className="medx-page-header-row">
              <div>
                <p className="medx-eyebrow">ATTENTION QUEUE</p>
                <h2>Recent alerts</h2>
              </div>
              <button type="button" className="btn btn-secondary">
                Mark reviewed
              </button>
            </div>

            {alerts.map(([patient, title, detail, level]) => (
              <div
                key={`${patient}-${title}`}
                style={{
                  padding: '22px 0',
                  borderTop: '1px solid #eee'
                }}
              >
                <div className="medx-page-header-row">
                  <div>
                    <p className="medx-eyebrow">{patient}</p>
                    <h3>{title}</h3>
                    <p className="medx-muted">{detail}</p>
                  </div>
                  <span className="medx-status-badge stable">{level}</span>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {section === 'ask' && (
        <>
          <Header
            eyebrow="MED-X INTELLIGENCE"
            title="Ask Med-X"
            subtitle="Explore available patient information through the Med-X assistance interface."
          />

          <section className="medx-card medx-card-large">
            <p className="medx-eyebrow">PROFESSIONAL ASSISTANCE</p>
            <h2>What would you like to review?</h2>
            <p className="medx-muted">
              Ask about structured information already available in a patient's record.
            </p>

            <div className="medx-card-grid" style={{ marginTop: 24 }}>
              <section className="medx-card">
                <p className="medx-eyebrow">RESULT</p>
                <h3>Explain a result</h3>
                <p className="medx-muted">
                  Understand an available laboratory observation and its context.
                </p>
                <button type="button" className="btn btn-secondary" disabled>
                  Coming soon
                </button>
              </section>

              <section className="medx-card">
                <p className="medx-eyebrow">TREND</p>
                <h3>Review a trend</h3>
                <p className="medx-muted">
                  Examine changes across longitudinal observations.
                </p>
                <button type="button" className="btn btn-secondary" disabled>
                  Coming soon
                </button>
              </section>

              <section className="medx-card">
                <p className="medx-eyebrow">SUMMARY</p>
                <h3>Summarize records</h3>
                <p className="medx-muted">
                  Create a concise overview from available patient information.
                </p>
                <button type="button" className="btn btn-secondary" disabled>
                  Coming soon
                </button>
              </section>
            </div>
          </section>
        </>
      )}

      <div style={{ marginTop: 28 }}>
        <Link to="/professional" className="btn btn-secondary">
          Back to workspace
        </Link>
      </div>

    </div>
  );
};

export default ProfessionalSection;
