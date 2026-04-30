import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const fullWidthRoutes = [
    '/employee/dashboard',
    '/employee/tasks',
    '/employee/documents',
    '/employee/handbook',
    '/employee/profile',
    '/hr/dashboard',
    '/hr/documents',
    '/hr/templates',
    '/hr/templates/create',
    '/hr/employees',
    '/hr/employees/list',
    '/hr/analytics',
    '/hr/AIAssistant',
    '/admin/dashboard',
    '/admin/hr',
    '/admin/employees',
    '/admin/templates',
    '/admin/documents',
    '/admin/analytics',
    '/admin/settings',
  ];

  const isFullWidth =
    fullWidthRoutes.includes(location.pathname) ||
    location.pathname.endsWith('/notifications') ||
    location.pathname.toLowerCase().includes('/aiassistant') ||
    location.pathname.toLowerCase().includes('/ai-assistant');

  if (isPublicRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f1f5f9' }}>
      {user && <Sidebar />}
      <Navbar />
      <main className="flex-1">
        {isFullWidth ? (
          <Outlet />
        ) : (
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;