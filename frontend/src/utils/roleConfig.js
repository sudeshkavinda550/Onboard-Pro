export const ROLES = {
    ADMIN: 'admin',
    HR: 'hr',
    EMPLOYEE: 'employee'
  };
  
  export const PERMISSIONS = {
    // Admin has full access
    [ROLES.ADMIN]: {
      canViewAllDashboards: true,
      canManageAllUsers: true,
      canManageTemplates: true,
      canViewAnalytics: true,
      canManageDocuments: true,
      canAssignTasks: true,
      canEditSystemSettings: true,
      canDeleteRecords: true,
      canExportData: true,
      canManageDepartments: true
    },
    
    // HR has management access but not system settings
    [ROLES.HR]: {
      canViewAllDashboards: true,
      canManageAllUsers: false,
      canManageTemplates: true,
      canViewAnalytics: true,
      canManageDocuments: true,
      canAssignTasks: true,
      canEditSystemSettings: false,
      canDeleteRecords: false,
      canExportData: true,
      canManageDepartments: true
    },
    
    // Employee has limited access
    [ROLES.EMPLOYEE]: {
      canViewAllDashboards: false,
      canManageAllUsers: false,
      canManageTemplates: false,
      canViewAnalytics: false,
      canManageDocuments: false,
      canAssignTasks: false,
      canEditSystemSettings: false,
      canDeleteRecords: false,
      canExportData: false,
      canManageDepartments: false
    }
  };
  
  export const hasPermission = (role, permission) => {
    return PERMISSIONS[role]?.[permission] || false;
  };
  
  export const getAccessibleRoutes = (role) => {
    const baseRoutes = ['/dashboard', '/profile'];
    
    switch (role) {
      case ROLES.ADMIN:
        return [
          ...baseRoutes,
          '/admin/dashboard',
          '/hr/dashboard',
          '/hr/templates',
          '/hr/employees',
          '/hr/analytics',
          '/hr/create-template',
          '/admin/settings',
          '/admin/users'
        ];
      case ROLES.HR:
        return [
          ...baseRoutes,
          '/hr/dashboard',
          '/hr/templates',
          '/hr/employees',
          '/hr/analytics',
          '/hr/create-template'
        ];
      case ROLES.EMPLOYEE:
        return [
          ...baseRoutes,
          '/employee/dashboard',
          '/employee/tasks',
          '/employee/documents',
          '/employee/handbook',
          '/employee/profile'
        ];
      default:
        return baseRoutes;
    }
  };
  
  export const getDefaultRoute = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return '/admin/dashboard';
      case ROLES.HR:
        return '/hr/dashboard';
      case ROLES.EMPLOYEE:
        return '/employee/dashboard';
      default:
        return '/login';
    }
  };