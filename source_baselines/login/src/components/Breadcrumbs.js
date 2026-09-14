import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LABELS = {
  dashboard: 'Home',
  health: 'My Health',
  reports: 'Reports',
  monitoring: 'Monitoring',
  alerts: 'Alerts',
  medicines: 'Medicines',
  devices: 'Devices',
  'ask-medx': 'Ask Med-X',
  profile: 'Profile & Settings',
};

const Breadcrumbs = ({ current }) => {
  const location = useLocation();

  const parts = location.pathname
    .split('/')
    .filter(Boolean);

  const items = [];

  if (parts.length === 0) {
    items.push({
      label: 'Home',
      path: null,
      current: true,
    });
  } else {
    parts.forEach((part, index) => {
      const path = `/${parts.slice(0, index + 1).join('/')}`;
      const isLast = index === parts.length - 1;

      items.push({
        label:
          isLast && current
            ? current
            : LABELS[part] || part,
        path: isLast ? null : path,
        current: isLast,
      });
    });
  }

  return (
    <nav className="medx-breadcrumbs" aria-label="Breadcrumb">
      <Link to="/" className="medx-breadcrumb-home">
        Med-X
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          <span className="medx-breadcrumb-separator">/</span>

          {item.path ? (
            <Link to={item.path}>
              {item.label}
            </Link>
          ) : (
            <span className="medx-breadcrumb-current">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
