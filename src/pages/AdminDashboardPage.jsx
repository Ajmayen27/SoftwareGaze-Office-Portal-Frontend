import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import MobileHeader from '../components/layout/MobileHeader';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ExpenseManagement from '../components/admin/ExpenseManagement';
import ExpenseManagementTest from '../components/admin/ExpenseManagementTest';
import AttendanceManagement from '../components/admin/AttendanceManagement';
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
            
            // Try to get data from multiple sources
            const [employeesRes, expensesRes] = await Promise.all([
                adminService.getEmployees(),
                adminService.getExpenses()
            ]);

            // Calculate monthly and yearly totals from expenses data
            const expenses = expensesRes.data || [];
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            // Calculate monthly total (current month)
            let monthlyTotal = 0;
            let yearlyTotal = 0;
            
            try {
                const monthlyExpenses = expenses.filter(expense => {
                    if (!expense.date) return false;
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === currentMonth && 
                           expenseDate.getFullYear() === currentYear;
                });
                monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

                // Calculate yearly total (current year)
                const yearlyExpenses = expenses.filter(expense => {
                    if (!expense.date) return false;
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getFullYear() === currentYear;
                });
                yearlyTotal = yearlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
            } catch (calcError) {
                console.error('Error calculating totals:', calcError);
                // Fallback: try to get from backend endpoints
                try {
                    const [monthlyRes, yearlyRes] = await Promise.all([
                        adminService.getMonthlyExpenses(),
                        adminService.getYearlyExpenses()
                    ]);
                    monthlyTotal = monthlyRes.data?.totalMonthlyExpenses || 0;
                    yearlyTotal = yearlyRes.data?.totalYearlyExpenses || 0;
                } catch (backendError) {
                    console.error('Backend endpoints also failed:', backendError);
                }
            }

            // Debug logging
            console.log('Dashboard Data:', {
                totalExpenses: expenses.length,
                monthlyTotal,
                yearlyTotal,
                currentMonth: currentMonth + 1, // +1 because getMonth() returns 0-11
                currentYear,
                expensesSample: expenses.slice(0, 3) // Show first 3 expenses for debugging
            });

            setDashboardData({
                totalEmployees: employeesRes.data?.length || 0,
                totalExpenses: expenses.length,
                monthlyExpenses: monthlyTotal,
                yearlyExpenses: yearlyTotal
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
            case 'attendance':
                return <AttendanceManagement />;
            case 'monthly-breakdown':
                return <SimpleMonthlyBreakdown />;
            case 'analytics':
                return <Analytics />;
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(147, 51, 234, 0.5)' }}>Welcome back, {user?.username}!</h1>
                                <p className="text-gray-200 mt-2 font-medium text-sm sm:text-base">Here's what's happening in your office portal.</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={fetchDashboardData}
                                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                                >
                                 Refresh
                                </button>
                                <BackendStatus />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                                {/* Total Employees Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-3 sm:p-4 lg:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                                            <div className="flex items-center w-full sm:w-auto">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm"></div>
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Employees</p>
                                                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 animate-pulse">
                                                        {dashboardData.totalEmployees}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end w-full sm:w-auto">
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Monthly Expenses Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-3 sm:p-4 lg:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                                            <div className="flex items-center w-full sm:w-auto">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm"></div>
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">This Month</p>
                                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                                        ${(dashboardData.monthlyExpenses || 0).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-green-600 font-medium truncate">
                                                        Current Month Total
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end w-full sm:w-auto">
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Yearly Expenses Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-3 sm:p-4 lg:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                                            <div className="flex items-center w-full sm:w-auto">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm"></div>
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">This Year</p>
                                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                                        ${(dashboardData.yearlyExpenses || 0).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-purple-600 font-medium truncate">
                                                        {new Date().getFullYear()} Total
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end w-full sm:w-auto">
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Total Expenses Count Card */}
                                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="p-3 sm:p-4 lg:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                                            <div className="flex items-center w-full sm:w-auto">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm"></div>
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Records</p>
                                                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                                                        {dashboardData.totalExpenses}
                                                    </p>
                                                    <p className="text-xs text-orange-600 font-medium truncate">
                                                        Expense Records
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end w-full sm:w-auto">
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-bounce"></div>
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
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                                        </div>
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
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
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
                                                <div className="w-10 h-10 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="w-5 h-5 bg-green-600 rounded-sm"></div>
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
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="w-5 h-5 bg-purple-600 rounded-sm"></div>
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
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="w-5 h-5 bg-orange-600 rounded-sm"></div>
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
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen modern-bg">
            <div className="floating-shapes"></div>
            <div className="pattern-overlay"></div>
            <div className="content-layer">
            <MobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex-1 p-4 lg:p-8">
                    {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;

