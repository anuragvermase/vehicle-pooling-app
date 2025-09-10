import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../services/api';

export default function AdminRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [ok, setOk] = useState(null); // null = loading, true = allow, false = deny

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!token) {
        if (mounted) setOk(false);
        return;
      }
      try {
        const res = await API.auth.getCurrentUser();
        const role = res?.user?.role;
        const isBanned = res?.user?.isBanned;
        if (mounted) setOk(!!token && !isBanned && (role === 'admin' || role === 'superadmin'));
      } catch {
        if (mounted) setOk(false);
      }
    }
    check();
    return () => { mounted = false; };
  }, [token]);

  if (ok === null) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'50vh'}}>
        Checking access…
      </div>
    );
  }
  if (!ok) return <Navigate to="/" replace />;
  return children;
}
