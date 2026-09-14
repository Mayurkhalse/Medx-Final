import React from 'react';
import { Link } from 'react-router-dom';
import jankotiLogo from '../../assets/jankoti-logo.png';
import jankotiLogoWhite from '../../assets/jankoti-logo-white.png';
import jankotiIcon from '../../assets/jankoti-icon.png';

const Logo = ({ collapsed = false, light = false, size = 'default' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  // Height mappings for consistent alignment across headers, sidebar, and auth pages
  const iconHeight = isSmall ? 30 : isLarge ? 50 : 38;
  const logoHeight = isSmall ? 28 : isLarge ? 54 : 40;

  const currentLogo = light ? jankotiLogoWhite : jankotiLogo;

  return (
    <Link
      to="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        cursor: 'pointer',
      }}
      title="JanKoti"
    >
      {collapsed ? (
        <img
          src={jankotiIcon}
          alt="JanKoti"
          style={{
            height: iconHeight,
            width: iconHeight,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <img
          src={currentLogo}
          alt="JanKoti - Igniting Future Ideas"
          style={{
            height: logoHeight,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      )}
    </Link>
  );
};

export default Logo;
