import apiClient from './apiService';

export const authService = {
    signup: (userData) => apiClient.post('/auth/signup', userData),
    signin: (credentials) => apiClient.post('/auth/signin', credentials),
};
