import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ExpenseManagement from '../components/admin/ExpenseManagement';
import ExpenseManagementTest from '../components/admin/ExpenseManagementTest';
import AttendanceManagement from '../components/admin/AttendanceManagement';
import SimpleMonthlyBreakdown from '../components/admin/SimpleMonthlyBreakdown';
import Analytics from '../components/admin/Analytics';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import { adminService } from '../services/admin.service';
import DashboardCharts from '../components/admin/DashboardCharts';
import Settings from '../components/admin/Settings';
const AdminDashboardPage = ({ activeTab, setActiveTab }) => {
    const { user } = useAuth();

    // Fetch employees
    const { data: employeesRes, isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['employees'],
        queryFn: adminService.getEmployees
    });

    // Fetch expenses
    const { data: expensesRes, isLoading: isLoadingExpenses, refetch: refetchExpenses } = useQuery({
        queryKey: ['expenses'],
        queryFn: adminService.getExpenses
    });

    const employees = employeesRes?.data || [];
    const expenses = expensesRes?.data || [];
    const loading = isLoadingEmployees || isLoadingExpenses;

    const refreshData = () => {
        refetchExpenses();
        // employees automatically refetched if needed, but we can call queryClient.invalidateQueries if we had queryClient
    };

    // Derived data calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyExpenses = expenses.filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

    const yearlyExpenses = expenses.filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
    });
    const yearlyTotal = yearlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

    const dashboardData = {
        totalEmployees: employees.length,
        totalExpenses: expenses.length,
        monthlyExpenses: monthlyTotal,
        yearlyExpenses: yearlyTotal
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
            case 'settings':
                return <Settings />;
            default:
                const monthlyToYearlyPercent = dashboardData.yearlyExpenses > 0
                    ? Math.min(100, (dashboardData.monthlyExpenses / dashboardData.yearlyExpenses) * 100)
                    : 0;
                const projectedAnnualExpenses = dashboardData.monthlyExpenses * 12;
                const avgExpensePerEmployee = dashboardData.totalEmployees > 0
                    ? dashboardData.yearlyExpenses / dashboardData.totalEmployees
                    : 0;
                const avgExpensePerRecord = dashboardData.totalExpenses > 0
                    ? dashboardData.yearlyExpenses / dashboardData.totalExpenses
                    : 0;
                const expenseCoverage = projectedAnnualExpenses > 0
                    ? Math.min(100, (dashboardData.yearlyExpenses / projectedAnnualExpenses) * 100)
                    : 0;

                return (
                    <>
                        <div className="space-y-6">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(147, 51, 234, 0.5)' }}>Welcome back, {user?.username}!</h1>
                                    <p className="text-gray-200 mt-2 font-medium text-sm sm:text-base">Here's what's happening in your office portal.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={refreshData}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 shadow-lg transition-all duration-200 text-sm"
                                    >
                                        Refresh
                                    </button>

                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {/* Total Employees Card */}
                                    <Card className="transition-all duration-200 bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-blue-400/20 border-blue-500/30">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center min-w-0">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4.5 lg:h-4.5 xl:w-5.5 xl:h-5.5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-3 sm:ml-3.5 lg:ml-3 xl:ml-4 min-w-0">
                                                        <p className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs font-semibold text-blue-300 truncate uppercase tracking-widest opacity-80">Total Employees</p>
                                                        <p className="text-lg sm:text-xl lg:text-lg xl:text-2xl font-bold text-white animate-pulse truncate" title={dashboardData.totalEmployees}>
                                                            {dashboardData.totalEmployees}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Monthly Expenses Card */}
                                    <Card className="transition-all duration-200 bg-gradient-to-br from-green-600/20 via-green-500/15 to-green-400/20 border-green-500/30">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center min-w-0">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4.5 lg:h-4.5 xl:w-5.5 xl:h-5.5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-3 sm:ml-3.5 lg:ml-3 xl:ml-4 min-w-0">
                                                        <p className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs font-semibold text-green-300 truncate uppercase tracking-widest opacity-80">This Month</p>
                                                        <p className="text-base sm:text-lg lg:text-base xl:text-xl font-bold text-white truncate" title={`BDT ${(dashboardData.monthlyExpenses || 0).toFixed(2)}`}>
                                                            BDT {(dashboardData.monthlyExpenses || 0).toFixed(2)}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] text-green-400/80 font-medium truncate">
                                                            Current Month Total
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Yearly Expenses Card */}
                                    <Card className="transition-all duration-200 bg-gradient-to-br from-purple-600/20 via-purple-500/15 to-purple-400/20 border-purple-500/30">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center min-w-0">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4.5 lg:h-4.5 xl:w-5.5 xl:h-5.5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-3 sm:ml-3.5 lg:ml-3 xl:ml-4 min-w-0">
                                                        <p className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs font-semibold text-purple-300 truncate uppercase tracking-widest opacity-80">This Year</p>
                                                        <p className="text-base sm:text-lg lg:text-base xl:text-xl font-bold text-white truncate" title={`BDT ${(dashboardData.yearlyExpenses || 0).toFixed(2)}`}>
                                                            BDT {(dashboardData.yearlyExpenses || 0).toFixed(2)}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] text-purple-400/80 font-medium truncate">
                                                            {new Date().getFullYear()} Total
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Total Expenses Count Card */}
                                    <Card className="transition-all duration-200 bg-gradient-to-br from-orange-600/20 via-orange-500/15 to-orange-400/20 border-orange-500/30">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center min-w-0">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-11 xl:h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                                                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4.5 lg:h-4.5 xl:w-5.5 xl:h-5.5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-3 sm:ml-3.5 lg:ml-3 xl:ml-4 min-w-0">
                                                        <p className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs font-semibold text-orange-300 truncate uppercase tracking-widest opacity-80">Total Records</p>
                                                        <p className="text-lg sm:text-xl lg:text-lg xl:text-2xl font-bold text-white truncate" title={dashboardData.totalExpenses}>
                                                            {dashboardData.totalExpenses}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] text-orange-400/80 font-medium truncate">
                                                            Expense Records
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div >
                            )}

                            {/* Statistical Diagrams */}
                            {!loading && <DashboardCharts expenses={expenses} />}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="transform transition-all duration-300 hover:shadow-xl">
                                    <div className="px-6 py-4 border-b border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
                                        <h3 className="text-lg font-medium text-white flex items-center">
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
                                                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/20 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:from-blue-400 group-hover:to-blue-500 transition-colors duration-300 flex items-center justify-center">
                                                        <div className="w-5 h-5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className="font-medium text-white">Manage Employees</span>
                                                        <p className="text-sm text-gray-300">Add, edit, or remove employees</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className="text-blue-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('expenses')}
                                                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-500/20 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:from-green-400 group-hover:to-green-500 transition-colors duration-300 flex items-center justify-center">
                                                        <div className="w-5 h-5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className="font-medium text-white">Manage Expenses</span>
                                                        <p className="text-sm text-gray-300">Track and manage expenses</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className="text-green-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('monthly-breakdown')}
                                                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-500/20 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:from-purple-400 group-hover:to-purple-500 transition-colors duration-300 flex items-center justify-center">
                                                        <div className="w-5 h-5 bg-white rounded-sm"></div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className="font-medium text-white">Monthly Breakdown</span>
                                                        <p className="text-sm text-gray-300">View monthly expense analysis</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className="text-purple-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="transform transition-all duration-300 hover:shadow-xl">
                                    <div className="px-6 py-4 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
                                        <h3 className="text-lg font-medium text-white flex items-center">
                                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3 flex items-center justify-center">
                                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                                            </div>
                                            Operational Insights
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold text-white">Monthly spend vs yearly budget</p>
                                                <span className="text-sm font-bold text-emerald-400">{monthlyToYearlyPercent.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full h-3 rounded-full bg-gray-700/50">
                                                <div
                                                    className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                    style={{ width: `${monthlyToYearlyPercent}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-300 mt-1">BDT {(dashboardData.monthlyExpenses || 0).toFixed(2)} of BDT {(dashboardData.yearlyExpenses || 0).toFixed(2)} spent</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-indigo-600/20 border border-blue-500/30">
                                                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Projected Annual Spend</p>
                                                <p className="text-2xl font-bold text-white mt-1">BDT {projectedAnnualExpenses.toFixed(2)}</p>
                                                <p className="text-xs text-blue-400 mt-1">Based on current month</p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-600/20 via-orange-500/15 to-amber-600/20 border border-orange-500/30">
                                                <p className="text-xs font-semibold text-orange-300 uppercase tracking-wide">Expense Coverage</p>
                                                <p className="text-2xl font-bold text-white mt-1">{expenseCoverage.toFixed(1)}%</p>
                                                <p className="text-xs text-orange-400 mt-1">Yearly expenses vs projection</p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 via-purple-500/15 to-pink-600/20 border border-purple-500/30">
                                                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Avg. per Employee</p>
                                                <p className="text-2xl font-bold text-white mt-1">BDT {avgExpensePerEmployee.toFixed(2)}</p>
                                                <p className="text-xs text-purple-400 mt-1">Annual spend per employee</p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-600/20 via-gray-500/15 to-slate-600/20 border border-gray-500/30">
                                                <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Avg. per Expense Record</p>
                                                <p className="text-2xl font-bold text-white mt-1">BDT {avgExpensePerRecord.toFixed(2)}</p>
                                                <p className="text-xs text-gray-400 mt-1">Yearly spend per entry</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div >
                    </>
                );
        }
    };

    return renderContent();
};

export default AdminDashboardPage;

