import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import MobileHeader from '../components/layout/MobileHeader';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ExpenseManagement from '../components/admin/ExpenseManagement';
import ExpenseManagementTest from '../components/admin/ExpenseManagementTest';
import Analytics from '../components/admin/Analytics';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BackendStatus from '../components/ui/BackendStatus';
import BackendConnectionTest from '../components/ui/BackendConnectionTest';
import BackendDiagnostics from '../components/ui/BackendDiagnostics';
import JwtDebugger from '../components/ui/JwtDebugger';
import { adminService } from '../services/apiService';

const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState({
        totalEmployees: 0,
        monthlyExpenses: 0,
        yearlyExpenses: 0,
        totalExpenses: 0
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [employeesRes, expensesRes, monthlyRes, yearlyRes] = await Promise.all([
                adminService.getEmployees(),
                adminService.getExpenses(),
                adminService.getMonthlyExpenses(),
                adminService.getYearlyExpenses()
            ]);

            setDashboardData({
                totalEmployees: employeesRes.data?.length || 0,
                totalExpenses: expensesRes.data?.length || 0,
                monthlyExpenses: monthlyRes.data?.totalMonthlyExpenses || 0,
                yearlyExpenses: yearlyRes.data?.totalYearlyExpenses || 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Set default values on error
            setDashboardData({
                totalEmployees: 0,
                totalExpenses: 0,
                monthlyExpenses: 0,
                yearlyExpenses: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'employees':
                return <EmployeeManagement />;
            case 'expenses':
                return <ExpenseManagement />;
            case 'expenses-test':
                return <ExpenseManagementTest />;
            case 'analytics':
                return <Analytics />;
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
                                <p className="text-gray-600 mt-2">Here's what's happening in your office portal.</p>
                            </div>
                            <BackendStatus />
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <span className="text-2xl">👥</span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalEmployees}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <span className="text-2xl">💰</span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                                                <p className="text-2xl font-bold text-gray-900">${(dashboardData.monthlyExpenses || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <span className="text-2xl">📊</span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Yearly Expenses</p>
                                                <p className="text-2xl font-bold text-gray-900">${(dashboardData.yearlyExpenses || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <span className="text-2xl">📋</span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalExpenses}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setActiveTab('employees')}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">👥</span>
                                                <span className="font-medium">Manage Employees</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('expenses')}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">💰</span>
                                                <span className="font-medium">Manage Expenses</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('expenses-test')}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">🧪</span>
                                                <span className="font-medium">Test Expenses</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('analytics')}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">📈</span>
                                                <span className="font-medium">View Analytics</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <BackendConnectionTest />
                                <BackendDiagnostics />
                                <JwtDebugger />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <MobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex-1 p-4 lg:p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;

