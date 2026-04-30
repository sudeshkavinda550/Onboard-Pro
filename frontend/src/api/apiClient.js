import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password')) {
        console.error('Authentication failed. Redirecting to login...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user'); 
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API Error:', errorMessage);
    
    return Promise.reject(error);
  }
);

export default apiClient;