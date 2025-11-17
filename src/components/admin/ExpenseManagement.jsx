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
    const [sortBy, setSortBy] = useState('date-desc'); // Default: newest first
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
            
            const expensesRes = await adminService.getExpenses();
            const expenses = expensesRes.data || [];
            
            // Calculate monthly and yearly totals from expenses data (same as dashboard)
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
            
            // Sort expenses by date (newest first)
            const sortedExpenses = expenses.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Newest first
            });
            
            setExpenses(sortedExpenses);
            setMonthlyTotal(monthlyTotal);
            setYearlyTotal(yearlyTotal);
            
            console.log('Expenses Data:', {
                totalExpenses: expenses.length,
                monthlyTotal,
                yearlyTotal,
                currentMonth: currentMonth + 1,
                currentYear
            });
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
            const updatedExpenses = [newExpenseData, ...expenses];
            
            // Recalculate totals with new expense
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            // Calculate new monthly total
            const monthlyExpenses = updatedExpenses.filter(expense => {
                if (!expense.date) return false;
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            });
            const newMonthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
            
            // Calculate new yearly total
            const yearlyExpenses = updatedExpenses.filter(expense => {
                if (!expense.date) return false;
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() === currentYear;
            });
            const newYearlyTotal = yearlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
            
            // Update state
            setExpenses(updatedExpenses);
            setMonthlyTotal(newMonthlyTotal);
            setYearlyTotal(newYearlyTotal);
            
            setAddModal(false);
            setNewExpense({
                billType: '',
                amount: '',
                comment: '',
                date: new Date().toISOString().split('T')[0]
            });
            showSuccess('Expense added successfully');
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

    const sortExpenses = (expenses, sortBy) => {
        const sorted = [...expenses];
        
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest first
            case 'amount-desc':
                return sorted.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)); // Highest first
            case 'amount-asc':
                return sorted.sort((a, b) => (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0)); // Lowest first
            case 'billType':
                return sorted.sort((a, b) => (a.billType || '').localeCompare(b.billType || '')); // Alphabetical
            default:
                return sorted;
        }
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
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
                        Expense Management
                    </h2>
                    <p className="text-gray-600 mt-1">Track and manage your office expenses</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                    >
                        Refresh
                    </button>
                    <Button 
                        onClick={() => setAddModal(true)}
                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-green-500 to-green-600"
                    >
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Total Expenses Count Card */}
                <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50/90 bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm border border-blue-200/30">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md flex items-center justify-center transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105">
                                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
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
                <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-green-50/90 bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm border border-green-200/30">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md flex items-center justify-center transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105">
                                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                        BDT {(monthlyTotal || 0).toFixed(2)}
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
                <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-purple-50/90 bg-gradient-to-br from-purple-50/80 to-purple-100/80 backdrop-blur-sm border border-purple-200/30 sm:col-span-2 lg:col-span-1">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md flex items-center justify-center transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105">
                                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">This Year</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                                        BDT {(yearlyTotal || 0).toFixed(2)}
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
            <Card className="transition-all duration-200 ease-in-out hover:shadow-xl bg-white/80 backdrop-blur-xl border border-white/30 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                            </div>
                            Recent Expenses
                        </h3>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="px-3 py-1 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white/50 backdrop-blur-sm"
                            >
                                <option value="date-desc">📅 Newest First</option>
                                <option value="date-asc">📅 Oldest First</option>
                                <option value="amount-desc">💰 Highest Amount</option>
                                <option value="amount-asc">💰 Lowest Amount</option>
                                <option value="billType">🔤 Bill Type A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto bg-white/30 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-white/20">
                        <thead className="bg-white/20 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Bill Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Comment
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/10 backdrop-blur-sm divide-y divide-white/20">
                            {expenses && expenses.length > 0 ? (
                                sortExpenses(expenses, sortBy).map((expense, index) => (
                                    <tr 
                                        key={expense.id || Math.random()} 
                                        className="transition-all duration-200 ease-in-out hover:bg-white/30 hover:shadow-md group border-b border-white/10"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 ease-in-out">
                                                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-bold text-gray-800">
                                                        {expense.billType || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-green-600 bg-green-50/50 px-3 py-1 rounded-lg backdrop-blur-sm group-hover:bg-green-100/70 group-hover:scale-105 transition-all duration-200 ease-in-out">
                                                BDT {(expense.amount || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-800 bg-gray-50/50 px-3 py-1 rounded-lg backdrop-blur-sm group-hover:bg-gray-100/70 group-hover:scale-105 transition-all duration-200 ease-in-out">
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-800 max-w-xs truncate bg-white/30 px-3 py-1 rounded-lg backdrop-blur-sm group-hover:bg-white/50 group-hover:scale-105 transition-all duration-200 ease-in-out">
                                                {expense.comment || 'No comment'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-600 bg-white/20 backdrop-blur-sm">
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                                            </div>
                                            <span className="text-sm font-medium">No expenses found</span>
                                        </div>
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
                              Add Expense
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default ExpenseManagement;
