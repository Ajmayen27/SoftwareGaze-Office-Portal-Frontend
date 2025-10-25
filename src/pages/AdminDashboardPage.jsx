import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import MobileHeader from '../components/layout/MobileHeader';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ExpenseManagement from '../components/admin/ExpenseManagement';
import ExpenseManagementTest from '../components/admin/ExpenseManagementTest';
import SimpleMonthlyBreakdown from '../components/admin/SimpleMonthlyBreakdown';
import Analytics from '../components/admin/Analytics';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BackendStatus from '../components/ui/BackendStatus';
import BackendConnectionTest from '../components/ui/BackendConnectionTest';
import BackendDiagnostics from '../components/ui/BackendDiagnostics';
import JwtDebugger from '../components/ui/JwtDebugger';
import ExpenseDebugger from '../components/ui/ExpenseDebugger';
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
            case 'monthly-breakdown':
                return <SimpleMonthlyBreakdown />;
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                {/* Total Employees Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-4 lg:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                                    <span className="text-2xl text-white">👥</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 animate-pulse">
                                                        {dashboardData.totalEmployees}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Monthly Expenses Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-4 lg:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                                    <span className="text-2xl text-white">💰</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                                        ${(dashboardData.monthlyExpenses || 0).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-green-600 font-medium">
                                                        Current Month Total
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Yearly Expenses Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-4 lg:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                                                    <span className="text-2xl text-white">📊</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-600">This Year</p>
                                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                                        ${(dashboardData.yearlyExpenses || 0).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-purple-600 font-medium">
                                                        {new Date().getFullYear()} Total
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Total Expenses Count Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-4 lg:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                                                    <span className="text-2xl text-white">📋</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                                                        {dashboardData.totalExpenses}
                                                    </p>
                                                    <p className="text-xs text-orange-600 font-medium">
                                                        Expense Records
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="transform transition-all duration-300 hover:shadow-xl">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <span className="mr-2">⚡</span>
                                        Quick Actions
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setActiveTab('employees')}
                                            className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                                                    <span className="text-lg">👥</span>
                                                </div>
                                                <div className="ml-4">
                                                    <span className="font-medium text-gray-900">Manage Employees</span>
                                                    <p className="text-sm text-gray-500">Add, edit, or remove employees</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => setActiveTab('expenses')}
                                            className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                                                    <span className="text-lg">💰</span>
                                                </div>
                                                <div className="ml-4">
                                                    <span className="font-medium text-gray-900">Manage Expenses</span>
                                                    <p className="text-sm text-gray-500">Track and manage expenses</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="text-green-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => setActiveTab('monthly-breakdown')}
                                            className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
                                                    <span className="text-lg">📅</span>
                                                </div>
                                                <div className="ml-4">
                                                    <span className="font-medium text-gray-900">Monthly Breakdown</span>
                                                    <p className="text-sm text-gray-500">View monthly expense analysis</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="text-purple-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => setActiveTab('analytics')}
                                            className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300">
                                                    <span className="text-lg">📈</span>
                                                </div>
                                                <div className="ml-4">
                                                    <span className="font-medium text-gray-900">View Analytics</span>
                                                    <p className="text-sm text-gray-500">Detailed reports and insights</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="text-orange-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <BackendConnectionTest />
                                <BackendDiagnostics />
                                <JwtDebugger />
                                <ExpenseDebugger />
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

