import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default LandingPage;