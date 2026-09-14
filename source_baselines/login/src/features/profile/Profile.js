import React from 'react';
import { mockPatient } from '../../mock/medxData';

const Profile = () => {
  return (
    <div className="medx-page">
      <div className="medx-page-header">
        <p className="medx-eyebrow">Med-X</p>
        <h1>Profile & Settings</h1>
        <p className="medx-subtitle">
          Manage the information and preferences used by Med-X.
        </p>
      </div>

      <section className="medx-profile-card">
        <div className="medx-profile-avatar">
          {mockPatient.name.charAt(0)}
        </div>

        <div>
          <span className="medx-card-label">Demo patient</span>
          <h2>{mockPatient.name}</h2>
          <p>Last updated: {mockPatient.lastUpdated}</p>
        </div>

        <button className="btn btn-outline btn-sm">
          Edit profile
        </button>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">Personal context</p>
            <h2>Health information context</h2>
          </div>
        </div>

        <div className="medx-context-grid">
          <div className="medx-context-item">
            <span>Name</span>
            <strong>{mockPatient.name}</strong>
          </div>

          <div className="medx-context-item">
            <span>Age</span>
            <strong>{mockPatient.age}</strong>
          </div>

          <div className="medx-context-item">
            <span>Sex</span>
            <strong>{mockPatient.sex}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
