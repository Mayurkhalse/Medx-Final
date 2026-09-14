import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactSection = () => {
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
    <section id="contact" className="landing-section contact-section">
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
              Bring your diagnostic records, at-home device telemetry, and longitudinal vitals together
              in one clear, secure platform built for proactive wellness and informed care.
            </p>

            <div className="conclusion-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In to Med-X
              </Link>
            </div>

            <div className="conclusion-trust-strip">
              <div className="trust-item">
                <span className="trust-symbol">🔒</span>
                <span>Privacy-First Architecture</span>
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
              Have questions about connecting clinic systems, compatible hardware devices, or our privacy architecture?
              We're here to help individuals, clinicians, and health organizations.
            </p>
            <div className="channel-contact-points">
              <div className="point-item">
                <span className="point-icon">✉</span>
                <span className="point-label">Support Email:</span>
                <a href="mailto:support@medx.health" className="point-link">support@medx.health</a>
              </div>
              <div className="point-item">
                <span className="point-icon">◎</span>
                <span className="point-label">Headquarters:</span>
                <span className="point-val">Jankoti Health Technologies, Cambridge, MA</span>
              </div>
            </div>
          </div>

          <div className="channel-form-col">
            {formSubmitted ? (
              <div className="channel-success-message">
                <span className="success-check-icon">✓</span>
                <h4>Thank you for reaching out</h4>
                <p>Our team has received your message and will respond within 1 business day.</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setFormSubmitted(false)}
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
                      placeholder="Jane Doe"
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
                      placeholder="jane@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="contact-subject">Topic</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Device Compatibility">Device Compatibility</option>
                    <option value="Clinic Integration">Clinic / Doctor Integration</option>
                    <option value="Privacy & Security">Privacy &amp; Security</option>
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
                    placeholder="How can we assist you?"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-inquiry-btn">
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
