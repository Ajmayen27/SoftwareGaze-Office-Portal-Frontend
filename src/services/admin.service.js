import apiClient from './apiService';

export const adminService = {
    getEmployees: () => apiClient.get('/admin/employees'),
    deleteUser: (id) => apiClient.delete(`/admin/user/${id}`),
    updateUser: (id, userData) => apiClient.put(`/admin/update/${id}`, userData),
    getExpenses: () => apiClient.get('/admin/expenses'),
    addExpense: (expenseData, config = {}) => {
        if (typeof FormData !== 'undefined' && expenseData instanceof FormData) {
            const cfg = { ...config, headers: { ...(config.headers || {}) } };
            delete cfg.headers['Content-Type'];
            delete cfg.headers['content-type'];
            return apiClient.post('/admin/expense', expenseData, cfg);
        }
        return apiClient.post('/admin/expense', expenseData, config);
    },
    deleteExpense: (id) => apiClient.delete(`/admin/expense/delete/${id}`),
    updateExpense: (id, expenseData, config = {}) => {
        if (typeof FormData !== 'undefined' && expenseData instanceof FormData) {
            const cfg = { ...config, headers: { ...(config.headers || {}) } };
            delete cfg.headers['Content-Type'];
            delete cfg.headers['content-type'];
            return apiClient.put(`/admin/expense/update/${id}`, expenseData, cfg);
        }
        return apiClient.put(`/admin/expense/update/${id}`, expenseData, config);
    },
    getMonthlyExpenses: () => apiClient.get('/admin/expenses/monthly'),
    getYearlyExpenses: () => apiClient.get('/admin/expenses/yearly'),
    getMonthlyBreakdown: () => apiClient.get('/admin/expenses/monthly-breakdown'),
    exportMonthlyReport: (month, year, tag) => {
        const params = { month, year };
        if (tag && tag !== 'all') {
            return apiClient.get('/admin/expenses/report/monthly/tag', {
                params: { ...params, tag },
                responseType: 'blob'
            });
        }
        return apiClient.get('/admin/expenses/report/monthly', {
            params,
            responseType: 'blob'
        });
    },
    addAttendance: (attendanceData) => apiClient.post('/admin/add/attendance', attendanceData),
    getAttendanceSummary: (month, year) => apiClient.get('/admin/attendance/summary', { params: { month, year } }),
    getIndividualAttendance: (username, month, year) => apiClient.get(`/admin/attendance/summary/${username}`, { params: { month, year } }),
    deleteAttendance: (username, year, month, day) => apiClient.delete('/admin/attendance/delete', { params: { username, year, month, day } }),
    getGracePeriod: () => apiClient.get('/admin/attendance/grace-period'),
    getLatestGracePeriod: () => apiClient.get('/admin/grace-period/latest'),
    updateGracePeriod: (graceHours) => apiClient.put(`/admin/attendance/grace-period`, null, { params: { graceHours } }),
};
