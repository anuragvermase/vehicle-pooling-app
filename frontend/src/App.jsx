import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import API from './services/api';

// Import components
import LandingNavbar from './components/LandingNavbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FindRide from './pages/FindRides';
import OfferRide from './pages/OfferRides';
import AboutUs from './pages/AboutUs';
import OurTeam from './pages/OurTeam';
import Support from './pages/Support';
import HelpCenter from './pages/HelpCenter';
import Safety from './pages/Safety';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// NEW pages
import Profile from './pages/Profile';
import Overview from './pages/Overview';
import Settings from './pages/Settings';

/**
 * RouteStyleLoader
 * Ensures page-scoped CSS is injected when navigating to certain routes.
 * This fixes cases where a page renders without its CSS due to missing imports.
 */
function RouteStyleLoader() {
  const location = useLocation();

  useEffect(() => {
    // Load Profile page CSS only when on /profile (case-insensitive, trailing slash tolerant)
    if (/^\/profile\/?$/i.test(location.pathname)) {
      import('./pages/Profile.css').catch(() => {});
    }
  }, [location.pathname]);

  return null;
}

// Main App Content Component
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  const loadMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await API.auth.getCurrentUser();
      setUser(res?.user || null);
    } catch {
      // invalid token -> clear
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogin = (_userFromChild, token) => {
    // store only token; always fetch fresh user from server
    localStorage.setItem('token', token);
    loadMe();
    if (pendingAction) {
      navigate(pendingAction);
      setPendingAction(null);
    } else {
      navigate('/dashboard', { replace: false });
    }
  };

  const handleRegister = (_userFromChild, token) => {
    localStorage.setItem('token', token);
    loadMe();
    if (pendingAction) {
      navigate(pendingAction);
      setPendingAction(null);
    } else {
      navigate('/dashboard', { replace: false });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setPendingAction(null);
    navigate('/', { replace: true });
  };

  const handleShowLogin = () => navigate('/login');
  const handleShowRegister = () => navigate('/register');

  const handleCloseModal = () => {
    setPendingAction(null);
    navigate(-1);
  };

  // Ride actions (pre-login intent)
  const handleFindRide = () => {
    if (user) navigate('/find-ride');
    else {
      setPendingAction('/find-ride');
      navigate('/login');
    }
  };

  const handleOfferRide = () => {
    if (user) navigate('/offer-ride');
    else {
      setPendingAction('/offer-ride');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Loading... 🚗
      </div>
    );
  }

  return (
    <div className="App">
      {/* 🔽 Ensures page CSS (like Profile.css) is loaded on route change */}
      <RouteStyleLoader />

      <Routes>
        {/* Landing Page Route */}
        <Route
          path="/"
          element={
            <div>
              <LandingNavbar
                user={user}
                onLogout={handleLogout}
                onShowLogin={handleShowLogin}
                onShowRegister={handleShowRegister}
              />
              <LandingPage
                onFindRide={handleFindRide}
                onOfferRide={handleOfferRide}
              />
            </div>
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            <div>
              <LandingNavbar
                user={user}
                onLogout={handleLogout}
                onShowLogin={handleShowLogin}
                onShowRegister={handleShowRegister}
              />
              <LandingPage
                onFindRide={handleFindRide}
                onOfferRide={handleOfferRide}
              />

              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000
              }}>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  maxWidth: '400px',
                  width: '90%',
                  position: 'relative'
                }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '15px',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                  <Login onLogin={handleLogin} />
                </div>
              </div>
            </div>
          }
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={
            <div>
              <LandingNavbar
                user={user}
                onLogout={handleLogout}
                onShowLogin={handleShowLogin}
                onShowRegister={handleShowRegister}
              />
              <LandingPage
                onFindRide={handleFindRide}
                onOfferRide={handleOfferRide}
              />

              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000
              }}>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  maxWidth: '400px',
                  width: '90%',
                  position: 'relative'
                }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '15px',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                  <Register onRegister={handleRegister} />
                </div>
              </div>
            </div>
          }
        />

        {/* Dashboard Route - Protected */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Find Ride Route - Protected */}
        <Route
          path="/find-ride"
          element={
            user ? (
              <FindRide user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Offer Ride Route - Protected */}
        <Route
          path="/offer-ride"
          element={
            user ? (
              <OfferRide user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* NEW: Profile / Overview / Settings — Protected */}
        <Route
          path="/profile"
          element={
            user ? (
              <Profile />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/overview"
          element={
            user ? (
              <Overview />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <Settings />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Footer Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/support" element={<Support />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;