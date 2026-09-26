import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token into all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    
    // If token expired or unauthorized
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking auth or on login page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        // Option to handle logout event
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
