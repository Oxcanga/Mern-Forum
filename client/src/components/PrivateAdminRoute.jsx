import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PrivateAdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!(user?.role === 'admin' || user?.role === 'moderator')) {
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateAdminRoute;
