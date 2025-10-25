import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
            console.error('❌ Backend server is not running on http://localhost:8081');
            console.error('💡 Please start your Spring Boot backend server');
            throw new Error('Backend server is not running. Please start your Spring Boot backend server on http://localhost:8081');
        }
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You do not have permission to perform this action.');
        }
        
        if (error.response?.status === 404) {
            throw new Error('API endpoint not found. Please check your backend implementation.');
        }
        
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authService = {
    signup: (userData) => apiClient.post('/auth/signup', userData),
    signin: (credentials) => apiClient.post('/auth/signin', credentials),
};

// Admin endpoints
export const adminService = {
    getEmployees: () => apiClient.get('/admin/employees'),
    deleteUser: (id) => apiClient.delete(`/admin/user/${id}`),
    updateUser: (id, userData) => apiClient.put(`/admin/user/${id}`, userData),
    getExpenses: () => apiClient.get('/admin/expenses'),
    addExpense: (expenseData) => apiClient.post('/admin/expense', expenseData),
    getMonthlyExpenses: () => apiClient.get('/admin/expenses/monthly'),
    getYearlyExpenses: () => apiClient.get('/admin/expenses/yearly'),
    getMonthlyBreakdown: () => apiClient.get('/admin/expenses/monthly-breakdown'),
};

// General user endpoints
export const userService = {
    getAllUsers: () => apiClient.get('/users'),
};

export default apiClient;
