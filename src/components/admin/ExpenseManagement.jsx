import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import {
    Receipt,
    DollarSign,
    Calendar,
    FileText,
    Tag,
    Image,
    MessageSquare,
    Plus,
    RefreshCw,
    Search,
    Wallet,
    TrendingUp,
    CreditCard
} from 'lucide-react';

const ExpenseManagement = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const [addModal, setAddModal] = useState(false);
    const [sortBy, setSortBy] = useState('date-desc');
    const [newExpense, setNewExpense] = useState({
        billType: '',
        amount: '',
        comment: '',
        date: new Date().toISOString().split('T')[0],
        tag: 'paid'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Fetch expenses
    const { data: expensesRes, isLoading, error: fetchError } = useQuery({
        queryKey: ['expenses'],
        queryFn: adminService.getExpenses
    });

    const expenses = expensesRes?.data || [];

    // Calculate totals using useMemo
    const { monthlyTotal, yearlyTotal } = useMemo(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        let mTotal = 0;
        let yTotal = 0;

        expenses.forEach(expense => {
            if (!expense.date) return;
            const expenseDate = new Date(expense.date);
            const amount = parseFloat(expense.amount) || 0;

            if (expenseDate.getFullYear() === currentYear) {
                yTotal += amount;
                if (expenseDate.getMonth() === currentMonth) {
                    mTotal += amount;
                }
            }
        });

        return { monthlyTotal: mTotal, yearlyTotal: yTotal };
    }, [expenses]);

    // Add expense mutation
    const addMutation = useMutation({
        mutationFn: (payload) => adminService.addExpense(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            showSuccess('Expense added successfully');
            setAddModal(false);
            resetForm();
        },
        onError: (err) => {
            const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Unknown error';
            showError(`Failed to add expense: ${serverMsg}`);
        }
    });

    const resetForm = () => {
        setNewExpense({
            billType: '',
            amount: '',
            comment: '',
            date: new Date().toISOString().split('T')[0],
            tag: 'paid'
        });
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const payload = {
            ...newExpense,
            tag: (newExpense.tag || '').toLowerCase(),
            amount: parseFloat(newExpense.amount)
        };

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            formData.append('expense', jsonBlob);
            addMutation.mutate(formData);
        } else {
            addMutation.mutate(payload);
        }
    };

    const handleInputChange = (e) => {
        setNewExpense({
            ...newExpense,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file || null);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const sortedExpenses = useMemo(() => {
        const sorted = [...expenses];
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'amount-desc':
                return sorted.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0));
            case 'amount-asc':
                return sorted.sort((a, b) => (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0));
            case 'billType':
                return sorted.sort((a, b) => (a.billType || '').localeCompare(b.billType || ''));
            default:
                return sorted;
        }
    }, [expenses, sortBy]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-indigo-500/10">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <Wallet className="mr-3 text-indigo-400" size={32} />
                        Expense Management
                    </h2>
                    <p className="text-slate-400 text-lg">Track and manage your office expenses and bills.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-[#0f172a]/40 text-indigo-300 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center font-medium"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </button>
                    <Button
                        onClick={() => setAddModal(true)}
                        className="flex-1 md:flex-none bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 border-0 rounded-xl px-6 py-2.5 font-medium transform transition-all duration-200 hover:scale-105 flex items-center justify-center"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-blue-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <Receipt className="text-blue-400" size={28} />
                                </div>
                                <div className="ml-5 min-w-0">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Records</p>
                                    <p className="text-3xl font-bold text-white truncate font-mono tracking-tight">
                                        {expenses.length}
                                    </p>
                                    <p className="text-xs text-blue-400/80 font-medium truncate mt-1">Lifetime Expenses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-emerald-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <Calendar className="text-emerald-400" size={28} />
                                </div>
                                <div className="ml-5 min-w-0">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">This Month</p>
                                    <p className="text-3xl font-bold text-white truncate font-mono tracking-tight">
                                        BDT {monthlyTotal.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-emerald-400/80 font-medium truncate mt-1">
                                        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-violet-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group sm:col-span-2 lg:col-span-1">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl border border-violet-500/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <TrendingUp className="text-violet-400" size={28} />
                                </div>
                                <div className="ml-5 min-w-0">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">This Year</p>
                                    <p className="text-3xl font-bold text-white truncate font-mono tracking-tight">
                                        BDT {yearlyTotal.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-violet-400/80 font-medium truncate mt-1">{new Date().getFullYear()} Total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Failed to fetch expense data. Please try again later.</p>
                </div>
            )}

            <Card className="border-0 bg-[#0f172a]/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Receipt className="mr-3 text-emerald-400" size={24} />
                        Recent Expenses
                    </h3>
                    <div className="flex items-center space-x-3 w-full md:w-auto bg-[#0f172a]/40 p-1.5 rounded-lg border border-white/5">
                        <Search size={16} className="text-slate-500 ml-2" />
                        <span className="text-sm font-medium text-slate-400 whitespace-nowrap">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-slate-300 text-sm font-medium focus:outline-none border-none cursor-pointer hover:text-white"
                        >
                            <option value="date-desc" className="bg-[#1e293b]">📅 Newest First</option>
                            <option value="date-asc" className="bg-[#1e293b]">📅 Oldest First</option>
                            <option value="amount-desc" className="bg-[#1e293b]">💰 Highest Amount</option>
                            <option value="amount-asc" className="bg-[#1e293b]">💰 Lowest Amount</option>
                            <option value="billType" className="bg-[#1e293b]">🔤 Bill Type A-Z</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full !divide-white/5">
                        <thead className="!bg-white/5">
                            <tr className="!border-b !border-white/5">
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 !pl-6 text-left !uppercase !tracking-wider">ID</th>
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 text-left !uppercase !tracking-wider">Bill Type</th>
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 text-left !uppercase !tracking-wider">Amount</th>
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 text-left !uppercase !tracking-wider">Tag</th>
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 text-left !uppercase !tracking-wider">Date</th>
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 text-left !uppercase !tracking-wider">Screenshot</th>
                                <th className="!text-indigo-200 !font-semibold !text-lg !py-5 text-left !uppercase !tracking-wider">Comment</th>
                            </tr>
                        </thead>
                        <tbody className="!bg-transparent !divide-white/5">
                            {sortedExpenses.length > 0 ? (
                                sortedExpenses.map((expense, index) => (
                                    <tr
                                        key={expense.id || index}
                                        className="!bg-transparent hover:!bg-white/5 transition-colors duration-200 !border-b !border-white/5 last:!border-0 group"
                                    >
                                        <td className="!py-4 !pl-6">
                                            <div className="text-gray-400 font-mono text-sm">#{expense.id ?? '—'}</div>
                                        </td>
                                        <td className="!py-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mr-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-500/20">
                                                    {expense.billType === 'Utility' && <RefreshCw size={20} />}
                                                    {expense.billType === 'Bills' && <Receipt size={20} />}
                                                    {expense.billType === 'Salary' && <DollarSign size={20} />}
                                                    {(!['Utility', 'Bills', 'Salary'].includes(expense.billType)) && <Tag size={20} />}
                                                </div>
                                                <div className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                    {expense.billType || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="!py-4">
                                            <div className="text-xl font-bold font-mono text-white tracking-tight">
                                                BDT {(parseFloat(expense.amount) || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="!py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${(expense.tag || '').toLowerCase() === 'paid'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {expense.tag || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="!py-4">
                                            <div className="flex items-center text-lg text-slate-300">
                                                <Calendar size={18} className="mr-2 text-slate-500" />
                                                {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="!py-4">
                                            {expense.screenshot ? (
                                                <div className="relative group/img w-24 h-16 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => window.open(expense.screenshot.startsWith('data:') ? expense.screenshot : `data:image/png;base64,${expense.screenshot}`, '_blank')}>
                                                    <img
                                                        src={expense.screenshot.startsWith('data:') ? expense.screenshot : `data:image/png;base64,${expense.screenshot}`}
                                                        alt="Receipt"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Image size={24} className="text-white drop-shadow-lg" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-slate-500 text-sm italic">
                                                    <Image size={16} className="mr-2 opacity-50" />
                                                    No image
                                                </div>
                                            )}
                                        </td>
                                        <td className="!py-4 !pr-6">
                                            <div className="flex items-center text-slate-400 text-base max-w-xs truncate">
                                                <MessageSquare size={16} className="mr-2 text-slate-600 flex-shrink-0" />
                                                {expense.comment || 'No comment'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                <Receipt size={32} className="text-slate-600" />
                                            </div>
                                            <p className="text-xl font-medium text-white mb-1">No expenses found</p>
                                            <p className="text-base text-slate-500">Add a new expense to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={addModal}
                onClose={() => setAddModal(false)}
                title="Add New Expense"
            >
                <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-green-500/30 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleAddExpense} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Bill Type</label>
                                <div className="relative group">
                                    <select
                                        name="billType"
                                        value={newExpense.billType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white placeholder-gray-400 transition-all duration-300 hover:shadow-lg hover:border-gray-500 appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-gray-900 text-gray-400">Select Bill Type</option>
                                        <option value="Bills" className="bg-gray-900 text-white">Bills</option>
                                        <option value="Utility" className="bg-gray-900 text-white">Utility</option>
                                        <option value="Salary" className="bg-gray-900 text-white">Salary</option>
                                        <option value="Office Goods" className="bg-gray-900 text-white">Office Goods</option>
                                        <option value="Entertainment and Sports" className="bg-gray-900 text-white">Entertainment and Sports</option>
                                        <option value="Others" className="bg-gray-900 text-white">Others</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-green-400 transition-colors duration-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Comment</label>
                                <textarea
                                    name="comment"
                                    value={newExpense.comment}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Add any additional details..."
                                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-300 hover:shadow-md"
                                />
                            </div>
                            <div className="transform transition-all duration-300 hover:scale-105">
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Tag</label>
                                <div className="relative group">
                                    <select
                                        name="tag"
                                        value={newExpense.tag}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white placeholder-gray-400 transition-all duration-300 hover:shadow-lg hover:border-gray-500 appearance-none cursor-pointer"
                                    >
                                        <option value="paid" className="bg-gray-900 text-white">Paid</option>
                                        <option value="unpaid" className="bg-gray-900 text-white">Unpaid</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-green-400 transition-colors duration-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">Screenshot (optional)</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-300" />
                            {previewUrl && (
                                <div className="mt-3">
                                    <img src={previewUrl} alt="preview" className="w-48 h-32 object-cover rounded shadow-md cursor-pointer" onClick={() => window.open(previewUrl, '_blank')} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    resetForm();
                                    setAddModal(false);
                                }}
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={addMutation.isLoading}
                                disabled={addMutation.isLoading}
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
