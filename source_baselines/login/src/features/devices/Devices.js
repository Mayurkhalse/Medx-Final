import React from 'react';
import { mockDevices } from '../../mock/medxData';

const Devices = () => {
  return (
    <div className="medx-page">
      <div className="medx-page-header">
        <p className="medx-eyebrow">Med-X Devices</p>
        <h1>Connected Devices</h1>
        <p className="medx-subtitle">
          Connect supported medical devices and review their incoming data.
        </p>
      </div>

      <div className="medx-info-banner">
        <strong>Device integration is upcoming</strong>
        <span>
          Real device measurements will eventually enter the same structured
          health-information ecosystem as laboratory observations.
        </span>
      </div>

      <section className="medx-card-grid">
        {mockDevices.map((device) => (
          <div className="medx-card" key={device.name}>
            <span className="medx-card-label">{device.type}</span>
            <strong>{device.name}</strong>
            <p>Last synchronization: {device.lastSync}</p>

            <span className="medx-status-badge medx-status-neutral">
              {device.status}
            </span>

            <div style={{ marginTop: '16px' }}>
              <button className="btn btn-outline btn-sm">
                Connect device
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Devices;
