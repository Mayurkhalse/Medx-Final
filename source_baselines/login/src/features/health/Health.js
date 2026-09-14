import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const Health = () => {
  return (
    <div className="medx-page">
      <Breadcrumb items={[{ label: 'My Health' }]} />

      <div className="medx-page-header">
        <div>
          <h1>My Health</h1>
          <p className="medx-subtitle">
            Understand your current health information at a glance.
          </p>
        </div>
      </div>

      <section className="medx-health-status">
        <div>
          <span className="medx-status-label">Current status</span>
          <h2>Your health is stable</h2>
          <p>
            Your health information is organized here so changes can be
            understood over time.
          </p>
        </div>

        <span className="medx-status-badge medx-status-stable">
          Stable
        </span>
      </section>

      <section className="medx-card-grid">
        <div className="medx-card medx-card-large">
          <span className="medx-card-label">Blood reports</span>
          <strong>Laboratory information</strong>
          <p>
            Review structured results from your blood reports, including their
            values, units and reported reference ranges.
          </p>
          <Link to="/reports" className="btn btn-primary btn-sm">
            View reports
          </Link>
        </div>

        <div className="medx-card">
          <span className="medx-card-label">Monitoring</span>
          <strong>Health trends</strong>
          <p>
            Follow changes across available measurements over time.
          </p>
          <Link to="/monitoring" className="btn btn-outline btn-sm">
            Open monitoring
          </Link>
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">Personal context</p>
            <h2>Information that helps explain your results</h2>
          </div>
        </div>

        <div className="medx-context-grid">
          <div className="medx-context-item">
            <span>Name</span>
            <strong>Alex Sharma</strong>
          </div>

          <div className="medx-context-item">
            <span>Age</span>
            <strong>28</strong>
          </div>

          <div className="medx-context-item">
            <span>Sex</span>
            <strong>Not specified</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Health;
