import React from 'react';
import { Link } from 'react-router-dom';
import heroDevicesImg from '../../../assets/landing/hero_devices_real.jpg';

const DevicesSlide = () => {
  return (
    <div className="hero-scene-grid devices-scene">
      {/* 1. Standardized Text & Action Content */}
      <div className="hero-scene-content">
        <div className="hero-badge badge-accent">
          <span className="hero-badge-dot accent"></span>
          Device Integration
        </div>
        <h2 className="hero-title">
          Your Everyday Devices, <br />
          <span className="hero-title-highlight">Speaking with One Voice.</span>
        </h2>
        <p className="hero-description">
          Blood pressure monitors, continuous glucose sensors, and smartwatches measure your vitals daily.
          Med-X channels these streams into one quiet, continuous continuity layer.
        </p>
        <div className="hero-actions">
          <a href="#coverage" className="btn btn-primary btn-lg">
            View Device Ecosystem
          </a>
          <Link to="/login" className="btn btn-outline btn-lg">
            Connect Your Devices
          </Link>
        </div>
        <div className="device-ecosystem-strip">
          <span className="eco-label">Compatible Hardware:</span>
          <span className="eco-item">BP Cuffs</span>
          <span className="eco-dot">•</span>
          <span className="eco-item">CGM Patches</span>
          <span className="eco-dot">•</span>
          <span className="eco-item">Wearables</span>
          <span className="eco-dot">•</span>
          <span className="eco-item">Oximeters</span>
        </div>
      </div>

      {/* 2. Standardized Media / Visual Stage */}
      <div className="hero-scene-stage">
        <div className="scene-media-composition scene-03-composition">
          {/* Authentic Real-World Devices Photo */}
          <div className="media-photo-frame photo-devices-frame">
            <img
              src={heroDevicesImg}
              alt="Real-world blood pressure monitor, smartwatch, and glucose sensor on nightstand"
              className="media-photo-img"
              loading="eager"
            />
            <div className="media-photo-vignette"></div>
            <div className="photo-caption-badge">Everyday Health Hardware</div>
          </div>

          {/* Seamless Inset Digital Continuity Stream Overlay */}
          <div className="canvas-devices-overlay">
            <div className="devices-overlay-header">
              <div className="overlay-pulse-group">
                <span className="overlay-pulse-emerald"></span>
                <span className="overlay-devices-title">Continuous Biometric Continuity</span>
              </div>
              <span className="overlay-devices-badge">Demonstration Stream</span>
            </div>

            <div className="devices-waveform-box">
              <svg viewBox="0 0 240 32" fill="none" className="stream-waveform-svg">
                <path
                  d="M 0 16 L 40 16 L 48 4 L 56 28 L 64 16 L 120 16 L 128 4 L 136 28 L 144 16 L 240 16"
                  stroke="#4338ca"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="devices-vitals-row">
              <div className="vital-cell">
                <span className="vital-label">Blood Pressure</span>
                <span className="vital-value">118/74</span>
                <span className="vital-unit">mmHg</span>
              </div>
              <div className="vital-cell">
                <span className="vital-label">Fasting Glucose</span>
                <span className="vital-value">98</span>
                <span className="vital-unit">mg/dL</span>
              </div>
              <div className="vital-cell">
                <span className="vital-label">Resting Pulse</span>
                <span className="vital-value">62</span>
                <span className="vital-unit">bpm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesSlide;
