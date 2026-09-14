import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="medx-breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard">Med-X</Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <span className="medx-breadcrumb-separator">/</span>

            {isLast || !item.to ? (
              <span className="medx-breadcrumb-current">
                {item.label}
              </span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
