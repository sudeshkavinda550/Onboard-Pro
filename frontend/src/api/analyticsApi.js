import axiosInstance from './axios';

export const analyticsApi = {
  getOverview: () => axiosInstance.get("/analytics/overview"),
  getEmployeeStats: () => axiosInstance.get("/analytics/employees"),
  getTaskStats: () => axiosInstance.get("/analytics/tasks"),
  
  getDashboardStats: () => axiosInstance.get("/analytics/dashboard/stats"),
  
  getDepartmentCompletion: () => axiosInstance.get("/analytics/department/completion"),
  
  getTaskStatusDistribution: () => axiosInstance.get("/analytics/tasks/status-distribution"),
};