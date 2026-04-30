import axiosInstance from './axios';

export const taskApi = {
  getMyTasks: (filters = {}) => axiosInstance.get('/tasks/my-tasks', { params: filters }),
  getTaskById: (taskId) => axiosInstance.get(`/tasks/${taskId}`),
  updateTaskStatus: (taskId, data) => axiosInstance.put(`/tasks/${taskId}/status`, data),
  uploadTaskDocument: (taskId, formData) => 
    axiosInstance.post(`/tasks/${taskId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getTaskProgress: () => axiosInstance.get('/tasks/progress'),
  markTaskAsRead: (taskId) => axiosInstance.post(`/tasks/${taskId}/mark-read`),
  getOverdueTasks: () => axiosInstance.get('/tasks/overdue'),
  
  getTaskStats: () => axiosInstance.get('/tasks/checklist/stats'),
  getTaskSummary: (filters = {}) => axiosInstance.get('/tasks/checklist/summary', { params: filters }),
  getTodayTasks: () => axiosInstance.get('/tasks/checklist/today'),
  bulkUpdateTaskStatus: (updates) => 
    axiosInstance.post('/tasks/checklist/bulk-status', { updates }),
  getTaskAnalytics: () => axiosInstance.get('/tasks/checklist/analytics'),
  getFilteredTasks: (filters) => 
    axiosInstance.get('/tasks/checklist/filtered', { params: filters }),
  
  getAllTasks: () => axiosInstance.get('/hr/tasks'),
  getEmployeeTasks: (employeeId) => axiosInstance.get(`/hr/employees/${employeeId}/tasks`),
  assignTask: (data) => axiosInstance.post('/hr/tasks/assign', data),
  updateTask: (taskId, data) => axiosInstance.put(`/hr/tasks/${taskId}`, data),
  deleteTask: (taskId) => axiosInstance.delete(`/hr/tasks/${taskId}`),
  getTaskAnalytics: () => axiosInstance.get('/hr/tasks/analytics'),
};

export const taskUtils = {
  /**
   * Format task data for frontend display
   */
  formatTaskForFrontend: (task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status || 'pending',
    category: task.taskType || task.category || 'general',
    priority: task.priority || 'medium',
    estimatedTime: task.estimatedTime || task.estimated_time || 30,
    dueDate: task.dueDate || task.due_date,
    assignedDate: task.assignedDate || task.assigned_date,
    completedDate: task.completedDate || task.completed_date,
    resourceUrl: task.resourceUrl || task.resource_url,
    isRequired: task.isRequired !== false && task.is_required !== false,
    order: task.order || task.order_index || 0,
    templateName: task.templateName || task.template_name,
    notes: task.notes,
    isOverdue: task.isOverdue || 
      (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed') ||
      (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed')
  }),
  
  /**
   * Calculate progress from task list
   */
  calculateProgress: (tasks) => {
    const validTasks = Array.isArray(tasks) ? tasks : [];
    const total = validTasks.length;
    const completed = validTasks.filter(t => t.status === 'completed').length;
    const inProgress = validTasks.filter(t => t.status === 'in_progress').length;
    const pending = validTasks.filter(t => t.status === 'pending' || !t.status).length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },
  
  /**
   * Filter tasks based on filter criteria
   */
  filterTasks: (tasks, filter) => {
    const validTasks = Array.isArray(tasks) ? tasks : [];
    
    if (filter === 'all') return validTasks;
    if (filter === 'overdue') {
      return validTasks.filter(task => 
        (task.dueDate || task.due_date) && 
        new Date(task.dueDate || task.due_date) < new Date() && 
        task.status !== 'completed'
      );
    }
    return validTasks.filter(task => task.status === filter);
  },
  
  /**
   * Sort tasks by priority and due date
   */
  sortTasks: (tasks) => {
    const priorityOrder = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };
    
    return [...tasks].sort((a, b) => {
      const statusOrder = {
        'pending': 1,
        'in_progress': 2,
        'completed': 3
      };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      const aDue = a.dueDate || a.due_date;
      const bDue = b.dueDate || b.due_date;
      
      if (aDue && bDue) {
        return new Date(aDue) - new Date(bDue);
      }
      
      return (a.order || a.order_index || 0) - (b.order || b.order_index || 0);
    });
  },
  
  /**
   * Group tasks by category
   */
  groupByCategory: (tasks) => {
    return tasks.reduce((groups, task) => {
      const category = task.category || task.taskType || 'uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(task);
      return groups;
    }, {});
  },
  
  /**
   * Get task completion rate
   */
  getCompletionRate: (tasks, period = 'week') => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    const periodTasks = tasks.filter(task => 
      task.completedDate && new Date(task.completedDate) >= startDate
    );
    
    const completedInPeriod = periodTasks.filter(t => t.status === 'completed').length;
    const totalInPeriod = periodTasks.length;
    
    return totalInPeriod > 0 ? (completedInPeriod / totalInPeriod) * 100 : 0;
  }
};