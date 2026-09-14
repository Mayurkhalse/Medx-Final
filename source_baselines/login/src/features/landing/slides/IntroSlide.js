import React from 'react';
import { Link } from 'react-router-dom';
import heroHumanImg from '../../../assets/landing/hero_human_context.jpg';

const IntroSlide = () => {
  return (
    <div className="hero-scene-grid intro-scene">
      {/* 1. Standardized Text & Action Content */}
      <div className="hero-scene-content">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Intelligent Health Ecosystem
        </div>
        <h1 className="hero-title">
          Your Health. <br />
          <span className="hero-title-highlight">Connected.</span> Understood.
        </h1>
        <p className="hero-description">
          Med-X unifies scattered medical files, daily sensor readings, and clinical insights
          into one living picture you can finally understand.
        </p>
        <div className="hero-actions">
          <a href="#features" className="btn btn-primary btn-lg">
            Explore the Story
          </a>
          <Link to="/login" className="btn btn-outline btn-lg">
            Sign In to Med-X
          </Link>
        </div>
        <div className="hero-stats-row">
          <div className="hero-stat-item">
            <span className="hero-stat-number">Unified</span>
            <span className="hero-stat-label">Health Record</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-number">Living</span>
            <span className="hero-stat-label">Continuous Vitals</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-number">Zero</span>
            <span className="hero-stat-label">Scattered Files</span>
          </div>
        </div>
      </div>

      {/* 2. Standardized Media / Visual Stage */}
      <div className="hero-scene-stage">
        <div className="scene-media-composition scene-01-composition">
          {/* Authentic Human Photography Base */}
          <div className="media-photo-frame">
            <img
              src={heroHumanImg}
              alt="Person reviewing personal health records thoughtfully in natural light"
              className="media-photo-img"
              loading="eager"
            />
            <div className="media-photo-vignette"></div>
            <div className="photo-caption-badge">Human Context at Home</div>
          </div>

          {/* Seamless Inset Med-X Health Canvas Overlay */}
          <div className="canvas-product-overlay">
            <div className="overlay-header">
              <div className="overlay-title-group">
                <span className="overlay-pulse-dot"></span>
                <span className="overlay-title">Living Health Picture</span>
              </div>
              <span className="overlay-badge">Illustrative Interface</span>
            </div>

            {/* Vital Baseline Metric */}
            <div className="overlay-vital-row">
              <div className="overlay-vital-figure">
                <span className="vital-num">118/76</span>
                <span className="vital-dim">mmHg</span>
              </div>
              <span className="vital-context">14-Day Resting Baseline</span>
            </div>

            {/* Signature Chronological Health History Line Motif */}
            <div className="overlay-timeline-signature">
              <div className="timeline-line-track">
                <div className="time-tick"><span className="tick-dot"></span><span className="tick-lbl">Sep 12</span></div>
                <div className="time-tick"><span className="tick-dot"></span><span className="tick-lbl">Oct 14</span></div>
                <div className="time-tick"><span className="tick-dot"></span><span className="tick-lbl">Nov 02</span></div>
                <div className="time-tick current"><span className="tick-dot active"></span><span className="tick-lbl">Today</span></div>
              </div>
            </div>

            {/* Unified Streams Strip */}
            <div className="overlay-streams-strip">
              <span className="stream-tag"><span className="dot dot-emerald"></span> Home BP</span>
              <span className="stream-tag"><span className="dot dot-indigo"></span> Lab Panel</span>
              <span className="stream-tag"><span className="dot dot-slate"></span> Clinical Brief</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroSlide;
