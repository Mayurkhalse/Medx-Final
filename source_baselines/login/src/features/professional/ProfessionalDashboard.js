import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const patients = [
  {
    id: 'PT-001',
    name: 'Alex Sharma',
    activity: 'CBC report processed',
    date: '22 Aug 2026',
    status: 'Updated'
  },
  {
    id: 'PT-002',
    name: 'Priya Mehta',
    activity: 'New laboratory report',
    date: '21 Aug 2026',
    status: 'New'
  },
  {
    id: 'PT-003',
    name: 'Rahul Verma',
    activity: 'Measurement flagged for review',
    date: '20 Aug 2026',
    status: 'Review'
  }
];

const ProfessionalDashboard = () => {
  const { user } = useAuth();

  const professionalName =
    user?.name || 'Healthcare Professional';

  return (
    <div className="medx-page">

      {/* Page context */}
      <div className="medx-breadcrumb">
        <span>Med-X</span>
        <span>/</span>
        <strong>Workspace</strong>
      </div>

      {/* Header */}
      <div className="medx-page-header">
        <p className="medx-eyebrow">
          MED-X PROFESSIONAL
        </p>

        <h1>Professional Workspace</h1>

        <p className="medx-subtitle">
          Review patient activity, reports and health observations
          from one workspace.
        </p>
      </div>

      {/* Welcome */}
      <section className="medx-card medx-card-large">
        <div className="medx-page-header-row">
          <div>
            <p className="medx-eyebrow">WELCOME</p>

            <h2>
              Hello, {professionalName}
            </h2>

            <p className="medx-muted">
              Your workspace provides a consolidated view of
              patient information available for professional review.
            </p>
          </div>

          <span className="medx-status-badge stable">
            Workspace ready
          </span>
        </div>
      </section>

      {/* Overview metrics */}
      <div className="medx-card-grid">

        <section className="medx-card">
          <p className="medx-eyebrow">PATIENTS</p>
          <h2>24</h2>
          <p className="medx-muted">
            Patients in workspace
          </p>
          <Link
            to="/professional/patients"
            className="btn btn-secondary"
          >
            View patients
          </Link>
        </section>

        <section className="medx-card">
          <p className="medx-eyebrow">REPORTS</p>
          <h2>8</h2>
          <p className="medx-muted">
            Reports recently processed
          </p>
          <Link
            to="/professional/reports"
            className="btn btn-secondary"
          >
            Review reports
          </Link>
        </section>

        <section className="medx-card">
          <p className="medx-eyebrow">MONITORING</p>
          <h2>5</h2>
          <p className="medx-muted">
            Patient trends with recent changes
          </p>
          <Link
            to="/professional/monitoring"
            className="btn btn-secondary"
          >
            View trends
          </Link>
        </section>

        <section className="medx-card">
          <p className="medx-eyebrow">ATTENTION</p>
          <h2>3</h2>
          <p className="medx-muted">
            Items currently requiring review
          </p>
          <Link
            to="/professional/alerts"
            className="btn btn-secondary"
          >
            Review alerts
          </Link>
        </section>

      </div>

      {/* Recent patient activity */}
      <section className="medx-card medx-card-large">

        <div className="medx-page-header-row">
          <div>
            <p className="medx-eyebrow">
              RECENT ACTIVITY
            </p>

            <h2>Patient activity</h2>

            <p className="medx-muted">
              Recent changes and information available in your workspace.
            </p>
          </div>

          <Link
            to="/professional/patients"
            className="btn btn-secondary"
          >
            View all patients
          </Link>
        </div>

        <div style={{ marginTop: '24px' }}>

          {patients.map((patient) => (
            <div
              key={patient.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '18px 0',
                borderTop: '1px solid #eee'
              }}
            >

              <div>
                <strong>{patient.name}</strong>

                <p
                  className="medx-muted"
                  style={{ margin: '5px 0 0' }}
                >
                  {patient.activity}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="medx-status-badge stable">
                  {patient.status}
                </span>

                <p
                  className="medx-muted"
                  style={{ margin: '6px 0 0' }}
                >
                  {patient.date}
                </p>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* Review queue */}
      <section className="medx-card medx-card-large">

        <p className="medx-eyebrow">
          REVIEW QUEUE
        </p>

        <h2>What needs attention?</h2>

        <p className="medx-muted">
          A quick view of professional actions available in the
          current workspace.
        </p>

        <div className="medx-card-grid">

          <div>
            <h3>New reports</h3>
            <p className="medx-muted">
              Recently processed laboratory reports are ready
              for review.
            </p>
            <Link
              to="/professional/reports"
              className="btn btn-secondary"
            >
              Review reports
            </Link>
          </div>

          <div>
            <h3>Changed measurements</h3>
            <p className="medx-muted">
              Review longitudinal observations where recent
              measurements have changed.
            </p>
            <Link
              to="/professional/monitoring"
              className="btn btn-secondary"
            >
              Review trends
            </Link>
          </div>

          <div>
            <h3>Clinical attention</h3>
            <p className="medx-muted">
              Review information that Med-X has highlighted
              for professional attention.
            </p>
            <Link
              to="/professional/alerts"
              className="btn btn-secondary"
            >
              Open alerts
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
};

export default ProfessionalDashboard;
