import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Banknote,
    CalendarCheck,
    PieChart,
    Contact,
    User,
    LogOut,
    Menu,
    X,
    Settings
} from 'lucide-react';
import sgLogo from '../../assets/sgLogo.jpg';

const MobileHeader = ({ activeTab, setActiveTab }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
        { id: 'expenses', label: 'Expenses', icon: <Banknote size={20} /> },
        { id: 'attendance', label: 'Attendance Management', icon: <CalendarCheck size={20} /> },
        { id: 'monthly-breakdown', label: 'Monthly Breakdown', icon: <PieChart size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'contacts', label: 'Contacts', icon: <Contact size={20} /> },
        { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="lg:hidden">
            {/* Top Bar */}
            <div className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-indigo-500/10 px-6 py-4 fixed top-0 w-full z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-indigo-500/20 shadow-lg shadow-indigo-500/20 flex items-center justify-center bg-white/5">
                            <img src={sgLogo} alt="SG Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Portal</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2.5 rounded-xl text-indigo-100 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all duration-200"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-[72px]" />

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#0f172a]/95 backdrop-blur-3xl pt-[80px] px-6 pb-8 overflow-y-auto animate-in fade-in slide-in-from-top-10 duration-200">

                    {/* User Profile Card */}
                    <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/20 flex items-center space-x-4 shadow-xl shadow-indigo-900/10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg tracking-tight">{user?.username}</p>
                            <div className="flex items-center mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                                <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-3">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 group ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/20'
                                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <div className={`mr-4 p-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                                        }`}>
                                        {React.cloneElement(tab.icon, { size: 20 })}
                                    </div>
                                    <span className="font-semibold text-[15px]">{tab.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-600 hover:to-rose-600 text-red-400 hover:text-white rounded-xl border border-red-500/20 hover:border-red-500/50 transition-all duration-300 group"
                        >
                            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-semibold">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileHeader;
