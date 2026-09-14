import React, { useState, useEffect, useRef, useCallback } from 'react';
import IntroSlide from './slides/IntroSlide';
import RecordsSlide from './slides/RecordsSlide';
import DevicesSlide from './slides/DevicesSlide';
import MonitoringSlide from './slides/MonitoringSlide';
import AwarenessSlide from './slides/AwarenessSlide';
import ConnectedHealthSlide from './slides/ConnectedHealthSlide';

const SLIDES = [
  { id: 'intro', number: '01', title: 'Med-X Introduction', subtitle: 'Connected Ecosystem', component: IntroSlide },
  { id: 'records', number: '02', title: 'Fragmented Records', subtitle: 'The Silo Problem', component: RecordsSlide },
  { id: 'devices', number: '03', title: 'Connected Devices', subtitle: 'Home Telemetry', component: DevicesSlide },
  { id: 'monitoring', number: '04', title: 'Monitoring & Alerts', subtitle: 'Proactive Signals', component: MonitoringSlide },
  { id: 'awareness', number: '05', title: 'Earlier Awareness', subtitle: 'Longitudinal Trends', component: AwarenessSlide },
  { id: 'connected', number: '06', title: 'Connected Health', subtitle: 'Unified Care Platform', component: ConnectedHealthSlide },
];

const AUTOPLAY_INTERVAL = 5500; // 5.5 seconds per slide storytelling target

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const slideParam = parseInt(params.get('slide'), 10);
      if (!isNaN(slideParam) && slideParam >= 0 && slideParam < SLIDES.length) {
        return slideParam;
      }
    }
    return 0;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Autoplay progression
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      goToNextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, goToNextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextSlide();
    }
  };

  // Touch / Swipe support
  const minSwipeDistance = 45;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPrevSlide();
    }
  };

  const CurrentSlideComponent = SLIDES[currentSlide].component;

  return (
    <section
      className="hero-carousel-section"
      ref={carouselRef}
      aria-roledescription="carousel"
      aria-label="Med-X Product Story Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      tabIndex="0"
    >
      <div className="hero-carousel-container">
        {/* Active Slide Viewport */}
        <div
          className="hero-slide-viewport"
          aria-live={isPaused ? 'polite' : 'off'}
          id={`slide-${currentSlide}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${currentSlide + 1} of ${SLIDES.length}: ${SLIDES[currentSlide].title}`}
        >
          <CurrentSlideComponent />
        </div>

        {/* Carousel Floating Controls: Previous / Next / Pause */}
        <div className="carousel-nav-controls">
          <button
            type="button"
            className="carousel-arrow-btn prev-btn"
            onClick={goToPrevSlide}
            aria-label="Previous story slide"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            type="button"
            className="carousel-play-pause-btn"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            )}
            <span className="play-pause-label">{isPaused ? 'Paused' : 'Playing'}</span>
          </button>

          <button
            type="button"
            className="carousel-arrow-btn next-btn"
            onClick={goToNextSlide}
            aria-label="Next story slide"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Interactive Slide Indicators (Tabs / Timeline Bar) */}
        <div className="carousel-indicators-wrapper" role="tablist" aria-label="Carousel slide navigation">
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                id={`carousel-tab-${index}`}
                aria-selected={isActive}
                aria-controls={`slide-${index}`}
                className={`carousel-indicator-tab ${isActive ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                <div className="indicator-progress-bar">
                  <div
                    className="indicator-progress-fill"
                    style={{
                      width: isActive && !isPaused ? '100%' : isActive ? '100%' : '0%',
                      animationDuration: isActive && !isPaused ? `${AUTOPLAY_INTERVAL}ms` : 'none'
                    }}
                  ></div>
                </div>
                <div className="indicator-text-meta">
                  <span className="indicator-number">{slide.number}</span>
                  <span className="indicator-label">{slide.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
