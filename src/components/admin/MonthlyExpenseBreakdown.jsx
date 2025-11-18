import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const MonthlyExpenseBreakdown = () => {
    const [breakdown, setBreakdown] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showError } = useNotification();

    useEffect(() => {
        fetchBreakdown();
    }, []);

    const fetchBreakdown = async () => {
        try {
            setLoading(true);
            // Try to get monthly breakdown from backend
            try {
                const response = await adminService.getMonthlyBreakdown();
                setBreakdown(response.data);
            } catch (backendError) {
                console.warn('Monthly breakdown endpoint not available, calculating from expenses data');
                // Fallback: Get all expenses and calculate monthly breakdown
                const expensesResponse = await adminService.getExpenses();
                const expenses = expensesResponse.data || [];
                
                // Calculate monthly breakdown from expenses data
                const monthlyBreakdown = calculateMonthlyBreakdown(expenses);
                setBreakdown(monthlyBreakdown);
            }
        } catch (err) {
            setError('Failed to fetch monthly breakdown');
            showError('Failed to fetch monthly breakdown');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyBreakdown = (expenses) => {
        const currentYear = new Date().getFullYear();
        const monthlyData = {};
        
        // Initialize all months with 0
        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        
        monthNames.forEach(month => {
            monthlyData[month] = 0;
        });
        
        // Calculate expenses for each month
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getFullYear() === currentYear) {
                const monthIndex = expenseDate.getMonth();
                const monthName = monthNames[monthIndex];
                monthlyData[monthName] = (monthlyData[monthName] || 0) + expense.amount;
            }
        });
        
        return monthlyData;
    };

    const getMonthName = (monthKey) => {
        const monthNames = {
            'january': 'January',
            'february': 'February',
            'march': 'March',
            'april': 'April',
            'may': 'May',
            'june': 'June',
            'july': 'July',
            'august': 'August',
            'september': 'September',
            'october': 'October',
            'november': 'November',
            'december': 'December'
        };
        return monthNames[monthKey] || monthKey;
    };

    const getTotalForYear = () => {
        return Object.values(breakdown).reduce((sum, amount) => sum + (amount || 0), 0);
    };

    const getHighestMonth = () => {
        let highestMonth = '';
        let highestAmount = 0;
        
        Object.entries(breakdown).forEach(([month, amount]) => {
            if (amount > highestAmount) {
                highestAmount = amount;
                highestMonth = month;
            }
        });
        
        return { month: highestMonth, amount: highestAmount };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const totalForYear = getTotalForYear();
    const highestMonth = getHighestMonth();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Monthly Expense Breakdown</h2>
                <Button onClick={fetchBreakdown} variant="secondary">
                    Refresh Data
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-blue-400/20 border-blue-500/30">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-blue-300">Total Year</p>
                                <p className="text-2xl font-bold text-white">BDT {totalForYear.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-600/20 via-green-500/15 to-green-400/20 border-green-500/30">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                <span className="text-2xl">📈</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-green-300">Highest Month</p>
                                <p className="text-2xl font-bold text-white">
                                    {getMonthName(highestMonth.month)}
                                </p>
                                <p className="text-sm text-green-400">BDT {highestMonth.amount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600/20 via-purple-500/15 to-purple-400/20 border-purple-500/30">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-purple-300">Average/Month</p>
                                <p className="text-2xl font-bold text-white">
                                    BDT {(totalForYear / 12).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Monthly Breakdown Chart */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Monthly Expenses</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {Object.entries(breakdown).map(([month, amount]) => {
                            const percentage = totalForYear > 0 ? (amount / totalForYear) * 100 : 0;
                            const isCurrentMonth = new Date().getMonth() === Object.keys(breakdown).indexOf(month);
                            
                            return (
                                <div key={month} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-20 text-sm font-medium text-gray-700">
                                            {getMonthName(month)}
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    isCurrentMonth ? 'bg-blue-600' : 'bg-gray-400'
                                                }`}
                                                style={{ width: `${Math.max(percentage, 2)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            BDT {amount.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Monthly Details Table */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Monthly Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(breakdown).map(([month, amount]) => {
                                const percentage = totalForYear > 0 ? (amount / totalForYear) * 100 : 0;
                                const isCurrentMonth = new Date().getMonth() === Object.keys(breakdown).indexOf(month);
                                
                                return (
                                    <tr key={month} className={isCurrentMonth ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {getMonthName(month)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            BDT {amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {percentage.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isCurrentMonth ? (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    Current Month
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {amount > 0 ? 'Active' : 'No Expenses'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MonthlyExpenseBreakdown;
