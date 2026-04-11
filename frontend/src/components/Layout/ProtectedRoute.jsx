import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from './Layout';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (userRole === 'ADMIN') return <Navigate to="/dashboard" replace />;
    if (userRole === 'ACCOUNTANT') return <Navigate to="/collection" replace />;
    if (userRole === 'PARENT') return <Navigate to="/my-child" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;