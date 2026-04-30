import apiClient from './apiClient';

export const dashboardApi = {
  getEmployeeDashboard: () => apiClient.get('/dashboard/employee'),
  getHRDashboard: () => apiClient.get('/dashboard/hr'),
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
  getTaskStatistics: () => apiClient.get('/dashboard/statistics'),
};

export default dashboardApi;