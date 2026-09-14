import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    phase: 'Collect',
    title: 'Gather Records & Home Devices',
    description:
      'Consolidate historical lab PDFs, clinic discharge notes, and at-home monitoring devices into your secure personal health repository.',
    metaPreview: 'Paperwork & Sensors Gathered',
  },
  {
    step: '02',
    phase: 'Connect',
    title: 'Harmonize Disparate Sources',
    description:
      'Med-X structures unparsed lab values, clinic records, and streaming telemetry into a single chronological timeline without manual spreadsheet entry.',
    metaPreview: 'Single Chronological Axis',
  },
  {
    step: '03',
    phase: 'Understand',
    title: 'Visualize Longitudinal Trends',
    description:
      'Track vital parameters and biomarker values side-by-side on interactive charts to see how metrics evolve over weeks and months.',
    metaPreview: '14-Day Trajectory Curve',
  },
  {
    step: '04',
    phase: 'Act',
    title: 'Coordinate Proactively With Care Teams',
    description:
      'Share structured trend summaries and export clean clinical briefs so your doctors can conduct informed, personalized consultations.',
    metaPreview: 'Doctor-Ready Consult Brief',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="landing-section how-it-works-section">
      <div className="landing-container">
        <div className="section-header text-center">
          <span className="section-eyebrow">The Product Flow</span>
          <h2 className="section-title">
            How Med-X Works: From Fragmented to Actionable
          </h2>
          <p className="section-subtitle">
            An unbroken, progressive journey from scattered medical paperwork to continuous health clarity.
          </p>
        </div>

        {/* One Continuous Visual Journey Rail */}
        <div className="unbroken-journey-rail">
          <div className="journey-track-line"></div>

          <div className="journey-stages-container">
            {STEPS.map((stepItem, idx) => (
              <div key={stepItem.step} className={`journey-stage-step stage-${stepItem.phase.toLowerCase()}`}>
                <div className="stage-top-marker">
                  <span className="stage-num-badge">{stepItem.step}</span>
                  <span className="stage-phase-name">{stepItem.phase}</span>
                </div>
                <h3 className="stage-title">{stepItem.title}</h3>
                <p className="stage-desc">{stepItem.description}</p>
                <div className="stage-outcome-tag">
                  <span className="outcome-indicator"></span>
                  <span>{stepItem.metaPreview}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Serene Concluding Banner */}
        <div className="journey-concluding-highlight">
          <div className="highlight-text-block">
            <span className="highlight-kicker">Continuous Clarity</span>
            <h3 className="highlight-headline">Built for Lasting Peace of Mind</h3>
            <p className="highlight-sub">
              Connect your records once. Med-X maintains your health history in the background so you never
              have to scramble for paper slips or lost doctor's notes again.
            </p>
          </div>
          <div className="highlight-action-block">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
