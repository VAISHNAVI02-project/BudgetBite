import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-state" style={{ padding: '5rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  return children;
};

export default AdminRoute;
