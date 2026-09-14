import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const initialAlerts = [
  {
    id: 1,
    severity: 'Review',
    title: 'Hemoglobin changed slightly',
    description:
      'The latest value is different from the previous observation. Med-X has flagged this for review so the trend can be understood over time.',
    measurement: 'Hemoglobin',
    current: '13.6 g/dL',
    previous: '13.1 g/dL',
    date: '22 Aug 2026',
    reportId: 'cbc-2026-08-22',
    read: false
  },
  {
    id: 2,
    severity: 'Information',
    title: 'New laboratory report processed',
    description:
      'A recent Complete Blood Count report has been processed and its laboratory measurements are available.',
    measurement: 'Complete Blood Count',
    current: '8 measurements',
    previous: 'Previous report available',
    date: '22 Aug 2026',
    reportId: 'cbc-2026-08-22',
    read: false
  },
  {
    id: 3,
    severity: 'Information',
    title: 'Monitoring data updated',
    description:
      'Longitudinal observations have been updated. Review your health trends to understand how measurements are changing.',
    measurement: 'Health trends',
    current: '3 measurements tracked',
    previous: '6 month view',
    date: '22 Aug 2026',
    reportId: null,
    read: true
  }
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const markAsRead = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts((current) =>
      current.map((alert) => ({ ...alert, read: true }))
    );
  };

  return (
    <div className="medx-page">
      <Breadcrumb
        items={[
          { label: 'Alerts' }
        ]}
      />

      <div className="medx-page-header medx-page-header-row">
        <div>
          <p className="medx-eyebrow">MED-X HEALTH SIGNALS</p>
          <h1>Alerts</h1>
          <p className="medx-subtitle">
            Review changes and health information that may need your attention.
          </p>
        </div>

        <div className="medx-alert-summary">
          <strong>{unreadCount}</strong>
          <span>unread</span>
        </div>
      </div>

      <section className="medx-health-status">
        <div>
          <span className="medx-status-label">How alerts work</span>
          <h2>Med-X highlights information worth reviewing</h2>
          <p>
            Alerts can be generated when new health information is available,
            when a measurement changes, or when a pattern becomes useful to
            review. They are designed to support understanding, not diagnose
            medical conditions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">YOUR ACTIVITY</p>
            <h2>Recent alerts</h2>
          </div>

          <span className="medx-muted-text">
            {alerts.length} alerts available
          </span>
        </div>

        <div className="medx-alert-list">
          {alerts.map((alert) => (
            <article
              className={`medx-alert-card ${alert.read ? 'is-read' : 'is-unread'}`}
              key={alert.id}
            >
              <div className="medx-alert-card-main">
                <div className="medx-alert-card-heading">
                  <span
                    className={`medx-alert-type ${
                      alert.severity === 'Review'
                        ? 'medx-alert-review'
                        : 'medx-alert-info'
                    }`}
                  >
                    {alert.severity}
                  </span>

                  {!alert.read && (
                    <span className="medx-unread-dot">New</span>
                  )}
                </div>

                <h3>{alert.title}</h3>

                <p>{alert.description}</p>

                <div className="medx-alert-meta">
                  <span>
                    <strong>Information:</strong> {alert.measurement}
                  </span>
                  <span>
                    <strong>Current:</strong> {alert.current}
                  </span>
                  <span>
                    <strong>Previous:</strong> {alert.previous}
                  </span>
                  <span>{alert.date}</span>
                </div>
              </div>

              <div className="medx-alert-actions">
                {!alert.read && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => markAsRead(alert.id)}
                  >
                    Mark as read
                  </button>
                )}

                {alert.reportId && (
                  <Link
                    to={`/reports/${alert.reportId}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => markAsRead(alert.id)}
                  >
                    View report
                  </Link>
                )}

                {!alert.reportId && (
                  <Link
                    to="/monitoring"
                    className="btn btn-outline btn-sm"
                    onClick={() => markAsRead(alert.id)}
                  >
                    View trends
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-action-grid">
          <Link to="/monitoring" className="medx-action-card">
            <strong>Review health trends</strong>
            <span>
              See how measurements have changed across available observations.
            </span>
          </Link>

          <Link to="/ask-medx" className="medx-action-card">
            <strong>Ask Med-X about a change</strong>
            <span>
              Ask for an explanation of information already present in your
              health record.
            </span>
          </Link>

          <Link to="/reports" className="medx-action-card">
            <strong>Review reports</strong>
            <span>
              Open the reports from which these health signals were derived.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Alerts;
