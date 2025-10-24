// API Configuration
export const API_BASE_URL = 'http://localhost:8081/api';

// User Roles
export const USER_ROLES = {
    ADMIN: 'ROLE_ADMIN',
    USER: 'ROLE_USER'
};

// Application Routes
export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/',
    ADMIN_DASHBOARD: '/admin',
    USER_DASHBOARD: '/user'
};

// Notification Types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Table Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    API: 'YYYY-MM-DD',
    TIME: 'HH:mm'
};

// Expense Categories
export const EXPENSE_CATEGORIES = [
    'Office Supplies',
    'Utilities',
    'Internet',
    'Phone',
    'Rent',
    'Equipment',
    'Software',
    'Travel',
    'Meals',
    'Other'
];

// Application Settings
export const APP_CONFIG = {
    NAME: 'Software Gaze Portal',
    VERSION: '1.0.0',
    DESCRIPTION: 'Modern Office Management System'
};
