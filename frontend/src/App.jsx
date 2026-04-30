import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import Layout from './components/common/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Employee
import EmployeeDashboard from './pages/employee/Dashboard';
import MyTasks from './pages/employee/MyTasks';
import MyDocuments from './pages/employee/MyDocuments';
import CompanyHandbook from './pages/employee/CompanyHandbook';
import Profile from './pages/employee/Profile';

// HR
import HRDashboard from './pages/hr/Dashboard';
import HRDocuments from './pages/hr/HRDocuments';
import Templates from './pages/hr/Templates';
import Employees from './pages/hr/Employees';
import Analytics from './pages/hr/Analytics';
import CreateTemplate from './pages/hr/CreateTemplate';
import AIAssistant from './pages/hr/AIAssistant';
import EmployeeList from './components/hr/EmployeeList';

// Admin
import AdminDashboard  from './components/dashboard/AdminDashboard';
import AdminHRAccounts from './pages/admin/AdminHRAccounts';
import AdminEmployees  from './pages/admin/AdminEmployees';
import AdminTemplates  from './pages/admin/AdminTemplates';
import AdminDocuments  from './pages/admin/AdminDocuments';
import AdminAuditLog   from './pages/admin/AdminAuditLog';
import AdminSettings   from './pages/admin/AdminSettings';

import Notifications from './pages/Notifications';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes with Layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  {/* Employee Routes */}
                  <Route
                    path="/employee/dashboard"
                    element={
                      <RoleBasedRoute allowedRoles={['employee']}>
                        <EmployeeDashboard />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/employee/tasks"
                    element={
                      <RoleBasedRoute allowedRoles={['employee']}>
                        <MyTasks />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/employee/documents"
                    element={
                      <RoleBasedRoute allowedRoles={['employee']}>
                        <MyDocuments />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/employee/handbook"
                    element={
                      <RoleBasedRoute allowedRoles={['employee']}>
                        <CompanyHandbook />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/employee/profile"
                    element={
                      <RoleBasedRoute allowedRoles={['employee']}>
                        <Profile />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/employee/notifications"
                    element={
                      <RoleBasedRoute allowedRoles={['employee']}>
                        <Notifications />
                      </RoleBasedRoute>
                    }
                  />

                  {/* HR Routes */}
                  <Route
                    path="/hr/dashboard"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <HRDashboard />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/hr/documents"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <HRDocuments />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/hr/templates"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <Templates />
                      </RoleBasedRoute>
                    }
                  />
                  
                  {/* Employee Management Routes - Organized */}
                  <Route
                    path="/hr/employees"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <Employees />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/hr/employees/list"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <EmployeeList />
                      </RoleBasedRoute>
                    }
                  />
                  
                  <Route
                    path="/hr/analytics"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <Analytics />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/hr/templates/create"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <CreateTemplate />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/hr/ai-assistant"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <AIAssistant />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/hr/notifications"
                    element={
                      <RoleBasedRoute allowedRoles={['hr', 'admin']}>
                        <Notifications />
                      </RoleBasedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/hr"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminHRAccounts />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/employees"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminEmployees />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/templates"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminTemplates />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/documents"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminDocuments />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminAuditLog />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminSettings />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/notifications"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <Notifications />
                      </RoleBasedRoute>
                    }
                  />

                  {/* Redirects and Fallback Routes */}
                  <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>

              <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;