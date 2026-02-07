import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import Card from '../ui/Card';
import { TrendingUp, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';

const DashboardCharts = ({ expenses }) => {
    // Process data for Trends (Monthly)
    const processTrendData = () => {
        const monthlyData = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        expenses.forEach(expense => {
            if (!expense.date) return;
            const date = new Date(expense.date);
            const key = `${months[date.getMonth()]} ${date.getFullYear()}`;

            // Initialize if not exists
            if (!monthlyData[key]) {
                monthlyData[key] = {
                    name: key,
                    amount: 0,
                    sortKey: date.getTime() // For sorting
                };
            }
            monthlyData[key].amount += parseFloat(expense.amount) || 0;
        });

        // Convert to array and sort by time
        return Object.values(monthlyData)
            .sort((a, b) => a.sortKey - b.sortKey)
            // Take last 6-12 months typically, or all for now
            .map(({ name, amount }) => ({ name, amount }));
    };

    // Process data for Categories (Bill Type)
    const processCategoryData = () => {
        const categoryData = {};

        expenses.forEach(expense => {
            const type = expense.billType || 'Other';
            if (!categoryData[type]) {
                categoryData[type] = 0;
            }
            categoryData[type] += parseFloat(expense.amount) || 0;
        });

        return Object.entries(categoryData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort descending
    };

    const trendData = processTrendData();
    const categoryData = processCategoryData();

    // Professional, minimalistic colors
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];
    const GRADIENT_COLORS = {
        start: '#8884d8',
        end: '#8884d8'
    };

    // Custom Tooltip for cleaner look
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-300 font-medium mb-1">{label}</p>
                    <p className="text-white font-bold text-lg">
                        BDT {Number(payload[0].value).toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Expense Trends Chart */}
            <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-purple-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group">
                <div className="px-6 py-5 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <TrendingUp className="mr-3 text-purple-400" size={24} />
                        Expense Trends
                    </h3>
                </div>
                <div className="p-6 h-80">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GRADIENT_COLORS.start} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={GRADIENT_COLORS.end} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6B7280', strokeWidth: 1 }} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={GRADIENT_COLORS.start}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            No data available
                        </div>
                    )}
                </div>
            </Card>

            {/* Expense Distribution Chart */}
            <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-blue-500/10 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 ring-1 ring-white/10 group">
                <div className="px-6 py-5 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <PieChartIcon className="mr-3 text-blue-400" size={24} />
                        Category Distribution
                    </h3>
                </div>
                <div className="p-6 h-80">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                    iconType="circle"
                                    wrapperStyle={{ color: '#9CA3AF' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            No data available
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DashboardCharts;
