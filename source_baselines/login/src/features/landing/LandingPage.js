import React, { useEffect } from 'react';
import HeroCarousel from './HeroCarousel';
import FeaturesSection from './FeaturesSection';
import CoverageSection from './CoverageSection';
import HowItWorksSection from './HowItWorksSection';
import ContactSection from './ContactSection';
import './landing.css';

const LandingPage = () => {
  // Smooth scroll to section if URL contains a hash on load or hash change
  useEffect(() => {
    const handleHashScroll = () => {
      const { hash } = window.location;
      if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement && typeof targetElement.scrollIntoView === 'function') {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (typeof window.scrollTo === 'function' && process.env.NODE_ENV !== 'test') {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          // Ignore unsupported scrollTo options
        }
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* 1. Hero / Interactive Story Carousel */}
      <HeroCarousel />

      {/* 2. Features / Problems Section */}
      <FeaturesSection />

      {/* 3. Coverage / What Med-X Offers Section */}
      <CoverageSection />

      {/* 4. How It Works Section */}
      <HowItWorksSection />

      {/* 5. Contact / Final CTA Section */}
      <ContactSection />
    </div>
  );
};

export default LandingPage;
