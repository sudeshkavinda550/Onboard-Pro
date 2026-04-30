export const emailValidator = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const passwordValidator = (password) => {
    return password.length >= 6;
  };
  
  export const phoneValidator = (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  };
  
  export const validateFileType = (file, allowedTypes) => {
    if (!file) return false;
    const fileType = file.type;
    return allowedTypes.includes(fileType);
  };
  
  export const validateFileSize = (file, maxSizeMB) => {
    if (!file) return false;
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  };
  
  export const validateRequired = (value) => {
    return value && value.trim().length > 0;
  };
  
  export const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };
  
  export const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  export const validateNumber = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };
  
  export const validateArray = (array, minLength = 0) => {
    return Array.isArray(array) && array.length >= minLength;
  };