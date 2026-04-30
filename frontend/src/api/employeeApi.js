import axiosInstance from './axios';

export const employeeApi = {
  // Employee profile endpoints
  getProfile: () => axiosInstance.get('/employees/profile'),
  updateProfile: (data) => axiosInstance.put('/employees/profile', data),
  getDashboard: () => axiosInstance.get('/employees/dashboard'),
  getDocuments: () => axiosInstance.get('/employees/documents'),
  
  // Profile picture upload
  uploadProfilePicture: (formData) => 
    axiosInstance.post('/employees/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // HR endpoints
  getAllEmployees: () => axiosInstance.get('/hr/employees'),
  getEmployeeById: (employeeId) => axiosInstance.get(`/hr/employees/${employeeId}`),
  createEmployee: (data) => axiosInstance.post('/hr/employees', data),
  updateEmployee: (employeeId, data) => axiosInstance.put(`/hr/employees/${employeeId}`, data),
  deleteEmployee: (employeeId) => axiosInstance.delete(`/hr/employees/${employeeId}`),
  assignOnboarding: (employeeId, templateId) => 
    axiosInstance.post(`/hr/employees/${employeeId}/assign-template`, { templateId }),
  getEmployeeProgress: (employeeId) => 
    axiosInstance.get(`/hr/employees/${employeeId}/progress`),
  sendReminder: (employeeId) => 
    axiosInstance.post(`/hr/employees/${employeeId}/send-reminder`),
};