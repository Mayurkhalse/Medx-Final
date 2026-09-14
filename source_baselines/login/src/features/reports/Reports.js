import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const reports = [
  {
    id: 'cbc-2026-08-22',
    type: 'CBC',
    title: 'Complete Blood Count',
    date: '22 Aug 2026',
    measurements: 8,
    status: 'Processed'
  },
  {
    id: 'lft-2026-07-18',
    type: 'LFT',
    title: 'Liver Function Test',
    date: '18 Jul 2026',
    measurements: 7,
    status: 'Processed'
  },
  {
    id: 'lipid-2026-06-04',
    type: 'Lipid Profile',
    title: 'Lipid Profile',
    date: '04 Jun 2026',
    measurements: 6,
    status: 'Processed'
  }
];

const Reports = () => {
  const latestReport = reports[0];

  return (
    <div className="medx-page">
      <Breadcrumb items={[{ label: 'Reports' }]} />

      <div className="medx-page-header medx-page-header-row">
        <div>
          <h1>Blood Reports</h1>
          <p className="medx-subtitle">
            Review laboratory information extracted from your health reports.
          </p>
        </div>

        <button className="btn btn-primary">
          Upload report
        </button>
      </div>

      <section className="medx-health-status">
        <div>
          <span className="medx-status-label">Latest report</span>
          <h2>{latestReport.title}</h2>
          <p>
            Processed on {latestReport.date}. {latestReport.measurements}{' '}
            laboratory measurements were extracted.
          </p>
        </div>

        <span className="medx-status-badge medx-status-stable">
          {latestReport.status}
        </span>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading medx-section-heading-row">
          <div>
            <p className="medx-eyebrow">Report history</p>
            <h2>Your reports</h2>
          </div>

          <span className="medx-muted-text">
            {reports.length} reports available
          </span>
        </div>

        <div className="medx-report-list">
          {reports.map((report) => (
            <div className="medx-report-item" key={report.id}>
              <div>
                <span className="medx-card-label">{report.type}</span>
                <strong>{report.title}</strong>
                <p>
                  {report.date} · {report.measurements} measurements extracted
                </p>
              </div>

              <div className="medx-report-item-action">
                <span className="medx-status-badge medx-status-stable">
                  {report.status}
                </span>

                <Link
                  to={`/reports/${report.id}`}
                  className="btn btn-outline btn-sm"
                >
                  View report
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Reports;
