import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [yearlyTotal, setYearlyTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addModal, setAddModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        billType: '',
        amount: '',
        comment: '',
        date: new Date().toISOString().split('T')[0]
    });
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [expensesRes, monthlyRes, yearlyRes] = await Promise.all([
                adminService.getExpenses(),
                adminService.getMonthlyExpenses(),
                adminService.getYearlyExpenses()
            ]);
            
            // Safe data access with fallbacks
            setExpenses(expensesRes.data || []);
            setMonthlyTotal(monthlyRes.data?.totalMonthlyExpenses || 0);
            setYearlyTotal(yearlyRes.data?.totalYearlyExpenses || 0);
        } catch (err) {
            console.error('Expense fetch error:', err);
            setError('Failed to fetch expense data. Please check your backend connection.');
            // Set default values on error
            setExpenses([]);
            setMonthlyTotal(0);
            setYearlyTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const response = await adminService.addExpense(newExpense);
            
            // Safe data access
            const newExpenseData = response.data || newExpense;
            setExpenses([newExpenseData, ...expenses]);
            setAddModal(false);
            setNewExpense({
                billType: '',
                amount: '',
                comment: '',
                date: new Date().toISOString().split('T')[0]
            });
            showSuccess('Expense added successfully');
            fetchData(); // Refresh totals
        } catch (err) {
            console.error('Add expense error:', err);
            setError('Failed to add expense. Please try again.');
            showError('Failed to add expense. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        setNewExpense({
            ...newExpense,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                        <span className="mr-3">💰</span>
                        Expense Management
                    </h2>
                    <p className="text-gray-600 mt-1">Track and manage your office expenses</p>
                </div>
                <Button 
                    onClick={() => setAddModal(true)}
                    className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-green-500 to-green-600"
                >
                    ➕ Add Expense
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Total Expenses Count Card */}
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                    <span className="text-2xl text-white">💰</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900 animate-pulse">
                                        {expenses.length}
                                    </p>
                                    <p className="text-xs text-blue-600 font-medium">
                                        Expense Records
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Current Month Total Card */}
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                    <span className="text-2xl text-white">📅</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                        ${(monthlyTotal || 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-green-600 font-medium">
                                        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Yearly Total Card */}
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 sm:col-span-2 lg:col-span-1">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                                    <span className="text-2xl text-white">📊</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">This Year</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                        ${(yearlyTotal || 0).toFixed(2)}
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
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Expenses Table */}
            <Card className="transform transition-all duration-300 hover:shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <span className="mr-2">📋</span>
                        Recent Expenses
                    </h3>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comment
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenses && expenses.length > 0 ? (
                                expenses.map((expense, index) => (
                                    <tr 
                                        key={expense.id || Math.random()} 
                                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-gray-50"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {expense.billType ? expense.billType.charAt(0).toUpperCase() : 'E'}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {expense.billType || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-green-600">
                                                ${(expense.amount || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {expense.comment || 'No comment'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No expenses found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Expense Modal */}
            <Modal
                isOpen={addModal}
                onClose={() => setAddModal(false)}
                title="Add New Expense"
            >
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                    <form onSubmit={handleAddExpense} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <Input
                                    label="Bill Type"
                                    name="billType"
                                    value={newExpense.billType}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Office Supplies, Utilities"
                                />
                            </div>
                            
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <Input
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    value={newExpense.amount}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        
                        <div className="transform transition-all duration-300 hover:scale-105">
                            <Input
                                label="Date"
                                name="date"
                                type="date"
                                value={newExpense.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="transform transition-all duration-300 hover:scale-105">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment
                            </label>
                            <textarea
                                name="comment"
                                value={newExpense.comment}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Add any additional details about this expense..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setAddModal(false)}
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-r from-green-500 to-green-600"
                            >
                                💰 Add Expense
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default ExpenseManagement;
