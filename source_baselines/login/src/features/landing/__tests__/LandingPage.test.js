import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

// Helper wrapper with router
const renderLandingPage = () => {
  return render(
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  );
};

describe('Med-X Public Landing Page', () => {
  test('renders hero and core sections', () => {
    renderLandingPage();

    // Hero title elements
    expect(screen.getAllByText(/Your Health\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Connected\./i).length).toBeGreaterThan(0);

    // Section headings
    expect(
      screen.getByText(/Healthcare data shouldn't be this fragmented\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What Med-X Offers: A Connected Health System/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How Med-X Works: From Fragmented to Actionable/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Start Your Connected Health Journey/i)
    ).toBeInTheDocument();
  });

  test('renders all 5 healthcare problem areas in features section', () => {
    renderLandingPage();

    expect(screen.getByText('Fragmented Patient Records')).toBeInTheDocument();
    expect(screen.getByText('Lack of Device Integration')).toBeInTheDocument();
    expect(screen.getByText('Limited Predictive Alerts')).toBeInTheDocument();
    expect(screen.getByText('Delayed Disease Detection')).toBeInTheDocument();
    expect(screen.getByText('Manual Healthcare Management')).toBeInTheDocument();
  });

  test('allows navigating hero carousel slides via next and indicator buttons', () => {
    renderLandingPage();

    // Initially Slide 1
    expect(screen.getByText('Intelligent Health Ecosystem')).toBeInTheDocument();

    // Click next button
    const nextBtn = screen.getByLabelText('Next story slide');
    fireEvent.click(nextBtn);

    // Should now show Slide 2 (Fragmented Records)
    expect(screen.getByText('The Fragmentation Crisis')).toBeInTheDocument();

    // Click slide 3 indicator tab (Connected Devices)
    const slide3Tab = screen.getByRole('tab', { name: /03 Connected Devices/i });
    fireEvent.click(slide3Tab);

    // Should show Slide 3
    expect(screen.getByText('Device Integration')).toBeInTheDocument();
  });

  test('supports pausing and resuming carousel autoplay', () => {
    renderLandingPage();

    const pauseBtn = screen.getByLabelText('Pause autoplay');
    fireEvent.click(pauseBtn);

    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByLabelText('Resume autoplay')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Resume autoplay'));
    expect(screen.getByText('Playing')).toBeInTheDocument();
  });
});
