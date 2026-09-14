import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-brand">
          <h4>Med-X</h4>
          <span className="footer-product">Med-X</span>
          <p>
            An intelligent health information and monitoring platform designed
            to help people understand and manage their health information.
          </p>
        </div>

        <div className="footer-section">
          <h4>Platform</h4>
          <a href="/#features">Problem Areas</a>
          <a href="/#coverage">What Med-X Offers</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#contact">Contact & Inquiry</a>
        </div>

        <div className="footer-section">
          <h4>Features</h4>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/health">My Health</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/monitoring">Monitoring</Link>
          <Link to="/devices">Devices</Link>
        </div>

        <div className="footer-section">
          <h4>Account</h4>
          <Link to="/profile">Profile & Settings</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Med-X • Med-X. All rights reserved.
        </p>

        <div className="footer-legal">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Data & Consent</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
