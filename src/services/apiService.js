import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        config.headers = config.headers || {};
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });

        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            throw new Error(`Backend server is not running. Please start your backend server at ${API_BASE_URL}`);
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            const serverMsg = error.response?.data?.message || 'Access denied. You do not have permission to perform this action.';
            throw new Error(serverMsg);
        }

        if (error.response?.status === 404) {
            throw new Error('API endpoint not found. Please check your backend implementation.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
