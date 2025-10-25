import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const SimpleMonthlyBreakdown = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showError } = useNotification();

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await adminService.getExpenses();
            setExpenses(response.data || []);
        } catch (err) {
            setError('Failed to fetch expenses');
            showError('Failed to fetch expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyBreakdown = () => {
        const currentYear = new Date().getFullYear();
        const monthlyData = {};
        
        // Initialize all months with 0
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        monthNames.forEach(month => {
            monthlyData[month.toLowerCase()] = 0;
        });
        
        // Calculate expenses for each month
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getFullYear() === currentYear) {
                const monthIndex = expenseDate.getMonth();
                const monthName = monthNames[monthIndex].toLowerCase();
                monthlyData[monthName] = (monthlyData[monthName] || 0) + expense.amount;
            }
        });
        
        return monthlyData;
    };

    const getTotalForYear = () => {
        const breakdown = calculateMonthlyBreakdown();
        return Object.values(breakdown).reduce((sum, amount) => sum + (amount || 0), 0);
    };

    const getHighestMonth = () => {
        const breakdown = calculateMonthlyBreakdown();
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

    const getMonthName = (monthKey) => {
        return monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const breakdown = calculateMonthlyBreakdown();
    const totalForYear = getTotalForYear();
    const highestMonth = getHighestMonth();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Monthly Expense Breakdown</h2>
                <Button onClick={fetchExpenses} variant="secondary">
                    Refresh Data
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                    <span className="text-2xl text-white">💰</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Year</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900 animate-pulse">
                                        ${totalForYear.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-blue-600 font-medium">
                                        {new Date().getFullYear()} Total
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                    <span className="text-2xl text-white">📈</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Highest Month</p>
                                    <p className="text-lg lg:text-xl font-bold text-gray-900">
                                        {getMonthName(highestMonth.month)}
                                    </p>
                                    <p className="text-sm text-green-600 font-medium">
                                        ${highestMonth.amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 sm:col-span-2 lg:col-span-1">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                                    <span className="text-2xl text-white">📊</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Average/Month</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                        ${(totalForYear / 12).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-purple-600 font-medium">
                                        Monthly Average
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Monthly Breakdown Chart */}
            <Card className="transform transition-all duration-300 hover:shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <span className="mr-2">📊</span>
                        Monthly Expenses Breakdown
                    </h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {Object.entries(breakdown).map(([month, amount], index) => {
                            const percentage = totalForYear > 0 ? (amount / totalForYear) * 100 : 0;
                            const isCurrentMonth = new Date().getMonth() === Object.keys(breakdown).indexOf(month);
                            
                            return (
                                <div 
                                    key={month} 
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">
                                            {getMonthName(month)}
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                            <div 
                                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                                    isCurrentMonth 
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                                }`}
                                                style={{ 
                                                    width: `${Math.max(percentage, 2)}%`,
                                                    animationDelay: `${index * 200}ms`
                                                }}
                                            ></div>
                                            {isCurrentMonth && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse opacity-50"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">
                                            ${amount.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {percentage.toFixed(1)}%
                                        </div>
                                        {isCurrentMonth && (
                                            <div className="text-xs text-blue-600 font-medium animate-pulse">
                                                Current
                                            </div>
                                        )}
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
                                            ${amount.toFixed(2)}
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

export default SimpleMonthlyBreakdown;
