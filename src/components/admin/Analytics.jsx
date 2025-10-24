import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        monthlyTotal: 0,
        yearlyTotal: 0,
        expenses: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [monthlyRes, yearlyRes, expensesRes] = await Promise.all([
                adminService.getMonthlyExpenses(),
                adminService.getYearlyExpenses(),
                adminService.getExpenses()
            ]);
            
            setAnalytics({
                monthlyTotal: monthlyRes.data.totalMonthlyExpenses,
                yearlyTotal: yearlyRes.data.totalYearlyExpenses,
                expenses: expensesRes.data
            });
        } catch (err) {
            setError('Failed to fetch analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getExpensesByType = () => {
        const typeMap = {};
        analytics.expenses.forEach(expense => {
            typeMap[expense.billType] = (typeMap[expense.billType] || 0) + parseFloat(expense.amount);
        });
        return Object.entries(typeMap).map(([type, amount]) => ({ type, amount }));
    };

    const getMonthlyTrend = () => {
        const monthlyData = {};
        analytics.expenses.forEach(expense => {
            const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyData[month] = (monthlyData[month] || 0) + parseFloat(expense.amount);
        });
        return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const expensesByType = getExpensesByType();
    const monthlyTrend = getMonthlyTrend();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                                <p className="text-3xl font-bold text-gray-900">${analytics.monthlyTotal.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <span className="text-2xl">📅</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Yearly Expenses</p>
                                <p className="text-3xl font-bold text-gray-900">${analytics.yearlyTotal.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Expenses by Type */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Expenses by Type</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {expensesByType.map(({ type, amount }) => (
                            <div key={type} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <span className="text-sm font-medium text-gray-900">{type}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">${amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Monthly Trend */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Monthly Trend</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {monthlyTrend.map(({ month, amount }) => (
                            <div key={month} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{month}</span>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{ 
                                                width: `${(amount / Math.max(...monthlyTrend.map(m => m.amount))) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">${amount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Recent Expenses */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bill Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.expenses.slice(0, 5).map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expense.billType}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${expense.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
