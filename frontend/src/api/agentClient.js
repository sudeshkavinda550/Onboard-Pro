import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create a separate axios instance for agent routes
const agentClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

agentClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('Agent API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenKey: token ? 'token' : 'none'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage for agent request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

agentClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on auth pages
      if (!currentPath.includes('/login') && 
          !currentPath.includes('/register') && 
          !currentPath.includes('/forgot-password')) {
        
        console.error('Agent API: Authentication failed. Redirecting to login...');
        
        // Clear both tokens just to be safe
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Store the current path to redirect back after login (optional)
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        // Small delay to ensure state updates complete
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Enhanced error logging for debugging
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };
    
    console.error('Agent API Error:', errorDetails);
    
    return Promise.reject(error);
  }
);

export default agentClient;