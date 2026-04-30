import agentClient from './agentClient';

// All employees (optional: filter by onboarding_status)
export const agentGetAllEmployees = () =>
  agentClient.get('/agent/employees');

export const agentGetEmployeesByStatus = (status) =>
  agentClient.get(`/agent/employees?onboarding_status=${status}`);

// Single employee by UUID
export const agentGetEmployeeById = (id) =>
  agentClient.get(`/agent/employees/${id}`);

// Progress % for one employee
export const agentGetEmployeeProgress = (id) =>
  agentClient.get(`/agent/employees/${id}/progress`);

// Task list — optional status filter
export const agentGetEmployeeTasks = (id, status = null) =>
  agentClient.get(`/agent/employees/${id}/tasks${status ? `?status=${status}` : ''}`);

// Documents — optional employee_id and/or status filter
export const agentGetDocuments = (employeeId = null, status = null) => {
  const params = new URLSearchParams();
  if (employeeId) params.set('employee_id', employeeId);
  if (status)     params.set('status', status);
  const q = params.toString() ? `?${params}` : '';
  return agentClient.get(`/agent/documents${q}`);
};

// Company-wide overview stats
export const agentGetAnalyticsOverview = () =>
  agentClient.get('/agent/analytics/overview');

// Per-department stats
export const agentGetDepartmentStats = () =>
  agentClient.get('/agent/analytics/departments');

// Send a reminder notification
export const agentSendReminder = (userId, message) =>
  agentClient.post('/agent/notifications/send', {
    user_id: userId,
    title:   'Onboarding Reminder',
    message,
    type:    'task_reminder',
  });