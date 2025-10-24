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
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Expense Management</h2>
                <Button onClick={() => setAddModal(true)}>
                    Add Expense
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">📅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                                <p className="text-2xl font-bold text-gray-900">${(monthlyTotal || 0).toFixed(2)}</p>
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
                                <p className="text-sm font-medium text-gray-600">Yearly Total</p>
                                <p className="text-2xl font-bold text-gray-900">${(yearlyTotal || 0).toFixed(2)}</p>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comment
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenses && expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <tr key={expense.id || Math.random()} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {expense.billType || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${expense.amount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {expense.comment || 'No comment'}
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
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <Input
                        label="Bill Type"
                        name="billType"
                        value={newExpense.billType}
                        onChange={handleInputChange}
                        required
                    />
                    
                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        required
                    />
                    
                    <Input
                        label="Date"
                        name="date"
                        type="date"
                        value={newExpense.date}
                        onChange={handleInputChange}
                        required
                    />
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment
                        </label>
                        <textarea
                            name="comment"
                            value={newExpense.comment}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add Expense
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExpenseManagement;
