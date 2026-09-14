import React from 'react';
import { Link } from 'react-router-dom';

const AwarenessSlide = () => {
  return (
    <div className="hero-scene-grid awareness-scene">
      {/* 1. Standardized Text & Action Content */}
      <div className="hero-scene-content">
        <div className="hero-badge badge-primary">
          <span className="hero-badge-dot"></span>
          Observational Signals
        </div>
        <h2 className="hero-title">
          Notice Subtle Shifts <br />
          <span className="hero-title-highlight">Before They Become Surprises.</span>
        </h2>
        <p className="hero-description">
          A single test is just a snapshot. Med-X tracks observational trends across weeks to reveal
          your personalized pattern, turning quiet physiological drifts into clear, timely context
          for you and your doctor.
        </p>
        <div className="hero-actions">
          <a href="#how-it-works" className="btn btn-primary btn-lg">
            How Monitoring Works
          </a>
          <Link to="/login" className="btn btn-outline btn-lg">
            View Live Monitoring
          </Link>
        </div>
        <div className="disclaimer-note">
          * Med-X tracks observational trends to support patient awareness and clinical review; it does not provide diagnostic determinations.
        </div>
      </div>

      {/* 2. Standardized Media / Visual Stage: TRAJECTORY AS THE HERO */}
      <div className="hero-scene-stage">
        <div className="scene-media-composition scene-05-composition">
          <div className="editorial-trajectory-canvas">
            {/* Top Stat & Baseline Anchor */}
            <div className="trajectory-header">
              <div className="trajectory-title-wrap">
                <span className="trajectory-kicker">14-DAY OBSERVATIONAL TRAJECTORY</span>
                <div className="trajectory-val-row">
                  <span className="trajectory-main-num">124</span>
                  <span className="trajectory-main-unit">mmHg</span>
                  <span className="trajectory-drift-pill">+12 mmHg Observed Drift</span>
                </div>
              </div>
              <span className="trajectory-baseline-note">Illustrative Baseline: 110–125 mmHg</span>
            </div>

            {/* Expansive Longitudinal Trajectory SVG */}
            <div className="trajectory-graph-area">
              <svg viewBox="0 0 500 160" className="longitudinal-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trajectoryFillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity="0.22" />
                    <stop offset="70%" stopColor="#6366f1" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Reference Zone Band */}
                <rect x="0" y="55" width="500" height="50" fill="#f8fafc" rx="6" />
                <line x1="0" y1="55" x2="500" y2="55" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="105" x2="500" y2="105" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                {/* Gradient Fill under Curve */}
                <path
                  d="M 20 95 C 100 92, 180 90, 260 84 C 340 76, 420 56, 480 38 L 480 150 L 20 150 Z"
                  fill="url(#trajectoryFillGrad)"
                />

                {/* Longitudinal Spline Curve */}
                <path
                  d="M 20 95 C 100 92, 180 90, 260 84 C 340 76, 420 56, 480 38"
                  stroke="#4338ca"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Historical Cadence Points */}
                <circle cx="20" cy="95" r="4.5" fill="#6366f1" />
                <circle cx="135" cy="91" r="4.5" fill="#6366f1" />
                <circle cx="260" cy="84" r="4.5" fill="#6366f1" />
                <circle cx="375" cy="65" r="4.5" fill="#6366f1" />

                {/* Highlighted Latest Departure Point (Day 14) */}
                <circle cx="480" cy="38" r="6.5" fill="#f59e0b" />
                <circle cx="480" cy="38" r="13" stroke="#f59e0b" strokeWidth="1.75" strokeDasharray="3 3" fill="none" />
              </svg>

              {/* Minimalist Timeline Markers */}
              <div className="trajectory-time-ticks">
                <span>Day 1</span>
                <span>Day 4</span>
                <span>Day 7</span>
                <span>Day 11</span>
                <span className="tick-latest">Day 14 (Observed Shift)</span>
              </div>
            </div>

            {/* Editorial Footer Context */}
            <div className="trajectory-insight-bar">
              <span className="insight-phrase">Observational Insight:</span>
              <span className="insight-detail">
                Continuous tracking reveals a gentle upward drift from baseline, turning subtle changes into actionable doctor-ready clarity.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessSlide;
