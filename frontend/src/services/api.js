import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // If token is invalid, clear local storage
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(new Error(message));
  }
);

const API = {
  auth: {
    login: async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    },
    
    register: async (userData) => {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    },
    
    getCurrentUser: async () => {
      const response = await apiClient.get('/auth/me');
      return response;
    }
  },
  
  // Health check
  health: async () => {
    const response = await apiClient.get('/health');
    return response;
  }
};

export default API;