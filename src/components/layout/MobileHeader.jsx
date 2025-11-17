import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const MobileHeader = ({ activeTab, setActiveTab }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'employees', label: 'Employees', icon: '👥' },
        { id: 'expenses', label: 'Expenses', icon: '💰' },
        { id: 'attendance', label: 'Attendance Management', icon: '⏰' },
        { id: 'monthly-breakdown', label: 'Monthly Breakdown', icon: '📅' },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'contacts', label: 'Contacts', icon: '👥' },
        { id: 'profile', label: 'Profile', icon: '👤' },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="lg:hidden">
            <div className="bg-[rgba(5,10,25,0.85)] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.65)] border-b border-[rgba(148,163,184,0.2)] px-5 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.5em] text-[var(--color-text-muted)]">Software Gaze</p>
                        <h1 className="text-xl font-bold text-white">Portal</h1>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2.5 rounded-2xl text-white bg-[rgba(255,255,255,0.08)] border border-[rgba(148,163,184,0.2)] hover:border-white/40 transition-all duration-300"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="bg-[rgba(5,10,25,0.92)] backdrop-blur-2xl border-b border-[rgba(148,163,184,0.2)] shadow-[0_30px_60px_rgba(0,0,0,0.7)]">
                    <div className="px-5 py-4">
                        <div className="flex items-center mb-5 p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.2)]">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-base font-semibold text-white">{user?.username}</p>
                                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-[0.4em]">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                        
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-3 text-left rounded-2xl transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-[#7c3aed] via-[#5b21b6] to-[#0ea5e9] text-white shadow-[0_20px_45px_rgba(15,23,42,0.65)]'
                                            : 'text-[var(--color-text-secondary)] bg-[rgba(255,255,255,0.02)] border border-transparent hover:border-[rgba(124,58,237,0.35)]'
                                    }`}
                                >
                                    <span className="text-xl mr-3">{tab.icon}</span>
                                    <span className="font-semibold text-base">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                        
                        <div className="mt-6 pt-4 border-t border-[rgba(148,163,184,0.15)]">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#be123c] text-white rounded-2xl font-semibold shadow-[0_20px_45px_rgba(190,18,60,0.45)]"
                            >
                                <span className="mr-3">🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileHeader;
