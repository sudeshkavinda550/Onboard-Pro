export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    OVERDUE: 'overdue'
  };
  
  export const TASK_TYPES = {
    UPLOAD: 'upload',
    READ: 'read',
    WATCH: 'watch',
    MEETING: 'meeting',
    FORM: 'form',
    TRAINING: 'training'
  };
  
  export const DOCUMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  };
  
  export const USER_ROLES = {
    ADMIN: 'admin',
    HR: 'hr',
    EMPLOYEE: 'employee'
  };
  
  export const ONBOARDING_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    OVERDUE: 'overdue'
  };
  
  export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  export const MAX_FILE_SIZE_MB = 10;
  
  export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    API: 'yyyy-MM-dd',
    TIME: 'hh:mm a'
  };
  
  export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  };
  
  export const DEFAULT_PAGINATION = {
    PAGE: 1,
    LIMIT: 10,
    SORT_BY: 'createdAt',
    SORT_ORDER: 'desc'
  };
  
  export const LOCAL_STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme'
  };