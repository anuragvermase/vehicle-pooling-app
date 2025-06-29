 import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#667eea' }}>PoolRide</h2>
        {user && (
          <div>
            <span>Welcome, {user.name}</span>
            <button onClick={onLogout} style={{ marginLeft: '1rem' }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
