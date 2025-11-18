import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
        { id: 'employees', label: 'Employees', color: 'from-green-500 to-green-600' },
        { id: 'expenses', label: 'Expenses', color: 'from-purple-500 to-purple-600' },
        { id: 'attendance', label: 'Attendance Management', color: 'from-teal-500 to-teal-600' },
        { id: 'monthly-breakdown', label: 'Monthly Breakdown', color: 'from-orange-500 to-orange-600' },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
        { id: 'contacts', label: 'Contacts', color: 'from-green-500 to-green-600' },
        { id: 'profile', label: 'Profile', color: 'from-purple-500 to-purple-600' },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="hidden lg:flex flex-col w-72 bg-[rgba(3,7,18,0.85)] border-r border-[rgba(148,163,184,0.2)] shadow-[0_25px_60px_rgba(2,6,23,0.8)] rounded-r-3xl overflow-hidden ml-4 mt-4 mb-4 backdrop-blur-2xl">
            <div className="p-7 border-b border-[rgba(148,163,184,0.15)] bg-[rgba(10,15,35,0.8)]">
                <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#1e1b4b] border border-[rgba(124,58,237,0.4)] shadow-[0_20px_45px_rgba(15,23,42,0.8)]">
                    <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] mb-2">Software Gaze</p>
                    <h1 className="text-2xl font-bold text-white">Office Portal</h1>
                    
                </div>
            </div>
            
            <div className="flex-1 px-5 py-6 space-y-3 overflow-y-auto">
                <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-text-muted)] mb-2">Navigation</p>
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-5 py-4 text-left rounded-2xl transition-all duration-300 group ${
                                activeTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_20px_45px_rgba(15,23,42,0.65)] border border-white/10`
                                    : 'text-[var(--color-text-secondary)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] border border-transparent hover:border-[rgba(124,58,237,0.25)]'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                                activeTab === tab.id
                                    ? 'bg-white/25 text-[#0f172a]'
                                    : `bg-gradient-to-br ${tab.color} opacity-70 group-hover:opacity-100`
                            }`}>
                                <span className="text-lg font-bold">{tab.label.charAt(0)}</span>
                            </div>
                            <span className="text-base font-semibold tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-6 border-t border-[rgba(148,163,184,0.15)] bg-[rgba(10,15,35,0.8)]">
                <div className="flex items-center mb-5 p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.2)] shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center text-white text-lg font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                        <p className="text-base font-semibold text-white">{user?.username}</p>
                        <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] mt-1">
                            {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-5 py-3.5 bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#be123c] text-white rounded-2xl font-semibold shadow-[0_20px_45px_rgba(190,18,60,0.45)] hover:translate-y-[-1px] transition-all duration-300"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
