import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const reportData = {
  'cbc-2026-08-22': {
    type: 'CBC',
    title: 'Complete Blood Count',
    date: '22 Aug 2026',
    measurements: [
      {
        name: 'Hemoglobin',
        value: '13.6',
        unit: 'g/dL',
        range: '12.0 – 16.0',
        status: 'Within range'
      },
      {
        name: 'WBC Count',
        value: '7.2',
        unit: '10³/µL',
        range: '4.0 – 11.0',
        status: 'Within range'
      },
      {
        name: 'Platelet Count',
        value: '248',
        unit: '10³/µL',
        range: '150 – 450',
        status: 'Within range'
      },
      {
        name: 'RBC Count',
        value: '4.6',
        unit: '10⁶/µL',
        range: '4.0 – 5.5',
        status: 'Within range'
      },
      {
        name: 'Hematocrit',
        value: '41',
        unit: '%',
        range: '36 – 46',
        status: 'Within range'
      },
      {
        name: 'MCV',
        value: '89',
        unit: 'fL',
        range: '80 – 100',
        status: 'Within range'
      },
      {
        name: 'MCH',
        value: '29.6',
        unit: 'pg',
        range: '27 – 33',
        status: 'Within range'
      },
      {
        name: 'MCHC',
        value: '33.2',
        unit: 'g/dL',
        range: '32 – 36',
        status: 'Within range'
      }
    ]
  }
};

const ReportDetail = () => {
  const { id } = useParams();

  const report = reportData[id] || reportData['cbc-2026-08-22'];

  return (
    <div className="medx-page">
      <Breadcrumb
        items={[
          { label: 'Reports', to: '/reports' },
          { label: report.title }
        ]}
      />

      <div className="medx-page-header medx-page-header-row">
        <div>
          <p className="medx-eyebrow">{report.type}</p>
          <h1>{report.title}</h1>
          <p className="medx-subtitle">
            Processed on {report.date} · 8 laboratory measurements extracted.
          </p>
        </div>

        <span className="medx-status-badge medx-status-stable">
          Processed
        </span>
      </div>

      <section className="medx-health-status">
        <div>
          <span className="medx-status-label">Report summary</span>
          <h2>8 measurements available</h2>
          <p>
            Med-X has organized the laboratory observations so that individual
            values, reference ranges and changes can be understood together.
          </p>
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">Extracted results</p>
            <h2>Laboratory measurements</h2>
          </div>
        </div>

        <div className="medx-result-grid">
          {report.measurements.map((measurement) => (
            <div className="medx-result-card" key={measurement.name}>
              <div className="medx-result-card-top">
                <span className="medx-card-label">
                  {measurement.name}
                </span>

                <span className="medx-status-badge medx-status-stable">
                  {measurement.status}
                </span>
              </div>

              <strong className="medx-result-value">
                {measurement.value}
                <small>{measurement.unit}</small>
              </strong>

              <p>
                Reference range: <strong>{measurement.range}</strong>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">Understand the report</p>
            <h2>What can you do next?</h2>
          </div>
        </div>

        <div className="medx-action-grid">
          <Link to="/monitoring" className="medx-action-card">
            <strong>View health trends</strong>
            <span>
              Compare measurements with observations from previous reports.
            </span>
          </Link>

          <Link to="/ask-medx" className="medx-action-card">
            <strong>Ask Med-X</strong>
            <span>
              Ask a question about a result or something that changed.
            </span>
          </Link>

          <Link to="/reports" className="medx-action-card">
            <strong>Back to reports</strong>
            <span>
              Return to your complete report history.
            </span>
          </Link>
        </div>
      </section>

      <section className="medx-ai-disclaimer">
        <strong>About this information</strong>
        <p>
          Values shown here represent the information extracted from the
          selected report. Med-X is designed to help organize and explain
          health information and does not replace professional medical advice.
        </p>
      </section>
    </div>
  );
};

export default ReportDetail;
