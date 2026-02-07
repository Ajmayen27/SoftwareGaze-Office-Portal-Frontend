import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
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
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Export Report State
    const [exportModal, setExportModal] = useState(false);
    const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [exportYear, setExportYear] = useState(new Date().getFullYear());
    const [exportTag, setExportTag] = useState('all');

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
            // Normalize payload
            const payload = {
                ...editingExpense,
                tag: (editingExpense.tag || 'paid').toLowerCase(),
                amount: parseFloat(editingExpense.amount)
            };

            // Always use FormData (multipart/form-data) for consistency, 
            // as the backend likely expects @RequestPart for 'expense'.
            const formData = new FormData();

            // Send expense as Blob with application/json type
            const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            formData.append('expense', jsonBlob);

            if (selectedFile) {
                formData.append('file', selectedFile);
            } else {
                // Backend might require the 'file' part to function, 
                // so we send an empty blob to satisfy strict @RequestPart validation.
                formData.append('file', new Blob([], { type: 'application/octet-stream' }));
            }

            const response = await adminService.updateExpense(editingExpense.id, formData);

            // Update the expense in the list
            const updatedExpenses = expenses.map(exp =>
                exp.id === editingExpense.id ? response.data : exp
            );
            setExpenses(updatedExpenses);
            setEditModal(false);
            setEditingExpense(null);
            setSelectedFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            showSuccess('Expense updated successfully');
        } catch (err) {
            console.error('Update expense error:', err);
            const serverMsg = err?.response?.data?.message || err?.message || 'Failed to update expense';
            setError(serverMsg);
            showError(serverMsg);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file || null);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
        }
    };

    const handleExport = async (e) => {
        e.preventDefault();
        try {
            // Format month to 2 digits (e.g., '01', '12')
            const formattedMonth = exportMonth.toString().padStart(2, '0');
            const formattedYear = exportYear.toString();

            showSuccess('Generating report...');

            const response = await adminService.exportMonthlyReport(formattedMonth, formattedYear, exportTag);

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a link element and click it to trigger download
            const link = document.createElement('a');
            link.href = url;
            const tagName = exportTag && exportTag !== 'all' ? `-${exportTag}` : '';
            link.download = `Expense_Report_${formattedYear}_${formattedMonth}${tagName}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            setExportModal(false);
            showSuccess('Report downloaded successfully');
        } catch (err) {
            console.error('Export error:', err);
            const serverMsg = err?.response?.data?.message || 'Failed to generate report. Please try again.';
            showError(serverMsg);
        }
    };

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
            }
        };
    }, [previewUrl]);

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
            date: formattedDate,
            tag: expense.tag || 'paid'
        });
        setSelectedFile(null);
        setPreviewUrl(null);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">Monthly Expense Breakdown</h2>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Button onClick={fetchExpenses} variant="secondary" className="flex-1 md:flex-none text-sm md:text-base">
                        Refresh Data
                    </Button>
                    <Button
                        onClick={() => setExportModal(true)}
                        className="flex-1 md:flex-none bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 text-sm md:text-base"
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-blue-400/20 border-blue-500/30">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div>
                                    <p className="text-sm font-medium text-blue-300">Total Year</p>
                                    <p className="text-xl lg:text-2xl font-bold text-white animate-pulse">
                                        BDT {totalForYear.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-blue-400 font-medium">
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

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-600/20 via-green-500/15 to-green-400/20 border-green-500/30">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div>
                                    <p className="text-sm font-medium text-green-300">Highest Month</p>
                                    <p className="text-lg lg:text-xl font-bold text-white">
                                        {getMonthName(highestMonth.month)}
                                    </p>
                                    <p className="text-sm text-green-400 font-medium">
                                        BDT {highestMonth.amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-purple-600/20 via-purple-500/15 to-purple-400/20 border-purple-500/30 sm:col-span-2 lg:col-span-1">
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div>
                                    <p className="text-sm font-medium text-purple-300">Average/Month</p>
                                    <p className="text-xl lg:text-2xl font-bold text-white">
                                        BDT {(totalForYear / 12).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-purple-400 font-medium">
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
                <div className="px-6 py-4 border-b border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                    <h3 className="text-lg font-medium text-white flex items-center">
                        <span className="mr-2">📅</span>
                        Monthly Expense Details
                    </h3>
                </div>
                <div className="p-6">
                    {/* Month and Year Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Select Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={month} value={index} className="bg-gray-800 text-white">
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Select Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {[2023, 2024, 2025, 2026].map(year => (
                                    <option key={year} value={year} className="bg-gray-800 text-white">
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Total for Selected Month
                            </label>
                            <div className="px-4 py-2 bg-gradient-to-br from-green-600/20 via-green-500/15 to-green-400/20 border border-green-500/30 rounded-lg">
                                <p className="text-lg font-bold text-green-400">
                                    BDT {selectedMonthTotal.toFixed(2)}
                                </p>
                                <p className="text-xs text-green-300">
                                    {selectedMonthExpenses.length} expenses
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expenses List */}
                    <div className="space-y-2">
                        {/* Header Row (Desktop only) */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-800/50 rounded-lg text-sm font-semibold text-gray-400 uppercase tracking-wider border border-gray-700/50">
                            <div className="col-span-4">Expense Details</div>
                            <div className="col-span-2 text-center">Tag</div>
                            <div className="col-span-2 text-center">Date</div>
                            <div className="col-span-2 text-right">Amount</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {selectedMonthExpenses.length > 0 ? (
                            selectedMonthExpenses.map((expense, index) => (
                                <div
                                    key={expense.id || Math.random()}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-lg hover:bg-gray-800/30 transition-all duration-300 border border-gray-700/50"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Info Section */}
                                    <div className="col-span-1 md:col-span-4 flex items-center space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                            {expense.billType ? expense.billType.charAt(0).toUpperCase() : 'E'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-white truncate">{expense.billType || 'N/A'}</p>
                                            <p className="text-sm text-gray-400 truncate max-w-[200px]">
                                                {expense.comment || 'No comment'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tag Section */}
                                    <div className="col-span-1 md:col-span-2 flex md:justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${(expense.tag || '').toLowerCase() === 'paid'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            }`}>
                                            {(expense.tag || 'Unpaid').toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Date Section */}
                                    <div className="col-span-1 md:col-span-2 flex md:justify-center text-gray-300 text-sm">
                                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                    </div>

                                    {/* Amount Section */}
                                    <div className="col-span-1 md:col-span-2 flex md:justify-end">
                                        <span className="text-base font-bold text-green-400">
                                            BDT {(expense.amount || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Actions Section */}
                                    <div className="col-span-1 md:col-span-2 flex justify-end space-x-2">
                                        <button
                                            onClick={() => openEditModal(expense)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(expense.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/30 border-dashed">
                                <div className="text-4xl mb-3">📝</div>
                                <p className="text-gray-400 font-medium">No expenses found for {monthNames[selectedMonth]}</p>
                                <p className="text-sm text-gray-500 mt-1">Try selecting a different month or year</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Monthly Details Table */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                    <h3 className="text-lg font-medium text-white">Monthly Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700/50">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
                            {Object.entries(breakdown).map(([month, amount]) => {
                                const percentage = totalForYear > 0 ? (amount / totalForYear) * 100 : 0;
                                const isCurrentMonth = new Date().getMonth() === Object.keys(breakdown).indexOf(month);

                                return (
                                    <tr key={month} className={isCurrentMonth ? 'bg-blue-600/20' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {getMonthName(month)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                            BDT {amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {percentage.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isCurrentMonth ? (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/30 text-blue-300 border border-blue-500/50">
                                                    Current Month
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700/50 text-gray-300 border border-gray-600/50">
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
                    <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-blue-500/30 max-h-[85vh] overflow-y-auto custom-scrollbar">
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
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">
                                    Comment
                                </label>
                                <textarea
                                    name="comment"
                                    value={editingExpense.comment || ''}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Add any additional details about this expense..."
                                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Tag</label>
                                <select
                                    name="tag"
                                    value={editingExpense.tag || 'paid'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-300"
                                >
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Screenshot (Update Optional)</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-300" />

                                {previewUrl && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-400 mb-1">New Preview:</p>
                                        <img src={previewUrl} alt="New preview" className="w-48 h-32 object-cover rounded shadow-md" />
                                    </div>
                                )}

                                {!previewUrl && editingExpense.screenshot && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-400 mb-1">Current Screenshot:</p>
                                        {(() => {
                                            const src = editingExpense.screenshot.startsWith('data:') ? editingExpense.screenshot : `data:image/png;base64,${editingExpense.screenshot}`;
                                            return <img src={src} alt="Current screenshot" className="w-48 h-32 object-cover rounded shadow-md opacity-70" />;
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setEditModal(false);
                                        setEditingExpense(null);
                                        setSelectedFile(null);
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl);
                                            setPreviewUrl(null);
                                        }
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
                    </div>
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
                <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-red-500/30 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <p className="text-white">
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
                </div>
            </Modal>

            {/* Export Report Modal */}
            <Modal
                isOpen={exportModal}
                onClose={() => setExportModal(false)}
                title="Export Monthly Report"
                size="sm"
            >
                <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-purple-500/30 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleExport} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Year</label>
                            <select
                                value={exportYear}
                                onChange={(e) => setExportYear(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-300"
                            >
                                {[2023, 2024, 2025, 2026, 2027].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Month</label>
                            <select
                                value={exportMonth}
                                onChange={(e) => setExportMonth(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-300"
                            >
                                {monthNames.map((name, index) => (
                                    <option key={index} value={index + 1}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Tag (Optional)</label>
                            <select
                                value={exportTag}
                                onChange={(e) => setExportTag(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-300"
                            >
                                <option value="all">All Tags</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setExportModal(false)}
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-r from-purple-500 to-indigo-600"
                            >
                                Download PDF
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default SimpleMonthlyBreakdown;
