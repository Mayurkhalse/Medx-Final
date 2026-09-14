import React from 'react';

const FeaturesSection = () => {
  return (
    <section id="features" className="landing-section features-section">
      <div className="landing-container">
        <div className="section-header text-center">
          <span className="section-eyebrow">The Root Problems</span>
          <h2 className="section-title">
            Healthcare data shouldn't be this fragmented.
          </h2>
          <p className="section-subtitle">
            Modern medicine has advanced remarkably, yet the infrastructure connecting patient
            records, daily medical devices, continuous monitoring, and doctors remains broken.
          </p>
        </div>

        {/* Editorial Asymmetric Problem Flow */}
        <div className="editorial-problems-flow">
          {/* Problem 01: Hero Wide Editorial Feature */}
          <article className="problem-editorial-wide">
            <div className="problem-text-column">
              <div className="problem-kicker-row">
                <span className="problem-num-tag">01</span>
                <span className="problem-category">Data Dispersion</span>
              </div>
              <h3 className="problem-title">Fragmented Patient Records</h3>
              <p className="problem-description">
                Medical histories, blood panels, radiology reports, and discharge notes are scattered across
                multiple clinics, hospitals, diagnostic labs, and physical folders with no central point of truth.
              </p>
              <div className="problem-clinical-note">
                <span className="note-label">Clinical Consequence:</span>
                <span className="note-text">Missing records force redundant tests and leave clinicians blind to critical past conditions.</span>
              </div>
            </div>

            <div className="problem-visual-column">
              <div className="demonstration-scattered-records">
                <div className="scattered-slip slip-one">Hospital EHR</div>
                <div className="scattered-slip slip-two">Diagnostic PDF</div>
                <div className="scattered-slip slip-three">Clinic Fax</div>
                <div className="convergence-channel">
                  <span className="channel-arrow">➔</span>
                  <span className="channel-destination">One Continuous Living Record</span>
                </div>
              </div>
            </div>
          </article>

          {/* Problems 02 & 03: Asymmetric Pair */}
          <div className="editorial-problems-pair">
            {/* Problem 02: Device Integration */}
            <article className="problem-editorial-col">
              <div className="problem-kicker-row">
                <span className="problem-num-tag">02</span>
                <span className="problem-category">Hardware Isolation</span>
              </div>
              <h3 className="problem-title">Lack of Device Integration</h3>
              <p className="problem-description">
                Patients diligently measure vital statistics using blood pressure monitors, glucose meters,
                pulse oximeters, and smartwatches, but these data streams remain isolated inside closed vendor apps.
              </p>
              <div className="problem-demonstration-box">
                <div className="demo-device-convergence">
                  <span className="device-source-tag">Home BP Cuff (120/80 mmHg)</span>
                  <span className="device-flow-arrow">➔</span>
                  <span className="device-result-tag">Unified Telemetry</span>
                </div>
              </div>
              <div className="problem-clinical-note">
                <span className="note-label">Clinical Consequence:</span>
                <span className="note-text">Valuable daily health readings rarely reach treating physicians during consults.</span>
              </div>
            </article>

            {/* Problem 03: Predictive Alerts */}
            <article className="problem-editorial-col">
              <div className="problem-kicker-row">
                <span className="problem-num-tag">03</span>
                <span className="problem-category">Observation Gaps</span>
              </div>
              <h3 className="problem-title">Limited Predictive Alerts</h3>
              <p className="problem-description">
                Patients and healthcare professionals seldom receive proactive notifications when subtle vital
                deviations occur over consecutive days or weeks, missing the chance for early course correction.
              </p>
              <div className="problem-demonstration-box">
                <div className="demo-trend-shift">
                  <span className="trend-variance-pill">+12 mmHg Drift</span>
                  <span className="trend-timeline-meta">Sustained over 14 days</span>
                  <span className="trend-action-pill">Early Discussion Flag</span>
                </div>
              </div>
              <div className="problem-clinical-note">
                <span className="note-label">Clinical Consequence:</span>
                <span className="note-text">Interventions happen only after acute distress rather than at early observational signals.</span>
              </div>
            </article>
          </div>

          {/* Problems 04 & 05: Asymmetric Pair */}
          <div className="editorial-problems-pair">
            {/* Problem 04: Delayed Detection */}
            <article className="problem-editorial-col">
              <div className="problem-kicker-row">
                <span className="problem-num-tag">04</span>
                <span className="problem-category">Timeline Blindspots</span>
              </div>
              <h3 className="problem-title">Delayed Disease Detection</h3>
              <p className="problem-description">
                Many chronic conditions like hypertension, metabolic shifts, and cardiovascular strain develop
                silently over months, remaining undetected until significant irreversible symptoms appear.
              </p>
              <div className="problem-demonstration-box">
                <div className="demo-progression-timeline">
                  <div className="prog-step">
                    <span className="p-lbl">Quarter 1</span>
                    <span className="p-val">92 mg/dL</span>
                  </div>
                  <div className="prog-connector">➔</div>
                  <div className="prog-step">
                    <span className="p-lbl">Quarter 2</span>
                    <span className="p-val">98 mg/dL</span>
                  </div>
                  <div className="prog-connector">➔</div>
                  <div className="prog-step">
                    <span className="p-lbl">Quarter 3</span>
                    <span className="p-val">103 mg/dL</span>
                  </div>
                  <div className="prog-connector">➔</div>
                  <div className="prog-step alert-point">
                    <span className="p-lbl">Quarter 4</span>
                    <span className="p-val">108 mg/dL</span>
                  </div>
                </div>
              </div>
              <div className="problem-clinical-note">
                <span className="note-label">Clinical Consequence:</span>
                <span className="note-text">Delayed visibility diminishes treatment effectiveness and escalates overall medical costs.</span>
              </div>
            </article>

            {/* Problem 05: Manual Management */}
            <article className="problem-editorial-col">
              <div className="problem-kicker-row">
                <span className="problem-num-tag">05</span>
                <span className="problem-category">Patient Burden</span>
              </div>
              <h3 className="problem-title">Manual Healthcare Management</h3>
              <p className="problem-description">
                Traditional health management relies on patients manually logging notebook numbers, emailing PDFs,
                and carrying physical files, placing an unsustainable burden on individuals and caregivers.
              </p>
              <div className="problem-demonstration-box">
                <div className="demo-automation-strip">
                  <span className="auto-pill">⚡ Automated Ingestion</span>
                  <span className="auto-label">Zero Manual Binder Tracking</span>
                </div>
              </div>
              <div className="problem-clinical-note">
                <span className="note-label">Clinical Consequence:</span>
                <span className="note-text">Human transcription error and tracking fatigue compromise continuous health oversight.</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
