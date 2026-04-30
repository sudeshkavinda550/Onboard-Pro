import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors || null,
      validationErrors: error.response?.data?.validationErrors || null,
      data: error.response?.data || null,
    };
    
    console.error('API Error:', errorDetails);
    
    if (error.response?.status === 400 && error.response?.data?.errors) {
      console.error('Validation Errors:', error.response.data.errors);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const analyticsApi = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard-stats');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getDepartmentCompletion: async () => {
    try {
      const response = await api.get('/analytics/department-completion');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching department completion:', error);
      throw error;
    }
  },

  getTaskStatusDistribution: async () => {
    try {
      const response = await api.get('/analytics/task-status');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching task status distribution:', error);
      throw error;
    }
  },
};

export const templateAPI = {
  getAll: (params = {}) => {
    return api.get('/templates', { params });
  },
  
  getById: (id) => {
    return api.get(`/templates/${id}`);
  },
  
  create: (data) => {
    console.log('Creating template with data:', JSON.stringify(data, null, 2));
    return api.post('/templates', data);
  },
  
  update: (id, data) => {
    console.log('Updating template with data:', JSON.stringify(data, null, 2));
    return api.put(`/templates/${id}`, data);
  },
  
  delete: (id) => {
    return api.delete(`/templates/${id}`);
  },
  
  duplicate: (id) => {
    return api.post(`/templates/${id}/duplicate`);
  },
  
  getTasks: (id) => {
    return api.get(`/templates/${id}/tasks`);
  },
  
  getEmployeesForAssignment: () => {
    return api.get('/templates/employees/for-assignment');
  },
  
  assignToEmployee: (templateId, employeeId) => {
    return api.post(`/templates/${templateId}/assign/${employeeId}`);
  },
  
  getTemplateAssignments: (id) => {
    return api.get(`/templates/${id}/assignments`);
  },
  
  getAllEmployeesProgress: () => {
    return api.get('/templates/employees/progress');
  },
  
  getTemplateAnalytics: (id) => {
    return api.get(`/templates/${id}/analytics`);
  },
};

export const documentAPI = {
  upload: (formData) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getByTask: (taskId) => {
    return api.get(`/documents/task/${taskId}`);
  },
  
  getByEmployee: (employeeId) => {
    return api.get(`/documents/employee/${employeeId}`);
  },
  
  review: (id, data) => {
    return api.put(`/documents/${id}/review`, data);
  },
  
  delete: (id) => {
    return api.delete(`/documents/${id}`);
  },
  
  download: (id) => {
    return api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
  },
};

export const employeeTaskAPI = {
  getMyTasks: () => {
    return api.get('/employee-tasks/my-tasks');
  },
  
  getMyProgress: () => {
    return api.get('/employee-tasks/my-progress');
  },
  
  updateTaskStatus: (id, status) => {
    return api.put(`/employee-tasks/${id}/status`, { status });
  },
  
  getEmployeeTasks: (employeeId) => {
    return api.get(`/employee-tasks/${employeeId}/tasks`);
  },
  
  getEmployeeProgress: (employeeId) => {
    return api.get(`/employee-tasks/${employeeId}/progress`);
  },
};

export const employeeAPI = {
  getAll: (params = {}) => {
    return api.get('/employees', { params });
  },
  
  getById: (id) => {
    return api.get(`/employees/${id}`);
  },
  
  create: (data) => {
    console.log('Creating employee with data:', JSON.stringify(data, null, 2));
    return api.post('/employees', data);
  },
  
  update: (id, data) => {
    console.log('Updating employee with data:', JSON.stringify(data, null, 2));
    return api.put(`/employees/${id}`, data);
  },
  
  delete: (id) => {
    return api.delete(`/employees/${id}`);
  },
  
  getTasks: (id) => {
    return api.get(`/employees/${id}/tasks`);
  },
  
  getProgress: (id) => {
    if (!id) {
      console.error('getProgress called with undefined id');
      return Promise.reject(new Error('Employee ID is required'));
    }
    return api.get(`/employees/${id}/progress`);
  },
  
  sendReminder: (id, data) => {
    return api.post(`/employees/${id}/reminder`, data);
  },
  
  assignTemplate: (id, templateId) => {
    return api.post(`/employees/${id}/assign-template`, { templateId });
  },
  
  getEmployeeTasks: function(id) {
    return this.getTasks(id);
  },
};

export const employeeApi = employeeAPI;

export const adminApi = {
  getAdminStats: () => api.get('/admin/stats'),
  getDeptStats: () => api.get('/admin/dept-stats'),
  getRecentActivity: () => api.get('/admin/recent-activity'),
  getSystemHealth: () => api.get('/admin/system-health'),

  getHRAccounts: () => api.get('/admin/hr-accounts'),
  createHRAccount: (data) => api.post('/admin/hr-accounts', data),
  updateHRStatus: (id, action) => api.patch(`/admin/hr-accounts/${id}/status`, { action }),
  deleteHRAccount: (id) => api.delete(`/admin/hr-accounts/${id}`),

  getAllEmployees: () => api.get('/admin/employees'),
  getAllTemplates: () => api.get('/admin/templates'),
  getAllDocuments: () => api.get('/admin/documents'),

  getAuditLog: (params) => api.get('/admin/audit-log', { params }),
  exportAuditLog: (config) => api.get('/admin/audit-log/export', config),

  getSettings: () => api.get('/admin/settings'),
  saveSettings: (data) => api.put('/admin/settings', data),

  exportData: (config) => api.get('/admin/export', config),
  dangerAction: (action) => api.post(`/admin/danger/${action}`),
};

export default api;