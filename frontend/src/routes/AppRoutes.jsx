import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/Layout/ProtectedRoute';

// Import pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import FeeStructure from '../pages/FeeStructure';
import FeeCollection from '../pages/FeeCollection';
import Reports from '../pages/Reports';
import Users from '../pages/Users';
import ParentDashboard from '../pages/ParentDashboard';

const AppRoutes = () => {
  // Get user role from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Protected Routes - Dashboard (All roles) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Student Management - Admin & Accountant only */}
      <Route path="/students" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
          <Students />
        </ProtectedRoute>
      } />

      {/* Fee Structure - Admin only */}
      <Route path="/fee-structure" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <FeeStructure />
        </ProtectedRoute>
      } />

      {/* Fee Collection - Admin & Accountant only */}
      <Route path="/collection" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
          <FeeCollection />
        </ProtectedRoute>
      } />

      {/* Reports - Admin & Accountant only */}
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* User Management - Admin only */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Users />
        </ProtectedRoute>
      } />

            <Route path="/parent-dashboard" element={
        <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentDashboard />
        </ProtectedRoute>
        } />

      {/* 404 Page - Catch all */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-6 text-lg">Oops! Page not found</p>
            <a 
              href={userRole === 'ADMIN' ? '/dashboard' : userRole === 'ACCOUNTANT' ? '/collection' : '/login'} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl transition duration-200 inline-block"
            >
              Go Home
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;