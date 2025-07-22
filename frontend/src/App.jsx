import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Import components
import LandingNavbar from './components/LandingNavbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FindRide from './pages/FindRides';
import OfferRide from './pages/OfferRides';

// Main App Content Component
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); // Store the action user wants to do
  const navigate = useNavigate();
  // const location = useLocation();

  useEffect(() => {
    // Comment out or remove the auto-login check to always show landing page
    // const token = localStorage.getItem('token');
    // const userData = localStorage.getItem('user');
    
    // if (token && userData) {
    //   setUser(JSON.parse(userData));
    // }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // If there's a pending action, navigate to it
    if (pendingAction) {
      navigate(pendingAction);
      setPendingAction(null);
    } else {
      navigate('/dashboard', { replace: false });
    }
  };

  const handleRegister = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // If there's a pending action, navigate to it
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
    localStorage.removeItem('user');
    setPendingAction(null);
    navigate('/', { replace: true });
  };

  const handleShowLogin = () => {
    navigate('/login');
  };

  const handleShowRegister = () => {
    navigate('/register');
  };

  const handleCloseModal = () => {
    setPendingAction(null);
    navigate(-1);
  };

  // Handle ride actions
  const handleFindRide = () => {
    if (user) {
      navigate('/find-ride');
    } else {
      setPendingAction('/find-ride');
      navigate('/login');
    }
  };

  const handleOfferRide = () => {
    if (user) {
      navigate('/offer-ride');
    } else {
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
      <Routes>
        {/* Landing Page Route */}
        <Route 
          path="/" 
          element={
            <div>
              <LandingNavbar 
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