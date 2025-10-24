import axios from 'axios';
import { mockEmployees, mockExpenses, mockAnalytics } from './mockData.js';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // 5 second timeout
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            console.warn('Backend server is not running. Using mock data for development.');
            throw new Error('BACKEND_NOT_RUNNING');
        }
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// Helper function to handle API calls with fallback
const apiCallWithFallback = async (apiCall, mockData) => {
    try {
        const response = await apiCall();
        return response;
    } catch (error) {
        if (error.message === 'BACKEND_NOT_RUNNING') {
            console.warn('Using mock data:', mockData);
            return { data: mockData };
        }
        throw error;
    }
};

// Auth endpoints
export const authService = {
    signup: (userData) => apiClient.post('/auth/signup', userData),
    signin: (credentials) => apiClient.post('/auth/signin', credentials),
};

// Admin endpoints with fallback
export const adminService = {
    getEmployees: () => apiCallWithFallback(
        () => apiClient.get('/admin/employees'),
        mockEmployees
    ),
    deleteUser: (id) => apiCallWithFallback(
        () => apiClient.delete(`/admin/user/${id}`),
        { message: "User deleted successfully (mock)" }
    ),
    getExpenses: () => apiCallWithFallback(
        () => apiClient.get('/admin/expenses'),
        mockExpenses
    ),
    addExpense: (expenseData) => apiCallWithFallback(
        () => apiClient.post('/admin/expenses', expenseData),
        { ...expenseData, id: Date.now() }
    ),
    getMonthlyExpenses: () => apiCallWithFallback(
        () => apiClient.get('/admin/expenses/monthly'),
        { totalMonthlyExpenses: mockAnalytics.monthlyTotal }
    ),
    getYearlyExpenses: () => apiCallWithFallback(
        () => apiClient.get('/admin/expenses/yearly'),
        { totalYearlyExpenses: mockAnalytics.yearlyTotal }
    ),
};

// General user endpoints with fallback
export const userService = {
    getAllUsers: () => apiCallWithFallback(
        () => apiClient.get('/users'),
        mockEmployees
    ),
};

export default apiClient;
