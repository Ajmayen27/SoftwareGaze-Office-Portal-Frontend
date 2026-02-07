import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage.jsx'));
const TestComponent = lazy(() => import('./components/ui/TestComponent'));

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center modern-bg">
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

const DashboardRoutes = () => {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {isAdmin
                ? <AdminDashboardPage activeTab={activeTab} setActiveTab={setActiveTab} />
                : <UserDashboardPage activeTab={activeTab} setActiveTab={setActiveTab} />}
        </MainLayout>
    );
};

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center modern-bg">
                <LoadingSpinner size="lg" />
            </div>
        }>
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
                            <DashboardRoutes />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Suspense>
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

