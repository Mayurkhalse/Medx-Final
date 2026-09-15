import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="landing-section contact-section" style={{ marginTop: '2.5rem' }}>
      <div className="landing-container">
        {/* Editorial Brand Climax Moment */}
        <div className="editorial-conclusion-stage">
          <div className="conclusion-ambient-aura"></div>
          <div className="conclusion-content text-center">
            <span className="conclusion-eyebrow">Start Your Connected Health Journey</span>
            <h2 className="conclusion-statement">
              Your health has a history. <br />
              <span className="statement-highlight">Med-X helps you see it.</span>
            </h2>
            <p className="conclusion-sub">
              Bring your diagnostic records, at-home vitals, and longitudinal biomarkers together
              in one clear, secure platform built for proactive wellness and informed clinical care.
            </p>

            <div className="conclusion-actions">
              <Link to="/register" className="medx-btn medx-btn-primary medx-btn-lg" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Create Free Account
              </Link>
              <Link to="/login" className="medx-btn medx-btn-secondary medx-btn-lg" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Sign In to Med-X
              </Link>
            </div>

            <div className="conclusion-trust-strip">
              <div className="trust-item">
                <span className="trust-symbol">🔒</span>
                <span>Privacy-First RBAC Architecture</span>
              </div>
              <div className="trust-item">
                <span className="trust-symbol">⚡</span>
                <span>Standardized Health Model</span>
              </div>
              <div className="trust-item">
                <span className="trust-symbol">🩺</span>
                <span>Doctor-Patient Coordination Link</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Inquiry & Contact Channel */}
        <div className="streamlined-contact-channel">
          <div className="channel-text-col">
            <h3 className="channel-title">Get in Touch with the Med-X Team</h3>
            <p className="channel-desc">
              Have questions about connecting clinic systems, diagnostic lab onboarding, or our data architecture?
              We're here to assist healthcare organizations, clinicians, and patients.
            </p>
            <div className="channel-contact-points">
              <div className="point-item">
                <span className="point-icon">✉</span>
                <span className="point-label">Support Email:</span>
                <a href="mailto:support@medx.health" className="point-link">support@medx.health</a>
              </div>
              <div className="point-item">
                <span className="point-icon">◎</span>
                <span className="point-label">Institutional Affiliation:</span>
                <span className="point-val">Jankoti Health Technologies</span>
              </div>
            </div>
          </div>

          <div className="channel-form-col">
            {formSubmitted ? (
              <div className="channel-success-message" style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="success-check-icon" style={{ fontSize: '2rem', color: '#10B981' }}>✓</span>
                <h4 style={{ margin: '0.5rem 0', color: 'var(--medx-navy)' }}>Thank you for reaching out</h4>
                <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>Our institutional coordination team has received your message and will respond within 1 business day.</p>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setFormSubmitted(false)}
                  style={{ marginTop: '1rem' }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="channel-inquiry-form" noValidate>
                <div className="form-group-row">
                  <div className="form-field">
                    <label htmlFor="contact-name">Full Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Dr. Jane Doe"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@hospital.org"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="contact-subject">Inquiry Topic</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Clinical Integration">Hospital / Clinic Onboarding</option>
                    <option value="Laboratory Diagnostic">Laboratory Diagnostic Integration</option>
                    <option value="Privacy & Security">Data Privacy & Security Architecture</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we assist your clinical practice or health organization?"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="medx-btn medx-btn-primary submit-inquiry-btn" style={{ width: '100%', padding: '0.75rem' }}>
                  Send Institutional Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
