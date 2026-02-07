import apiClient from './apiService';

export const userService = {
    getAllUsers: () => apiClient.get('/users'),
};
