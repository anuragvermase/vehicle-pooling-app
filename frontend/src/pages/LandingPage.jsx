import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

const LandingPage = ({ onFindRide, onOfferRide }) => {
  return (
    <div className="landing-page">
      <Hero onFindRide={onFindRide} onOfferRide={onOfferRide} />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default LandingPage;