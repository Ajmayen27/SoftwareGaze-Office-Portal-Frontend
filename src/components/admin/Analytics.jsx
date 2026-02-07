import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
    Receipt,
    Calendar,
    TrendingUp,
    MessageSquare,
    Image,
    Tag,
    DollarSign,
    RefreshCw
} from 'lucide-react';

const Analytics = () => {
    // Fetch multiple data sources
    const { data: monthlyRes, isLoading: isMonthlyLoading } = useQuery({
        queryKey: ['expenses', 'monthly-total'],
        queryFn: adminService.getMonthlyExpenses
    });

    const { data: yearlyRes, isLoading: isYearlyLoading } = useQuery({
        queryKey: ['expenses', 'yearly-total'],
        queryFn: adminService.getYearlyExpenses
    });

    const { data: expensesRes, isLoading: isExpensesLoading, error: fetchError } = useQuery({
        queryKey: ['expenses'],
        queryFn: adminService.getExpenses
    });

    const expenses = expensesRes?.data || [];
    const monthlyTotal = monthlyRes?.data?.totalMonthlyExpenses || 0;
    const yearlyTotal = yearlyRes?.data?.totalYearlyExpenses || 0;

    const { expensesByType, monthlyTrend } = useMemo(() => {
        const typeMap = {};
        const trendMap = {};

        expenses.forEach(expense => {
            const amount = parseFloat(expense.amount) || 0;
            // By Type
            typeMap[expense.billType] = (typeMap[expense.billType] || 0) + amount;
            // Trend
            const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            trendMap[month] = (trendMap[month] || 0) + amount;
        });

        return {
            expensesByType: Object.entries(typeMap).map(([type, amount]) => ({ type, amount })),
            monthlyTrend: Object.entries(trendMap).map(([month, amount]) => ({ month, amount }))
        };
    }, [expenses]);

    const isLoading = isMonthlyLoading || isYearlyLoading || isExpensesLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Failed to fetch analytics data. Please try again later.</p>
                </div>
            )}

            {/* Summary Cards */}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-blue-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <Calendar className="text-blue-400" size={28} />
                                </div>
                                <div className="ml-5 min-w-0">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly Expenses</p>
                                    <p className="text-3xl font-bold text-white truncate font-mono tracking-tight">
                                        BDT {monthlyTotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-green-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <TrendingUp className="text-green-400" size={28} />
                                </div>
                                <div className="ml-5 min-w-0">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Yearly Expenses</p>
                                    <p className="text-3xl font-bold text-white truncate font-mono tracking-tight">
                                        BDT {yearlyTotal.toFixed(2)}
                                    </p>
                                </div>
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
                                <span className="text-sm font-bold text-gray-900">BDT {amount.toFixed(2)}</span>
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
                                                width: `${(amount / Math.max(...monthlyTrend.map(m => m.amount), 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">BDT {amount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Recent Expenses */}
            <Card className="border-0 bg-[#0f172a]/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Receipt className="mr-3 text-emerald-400" size={24} />
                        Recent Expenses
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full !divide-white/5">
                        <thead className="!bg-white/5">
                            <tr className="!border-b !border-white/5">
                                <th className="!text-indigo-200 !font-semibold !text-base !py-5 !pl-6 text-left !uppercase !tracking-wider">Bill Type</th>
                                <th className="!text-indigo-200 !font-semibold !text-base !py-5 text-left !uppercase !tracking-wider">Amount</th>
                                <th className="!text-indigo-200 !font-semibold !text-base !py-5 text-left !uppercase !tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="!bg-transparent !divide-white/5">
                            {expenses.slice(0, 5).map((expense) => (
                                <tr key={expense.id} className="!bg-transparent hover:!bg-white/5 transition-colors duration-200 !border-b !border-white/5 last:!border-0 group">
                                    <td className="!py-4 !pl-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mr-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-500/20">
                                                {expense.billType === 'Utility' && <RefreshCw size={18} />}
                                                {expense.billType === 'Bills' && <Receipt size={18} />}
                                                {expense.billType === 'Salary' && <DollarSign size={18} />}
                                                {(!['Utility', 'Bills', 'Salary'].includes(expense.billType)) && <Tag size={18} />}
                                            </div>
                                            <div className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                {expense.billType}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="!py-4">
                                        <div className="text-lg font-bold font-mono text-white tracking-tight">
                                            BDT {expense.amount}
                                        </div>
                                    </td>
                                    <td className="!py-4">
                                        <div className="flex items-center text-base text-slate-300">
                                            <Calendar size={16} className="mr-2 text-slate-500" />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
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
