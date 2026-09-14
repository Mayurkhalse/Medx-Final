import React from 'react';
import { Link } from 'react-router-dom';

const MonitoringSlide = () => {
  return (
    <div className="hero-scene-grid monitoring-scene">
      {/* 1. Standardized Text & Action Content */}
      <div className="hero-scene-content">
        <div className="hero-badge badge-info">
          <span className="hero-badge-dot info"></span>
          Longitudinal Perspective
        </div>
        <h2 className="hero-title">
          One Test is a Point. <br />
          <span className="hero-title-highlight">A Year is a Pattern.</span>
        </h2>
        <p className="hero-description">
          A single test only tells you where you were on one morning. Many important health shifts
          develop quietly over months. By viewing measurements side-by-side on an unbroken
          timeline, Med-X turns isolated numbers into understandable stories.
        </p>
        <div className="hero-actions">
          <a href="#features" className="btn btn-primary btn-lg">
            Explore Problem &amp; Impact
          </a>
          <Link to="/register" className="btn btn-outline btn-lg">
            Start Tracking Trends
          </Link>
        </div>
        <div className="disclaimer-note">
          * Longitudinal tracking provides contextual progression trends to assist individuals and clinicians in informed review.
        </div>
      </div>

      {/* 2. Standardized Media / Visual Stage: TIME AS THE HERO */}
      <div className="hero-scene-stage">
        <div className="scene-media-composition scene-04-composition">
          <div className="editorial-time-canvas">
            {/* Header / Conceptual Kicker */}
            <div className="time-canvas-header">
              <div className="time-kicker-group">
                <span className="time-kicker-pill">12-MONTH OBSERVATIONAL TIMELINE</span>
                <span className="time-concept-title">Point to Pattern Transformation</span>
              </div>
              <span className="time-baseline-tag">Quarterly Laboratory Context</span>
            </div>

            {/* Unboxed Longitudinal Trajectory SVG */}
            <div className="time-trajectory-zone">
              <svg viewBox="0 0 500 160" className="time-trajectory-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="timeCurveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Delicate Reference Grid Lines */}
                <line x1="20" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                {/* Shaded Area Under Curve */}
                <path
                  d="M 50 120 C 150 115, 230 100, 330 75 C 390 60, 430 40, 450 35 L 450 145 L 50 145 Z"
                  fill="url(#timeCurveGrad)"
                />

                {/* Unbroken Longitudinal Spline Curve */}
                <path
                  d="M 50 120 C 150 115, 230 100, 330 75 C 390 60, 430 40, 450 35"
                  stroke="#4338ca"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Milestone Nodes: Jan, Apr, Jul, Oct */}
                <circle cx="50" cy="120" r="5" fill="#6366f1" />
                <circle cx="180" cy="110" r="5" fill="#6366f1" />
                <circle cx="310" cy="80" r="5" fill="#6366f1" />

                {/* Highlighted Oct Departure Node */}
                <circle cx="450" cy="35" r="7" fill="#f59e0b" />
                <circle cx="450" cy="35" r="14" stroke="#f59e0b" strokeWidth="1.75" strokeDasharray="3 3" fill="none" />
              </svg>

              {/* Milestone Metrics Row */}
              <div className="time-milestones-row">
                <div className="milestone-col">
                  <span className="m-val">92 <small>mg/dL</small></span>
                  <span className="m-lbl">Jan (Baseline)</span>
                </div>
                <div className="milestone-col">
                  <span className="m-val">98 <small>mg/dL</small></span>
                  <span className="m-lbl">Apr (Checkup)</span>
                </div>
                <div className="milestone-col">
                  <span className="m-val">103 <small>mg/dL</small></span>
                  <span className="m-lbl">Jul (Follow-up)</span>
                </div>
                <div className="milestone-col active-col">
                  <span className="m-val active-val">108 <small>mg/dL</small></span>
                  <span className="m-lbl active-lbl">Oct (Observed Shift)</span>
                </div>
              </div>
            </div>

            {/* Editorial Context & Transformation Callout */}
            <div className="time-insight-narrative">
              <div className="insight-flow-step">
                <span className="step-tag">Single Observation</span>
                <span className="step-detail">108 mg/dL on Oct 12</span>
              </div>
              <span className="insight-flow-arrow">➔</span>
              <div className="insight-flow-step">
                <span className="step-tag">12-Month Timeline</span>
                <span className="step-detail">+17% steady progression</span>
              </div>
              <span className="insight-flow-arrow">➔</span>
              <div className="insight-flow-step highlight-step">
                <span className="step-tag">Contextual Clarity</span>
                <span className="step-detail">Informed doctor discussion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringSlide;
