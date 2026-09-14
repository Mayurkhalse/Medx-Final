import React from 'react';
import { Link } from 'react-router-dom';

const CoverageSection = () => {
  return (
    <section id="coverage" className="landing-section coverage-section">
      <div className="landing-container">
        <div className="section-header text-center">
          <span className="section-eyebrow">The Med-X Ecosystem</span>
          <h2 className="section-title">
            What Med-X Offers: A Connected Health System
          </h2>
          <p className="section-subtitle">
            From diagnostic laboratory reports and daily home sensors to clinical consult briefs —
            discover how Med-X brings your complete health context together.
          </p>
        </div>

        {/* Editorial Connected Health Convergence Canvas */}
        <div className="coverage-convergence-canvas">
          {/* Header Badge */}
          <div className="convergence-header-row">
            <div className="convergence-badge">
              <span className="convergence-pulse-dot"></span>
              <span>LIVING HEALTH CANVAS • FOUR STREAMS UNIFIED</span>
            </div>
            <span className="convergence-sub">One unbroken health history linking every critical source</span>
          </div>

          {/* 4 Converging Health Sources */}
          <div className="convergence-sources-row">
            {/* Stream 01: Diagnostic Labs */}
            <div className="convergence-source-node source-labs">
              <div className="source-node-icon">📄</div>
              <div className="source-node-info">
                <span className="source-node-category">Diagnostic Labs</span>
                <h4 className="source-node-title">Blood Chemistry &amp; Panels</h4>
                <p className="source-node-desc">
                  Upload laboratory PDFs and pathology slips. Fragmented values are extracted into searchable trends.
                </p>
                <div className="source-contribution-tag">
                  <span className="tag-bullet">✓</span>
                  <span>14 Chemistry Parameters Reconciled</span>
                </div>
              </div>
              <div className="source-conduit-stem">
                <span className="conduit-pulse"></span>
              </div>
            </div>

            {/* Stream 02: Hospital Records */}
            <div className="convergence-source-node source-hospital">
              <div className="source-node-icon">🏥</div>
              <div className="source-node-info">
                <span className="source-node-category">Hospital Records</span>
                <h4 className="source-node-title">Discharges &amp; Clinic Notes</h4>
                <p className="source-node-desc">
                  Discharge summaries, surgical histories, and clinical consults structured into one timeline.
                </p>
                <div className="source-contribution-tag">
                  <span className="tag-bullet">✓</span>
                  <span>Cardiology Summary Structured</span>
                </div>
              </div>
              <div className="source-conduit-stem">
                <span className="conduit-pulse"></span>
              </div>
            </div>

            {/* Stream 03: Health Devices */}
            <div className="convergence-source-node source-devices">
              <div className="source-node-icon">📱</div>
              <div className="source-node-info">
                <span className="source-node-category">Health Devices</span>
                <h4 className="source-node-title">Sensors &amp; Home Monitors</h4>
                <p className="source-node-desc">
                  Blood pressure cuffs, glucose monitors, and smartwatches stream measurements into your history.
                </p>
                <div className="source-contribution-tag">
                  <span className="tag-bullet">✓</span>
                  <span>118/76 mmHg Baseline Tracked</span>
                </div>
              </div>
              <div className="source-conduit-stem">
                <span className="conduit-pulse"></span>
              </div>
            </div>

            {/* Stream 04: Care Teams */}
            <div className="convergence-source-node source-care">
              <div className="source-node-icon">🩺</div>
              <div className="source-node-info">
                <span className="source-node-category">Care Teams</span>
                <h4 className="source-node-title">Doctor Consultation Briefs</h4>
                <p className="source-node-desc">
                  Generate doctor-ready longitudinal summaries, giving your clinicians complete historical context.
                </p>
                <div className="source-contribution-tag">
                  <span className="tag-bullet">✓</span>
                  <span>Doctor Review Brief Ready</span>
                </div>
              </div>
              <div className="source-conduit-stem">
                <span className="conduit-pulse"></span>
              </div>
            </div>
          </div>

          {/* Central Living Timeline Axis: Where All 4 Streams Converge */}
          <div className="convergence-timeline-conduit">
            <div className="timeline-conduit-label">
              <span className="conduit-dot"></span>
              <span>UNBROKEN CHRONOLOGICAL TIMELINE AXIS</span>
            </div>
            <div className="timeline-conduit-track">
              <div className="conduit-milestone">
                <span className="milestone-dot"></span>
                <div className="milestone-text">
                  <span className="milestone-date">Jun 10</span>
                  <span className="milestone-event">Primary Clinic Physical</span>
                </div>
              </div>
              <div className="conduit-milestone">
                <span className="milestone-dot"></span>
                <div className="milestone-text">
                  <span className="milestone-date">Aug 24</span>
                  <span className="milestone-event">Metro Hospital Discharge</span>
                </div>
              </div>
              <div className="conduit-milestone">
                <span className="milestone-dot"></span>
                <div className="milestone-text">
                  <span className="milestone-date">Oct 12</span>
                  <span className="milestone-event">APEX Lipid &amp; Glucose Slip</span>
                </div>
              </div>
              <div className="conduit-milestone active-milestone">
                <span className="milestone-dot active-dot"></span>
                <div className="milestone-text">
                  <span className="milestone-date active-date">Today</span>
                  <span className="milestone-event active-event">Living Health Canvas Synced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Synthesis: Two Practical Outcomes */}
          <div className="convergence-synthesis-row">
            <div className="synthesis-item">
              <span className="synthesis-kicker">Eliminate Redundant Testing</span>
              <p className="synthesis-p">
                By presenting comprehensive past lab results and treatments chronologically, clinicians immediately
                see what has already been examined, reducing repeated blood draws and unnecessary procedures.
              </p>
            </div>
            <div className="synthesis-item">
              <span className="synthesis-kicker">Passive Context in the Background</span>
              <p className="synthesis-p">
                Med-X organizes observations quietly. When you prepare for your next medical appointment, your
                vital metrics and document history are already structured and ready for discussion.
              </p>
            </div>
          </div>
        </div>

        <div className="coverage-bottom-cta text-center">
          <Link to="/register" className="btn btn-primary btn-lg">
            Experience the Ecosystem
          </Link>
          <span className="cta-secondary-note">
            Free profile setup for patients • Clear coordination briefs for doctors
          </span>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;
