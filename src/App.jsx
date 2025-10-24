import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import TestComponent from './components/ui/TestComponent';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

const AppRoutes = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route 
                path="/login" 
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} 
            />
            <Route 
                path="/signup" 
                element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />} 
            />
            
            {/* Test Route for Tailwind */}
            <Route 
                path="/test" 
                element={<TestComponent />} 
            />
            
            {/* Protected Routes */}
            <Route 
                path="/" 
                element={
                    <ProtectedRoute>
                        {isAdmin ? <AdminDashboardPage /> : <UserDashboardPage />}
                    </ProtectedRoute>
                } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <NotificationProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </NotificationProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;

