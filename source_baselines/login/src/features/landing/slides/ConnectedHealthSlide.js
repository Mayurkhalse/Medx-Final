import React from 'react';
import { Link } from 'react-router-dom';
import heroDoctorImg from '../../../assets/landing/hero_doctor_patient.jpg';

const ConnectedHealthSlide = () => {
  return (
    <div className="hero-scene-grid connected-scene">
      {/* 1. Standardized Text & Action Content */}
      <div className="hero-scene-content">
        <div className="hero-badge badge-success">
          <span className="hero-badge-dot success"></span>
          The Connected Future
        </div>
        <h2 className="hero-title">
          Everything Connected. <br />
          <span className="hero-title-highlight">Complete Peace of Mind.</span>
        </h2>
        <p className="hero-description">
          When laboratory diagnostics, daily sensor telemetry, historical trends, and doctor
          communication unite in one serene workspace, health management transforms from scattered
          paperwork into calm, proactive clarity.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started with Med-X
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Sign In to Workspace
          </Link>
        </div>
        <div className="platform-pillars-tags">
          <span className="pillar-tag">✓ Diagnostic History</span>
          <span className="pillar-tag">✓ Device Telemetry</span>
          <span className="pillar-tag">✓ Vital Trajectories</span>
          <span className="pillar-tag">✓ Care Team Link</span>
        </div>
      </div>

      {/* 2. Standardized Media / Visual Stage */}
      <div className="hero-scene-stage">
        <div className="scene-media-composition scene-06-composition">
          {/* Authentic Doctor-Patient Consultation Photo Base */}
          <div className="media-photo-frame photo-doctor-frame">
            <img
              src={heroDoctorImg}
              alt="Physician and patient collaboratively reviewing health records and longitudinal data together"
              className="media-photo-img"
              loading="eager"
            />
            <div className="media-photo-vignette"></div>
            <div className="photo-caption-badge">Doctor &amp; Patient Collaboration</div>
          </div>

          {/* Master Med-X Health Canvas Cockpit Overlay */}
          <div className="canvas-cockpit-overlay">
            <div className="cockpit-overlay-header">
              <div className="cockpit-title-wrap">
                <span className="cockpit-dot-live"></span>
                <span className="cockpit-title">Unified Health Canvas</span>
              </div>
              <span className="cockpit-status-badge">Synchronized</span>
            </div>

            {/* Master Chronological Stream */}
            <div className="cockpit-stream-list">
              <div className="cockpit-stream-item">
                <div className="stream-axis-dot"></div>
                <div className="stream-item-content">
                  <div className="stream-meta-line">
                    <span className="stream-category">Diagnostic Ingestion</span>
                    <span className="stream-date">Yesterday</span>
                  </div>
                  <span className="stream-summary">Comprehensive Metabolic Panel • 14 Parameters Reconciled</span>
                </div>
              </div>

              <div className="cockpit-stream-item current-stream">
                <div className="stream-axis-dot active-dot"></div>
                <div className="stream-item-content">
                  <div className="stream-meta-line">
                    <span className="stream-category">Continuous Telemetry</span>
                    <span className="stream-date">Today</span>
                  </div>
                  <div className="stream-vital-pill">
                    <span className="stream-vital-val">118/74 mmHg</span>
                    <span className="stream-vital-status">Baseline Stable</span>
                  </div>
                </div>
              </div>

              <div className="cockpit-stream-item">
                <div className="stream-axis-dot"></div>
                <div className="stream-item-content">
                  <div className="stream-meta-line">
                    <span className="stream-category">Clinician Link</span>
                    <span className="stream-date">Upcoming</span>
                  </div>
                  <span className="stream-summary">Longitudinal Trend Brief Ready for Consultation</span>
                </div>
              </div>
            </div>

            {/* Brand Signature Reassurance */}
            <div className="cockpit-footer-reassurance">
              <span className="reassurance-icon">✦</span>
              <span className="reassurance-text">
                Your Health. Connected. Understood.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedHealthSlide;
