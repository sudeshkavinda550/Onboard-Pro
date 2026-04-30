import axios from 'axios';
import { toast } from 'react-toastify';
import { getToken, removeToken } from '../utils/tokenStorage';

console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('All env vars:', process.env);

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

console.log('Using API Base URL:', BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message);
    console.error('Full URL:', error.config?.baseURL + error.config?.url);
    
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('API endpoint not found. Please check server configuration.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please check if the backend is running on port 5000.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;