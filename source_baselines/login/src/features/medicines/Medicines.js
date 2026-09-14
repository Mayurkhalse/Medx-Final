import React from 'react';
import { mockMedicines } from '../../mock/medxData';

const Medicines = () => {
  return (
    <div className="medx-page">
      <div className="medx-page-header medx-page-header-row">
        <div>
          <p className="medx-eyebrow">Med-X</p>
          <h1>Medicines</h1>
          <p className="medx-subtitle">
            Keep medication information organized alongside your health record.
          </p>
        </div>

        <button className="btn btn-primary">Add medicine</button>
      </div>

      <div className="medx-info-banner">
        <strong>Future integration</strong>
        <span>
          Medication records can later be connected with the patient's
          longitudinal health information.
        </span>
      </div>

      <section className="medx-card-grid">
        {mockMedicines.map((medicine) => (
          <div className="medx-card" key={medicine.name}>
            <span className="medx-card-label">Medication</span>
            <strong>{medicine.name}</strong>
            <p>Dose: {medicine.dose}</p>
            <p>Frequency: {medicine.frequency}</p>
            <span className="medx-status-badge medx-status-neutral">
              {medicine.status}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Medicines;
