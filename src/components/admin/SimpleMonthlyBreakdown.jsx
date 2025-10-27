import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';

const SimpleMonthlyBreakdown = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [editModal, setEditModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const { showError, showSuccess } = useNotification();

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

    const handleDeleteExpense = async () => {
        try {
            const response = await adminService.deleteExpense(expenseToDelete);
            // Filter out the deleted expense
            const updatedExpenses = expenses.filter(exp => exp.id !== expenseToDelete);
            setExpenses(updatedExpenses);
            setDeleteConfirmModal(false);
            setExpenseToDelete(null);
            showSuccess('Expense deleted successfully');
        } catch (err) {
            console.error('Delete expense error:', err);
            setError('Failed to delete expense');
            showError('Failed to delete expense');
        }
    };

    const handleUpdateExpense = async (e) => {
        e.preventDefault();
        try {
            // Parse the date and format it for the backend API
            const expenseDate = new Date(editingExpense.date);
            const dateArray = [
                expenseDate.getFullYear(),
                expenseDate.getMonth(), // Note: getMonth() returns 0-11
                expenseDate.getDate()
            ];
            
            const expenseData = {
                billType: editingExpense.billType,
                amount: parseFloat(editingExpense.amount),
                comment: editingExpense.comment,
                date: dateArray
            };
            
            const response = await adminService.updateExpense(editingExpense.id, expenseData);
            
            // Update the expense in the list
            const updatedExpenses = expenses.map(exp => 
                exp.id === editingExpense.id ? response.data : exp
            );
            setExpenses(updatedExpenses);
            setEditModal(false);
            setEditingExpense(null);
            showSuccess('Expense updated successfully');
        } catch (err) {
            console.error('Update expense error:', err);
            setError('Failed to update expense');
            showError('Failed to update expense');
        }
    };

    const openEditModal = (expense) => {
        let expenseDate;
        
        // Handle date format - could be string or array [year, month, day]
        if (Array.isArray(expense.date)) {
            // Date is in array format [year, month, day]
            expenseDate = new Date(expense.date[0], expense.date[1], expense.date[2]);
        } else {
            // Date is in string format
            expenseDate = expense.date ? new Date(expense.date) : new Date();
        }
        
        const formattedDate = expenseDate.toISOString().split('T')[0];
        setEditingExpense({
            ...expense,
            date: formattedDate
        });
        setEditModal(true);
    };

    const openDeleteConfirm = (expenseId) => {
        setExpenseToDelete(expenseId);
        setDeleteConfirmModal(true);
    };

    const handleInputChange = (e) => {
        setEditingExpense({
            ...editingExpense,
            [e.target.name]: e.target.value
        });
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

    const getSelectedMonthExpenses = () => {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === selectedMonth && 
                   expenseDate.getFullYear() === selectedYear;
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const selectedMonthExpenses = getSelectedMonthExpenses();
    const selectedMonthTotal = selectedMonthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

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

            {/* Month Selection and Expenses List */}
            <Card className="transform transition-all duration-300 hover:shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <span className="mr-2">📅</span>
                        Monthly Expense Details
                    </h3>
                </div>
                <div className="p-6">
                    {/* Month and Year Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {[2023, 2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total for Selected Month
                            </label>
                            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-lg font-bold text-green-700">
                                    ${selectedMonthTotal.toFixed(2)}
                                </p>
                                <p className="text-xs text-green-600">
                                    {selectedMonthExpenses.length} expenses
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expenses List */}
                    <div className="space-y-3">
                        {selectedMonthExpenses.length > 0 ? (
                            selectedMonthExpenses.map((expense, index) => (
                                <div 
                                    key={expense.id || Math.random()}
                                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 border border-gray-200"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                            {expense.billType ? expense.billType.charAt(0).toUpperCase() : 'E'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{expense.billType || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">
                                                {expense.comment || 'No comment'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                ${(expense.amount || 0).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(expense)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirm(expense.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No expenses found for {monthNames[selectedMonth]} {selectedYear}</p>
                            </div>
                        )}
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

            {/* Edit Expense Modal */}
            <Modal
                isOpen={editModal}
                onClose={() => {
                    setEditModal(false);
                    setEditingExpense(null);
                }}
                title="Edit Expense"
                size="md"
            >
                {editingExpense && (
                    <form onSubmit={handleUpdateExpense} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Bill Type"
                                    name="billType"
                                    value={editingExpense.billType}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Office Supplies, Utilities"
                                />
                            </div>
                            
                            <div>
                                <Input
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    value={editingExpense.amount}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Input
                                label="Date"
                                name="date"
                                type="date"
                                value={editingExpense.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment
                            </label>
                            <textarea
                                name="comment"
                                value={editingExpense.comment || ''}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Add any additional details about this expense..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setEditModal(false);
                                    setEditingExpense(null);
                                }}
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-r from-blue-500 to-blue-600"
                            >
                                Update Expense
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmModal}
                onClose={() => {
                    setDeleteConfirmModal(false);
                    setExpenseToDelete(null);
                }}
                title="Confirm Delete"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete this expense? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setDeleteConfirmModal(false);
                                setExpenseToDelete(null);
                            }}
                            className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteExpense}
                            className="transform transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-r from-red-500 to-red-600"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SimpleMonthlyBreakdown;
