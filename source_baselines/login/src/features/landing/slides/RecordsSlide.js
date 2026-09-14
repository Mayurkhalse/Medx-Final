import React from 'react';
import { Link } from 'react-router-dom';
import heroPaperImg from '../../../assets/landing/hero_paper_records.jpg';

const RecordsSlide = () => {
  return (
    <div className="hero-scene-grid records-scene">
      {/* 1. Standardized Text & Action Content */}
      <div className="hero-scene-content">
        <div className="hero-badge badge-warning">
          <span className="hero-badge-dot warning"></span>
          The Fragmentation Crisis
        </div>
        <h2 className="hero-title">
          Scattered in Portals. <br />
          <span className="hero-title-highlight">Trapped in PDFs.</span>
        </h2>
        <p className="hero-description">
          Blood panels, clinic notes, and discharge summaries arrive scattered across incompatible
          portals and printouts. Med-X transforms this paperwork into one clean, continuous history.
        </p>
        <div className="hero-actions">
          <a href="#coverage" className="btn btn-primary btn-lg">
            See How Med-X Unifies
          </a>
          <Link to="/register" className="btn btn-outline btn-lg">
            Create Your Profile
          </Link>
        </div>
        <div className="slide-callout">
          <span className="slide-callout-icon">💡</span>
          <span className="slide-callout-text">
            Upload any lab slip, scan, or doctor's note. Med-X organizes the facts automatically.
          </span>
        </div>
      </div>

      {/* 2. Standardized Media / Visual Stage */}
      <div className="hero-scene-stage">
        <div className="scene-media-composition scene-02-composition">
          {/* Authentic Paper Records Photographic Layer */}
          <div className="media-photo-frame photo-records-frame">
            <img
              src={heroPaperImg}
              alt="Real physical medical records and laboratory reports on desk"
              className="media-photo-img"
              loading="eager"
            />
            <div className="media-photo-vignette"></div>
            <div className="photo-caption-badge">Physical Medical Paperwork</div>
          </div>

          {/* Paper to Digital Transformation Bridge */}
          <div className="paper-transform-bridge">
            <div className="scan-beam-line"></div>
          </div>

          {/* Resolved Unbroken Digital Timeline */}
          <div className="resolved-timeline-canvas">
            <div className="timeline-canvas-header">
              <span className="canvas-dot"></span>
              <span className="canvas-title">Unbroken Health Timeline</span>
              <span className="canvas-tag">Organized</span>
            </div>

            <div className="timeline-canvas-nodes">
              <div className="canvas-node">
                <span className="node-date">Today</span>
                <div className="node-body">
                  <span className="node-headline">Lipid &amp; Glucose Panel</span>
                  <span className="node-meta">APEX Pathology • Ingested</span>
                </div>
              </div>

              <div className="canvas-node">
                <span className="node-date">Aug 24</span>
                <div className="node-body">
                  <span className="node-headline">Cardiology Discharge Summary</span>
                  <span className="node-meta">Metro Hospital • Structured</span>
                </div>
              </div>

              <div className="canvas-node muted">
                <span className="node-date">Jun 10</span>
                <div className="node-body">
                  <span className="node-headline">Annual Physical Note</span>
                  <span className="node-meta">Primary Clinic • Reconciled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsSlide;
