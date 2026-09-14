import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const Dashboard = () => {
  return (
    <div className="medx-page">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <div className="medx-page-header">
        <div>
          <h1>Your Health</h1>
          <p className="medx-subtitle">
            A simple overview of your recent health information.
          </p>
        </div>
      </div>

      <section className="medx-health-status">
        <div>
          <span className="medx-status-label">Overall health</span>
          <h2>Looking stable</h2>
          <p>
            Your latest available information does not show anything requiring
            immediate attention.
          </p>
        </div>
        <span className="medx-status-badge medx-status-stable">Stable</span>
      </section>

      <section className="medx-card-grid">
        <div className="medx-card">
          <span className="medx-card-label">Latest blood report</span>
          <strong>Complete Blood Count</strong>
          <p>
            Your latest processed report contains 8 laboratory measurements.
          </p>
          <Link to="/reports" className="btn btn-primary btn-sm">
            View report
          </Link>
        </div>

        <div className="medx-card">
          <span className="medx-card-label">Health changes</span>
          <strong>Recent trends</strong>
          <p>
            Follow how selected health measurements have changed over time.
          </p>
          <Link to="/monitoring" className="btn btn-outline btn-sm">
            View monitoring
          </Link>
        </div>

        <div className="medx-card">
          <span className="medx-card-label">Attention</span>
          <strong>No urgent alerts</strong>
          <p>
            Your current health information does not contain a high-priority
            alert.
          </p>
          <Link to="/alerts" className="btn btn-outline btn-sm">
            View alerts
          </Link>
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">Quick actions</p>
            <h2>What would you like to do?</h2>
          </div>
        </div>

        <div className="medx-action-grid">
          <Link to="/reports" className="medx-action-card">
            <strong>View my reports</strong>
            <span>Review your processed blood reports and observations.</span>
          </Link>

          <Link to="/health" className="medx-action-card">
            <strong>Check my health</strong>
            <span>Review your current health information and context.</span>
          </Link>

          <Link to="/ask-medx" className="medx-action-card">
            <strong>Ask Med-X</strong>
            <span>Understand a health result or change.</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
