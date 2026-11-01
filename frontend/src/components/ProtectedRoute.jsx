import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-gate-loading" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#F7F5EF',
        color: '#6C6677'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(232, 121, 69, 0.2)',
          borderTopColor: '#E87945',
          borderRadius: '50%',
          animation: 'auth-spin 0.8s linear infinite'
        }} />
        <p>Verifying authentication...</p>
        <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
