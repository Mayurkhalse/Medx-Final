import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

// ============================================================
// MOCKUP DATA
// Temporary longitudinal data representing measurements that
// will eventually come from the Med-X backend/database.
// ============================================================
const measurements = [
  { date: '22 Aug', value: 13.6 },
  { date: '18 Jun', value: 13.5 },
  { date: '20 Apr', value: 13.4 },
  { date: '21 Feb', value: 13.1 }
];

const Monitoring = () => {
  return (
    <div className="medx-page">
      {/* CORE: Standard page navigation */}
      <Breadcrumb items={[{ label: 'Monitoring' }]} />

      <div className="medx-page-header">
        <p className="medx-eyebrow">HEALTH MONITORING</p>
        <h1>Health Trends</h1>
        <p className="medx-subtitle">
          Follow how your recorded health measurements change over time.
        </p>
      </div>

      {/* CORE: Current status presentation */}
      <section className="medx-health-status">
        <div>
          <span className="medx-status-label">Current trend</span>
          <h2>Hemoglobin is relatively stable</h2>
          <p>
            Your latest recorded value is 13.6 g/dL. The available observations
            show a gradual change rather than a sudden shift.
          </p>
        </div>

        <span className="medx-status-badge medx-status-stable">
          Stable
        </span>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">LONGITUDINAL VIEW</p>
            <h2>Hemoglobin</h2>
          </div>

          <span className="medx-monitoring-unit">g/dL</span>
        </div>

        {/* MOCKUP:
            This chart currently uses local sample observations.
            Later this component receives real time-series data. */}
        <div className="medx-trend-card">
          <div className="medx-trend-chart">
            <div className="medx-chart-grid">
              <span>14.0</span>
              <span>13.5</span>
              <span>13.0</span>
              <span>12.5</span>
            </div>

            <div className="medx-chart-line">
              {measurements.map((item, index) => (
                <div className="medx-chart-point" key={item.date}>
                  <span
                    className="medx-point"
                    style={{
                      bottom: `${35 + index * 13}%`
                    }}
                  >
                    <strong>{item.value}</strong>
                  </span>

                  <small>{item.date}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="medx-trend-summary">
            <div>
              <span>Latest</span>
              <strong>13.6 g/dL</strong>
            </div>

            <div>
              <span>Previous</span>
              <strong>13.5 g/dL</strong>
            </div>

            <div>
              <span>Change</span>
              <strong>+0.1 g/dL</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">OBSERVATIONS</p>
            <h2>Recorded measurements</h2>
          </div>
        </div>

        <div className="medx-monitoring-table">
          <div className="medx-monitoring-row medx-monitoring-header">
            <span>Date</span>
            <span>Measurement</span>
            <span>Value</span>
            <span>Status</span>
          </div>

          {measurements.map((item) => (
            <div className="medx-monitoring-row" key={item.date}>
              <span>{item.date} 2026</span>
              <span>Hemoglobin</span>
              <strong>{item.value} g/dL</strong>
              <span className="medx-status-badge medx-status-stable">
                Within range
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-action-grid">
          <Link to="/reports/cbc-2026-08-22" className="medx-action-card">
            <strong>View supporting report</strong>
            <span>
              See the laboratory report from which the latest observation was
              extracted.
            </span>
          </Link>

          <Link to="/alerts" className="medx-action-card">
            <strong>Review alerts</strong>
            <span>
              Check whether Med-X has highlighted any recent changes.
            </span>
          </Link>

          <Link to="/ask-medx" className="medx-action-card">
            <strong>Ask Med-X</strong>
            <span>
              Ask about this trend or another measurement in your record.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Monitoring;
