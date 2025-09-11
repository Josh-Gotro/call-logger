import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError } from '../types/api.types';

// Get API URL from environment or default to local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for auth token (if needed later)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (for future Azure AD integration)
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Transform error to consistent format
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      timestamp: new Date().toISOString(),
    };

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', apiError);
    }

    return Promise.reject(apiError);
  }
);

// Helper function for extracting data from axios response
export const extractData = <T>(response: { data: T }): T => response.data;