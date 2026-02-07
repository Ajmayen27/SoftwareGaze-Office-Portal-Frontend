import React from 'react';
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
    Settings,
    ChevronRight,
    Building2
} from 'lucide-react';
import sgLogo from '../../assets/sgLogo.jpg';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, color: 'from-blue-500 to-blue-600' },
        { id: 'employees', label: 'Employees', icon: <Users size={22} />, color: 'from-green-500 to-green-600' },
        { id: 'expenses', label: 'Expenses', icon: <Banknote size={22} />, color: 'from-purple-500 to-purple-600' },
        { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={22} />, color: 'from-teal-500 to-teal-600' },
        { id: 'monthly-breakdown', label: 'Monthly Breakdown', icon: <PieChart size={22} />, color: 'from-orange-500 to-orange-600' },
        { id: 'settings', label: 'Settings', icon: <Settings size={22} />, color: 'from-gray-500 to-gray-600' },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, color: 'from-blue-500 to-blue-600' },
        { id: 'contacts', label: 'Contacts', icon: <Contact size={22} />, color: 'from-green-500 to-green-600' },
        { id: 'profile', label: 'Profile', icon: <User size={22} />, color: 'from-purple-500 to-purple-600' },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="hidden lg:flex flex-col lg:w-72 xl:w-80 flex-shrink-0 bg-[#0f172a]/95 border-r border-indigo-500/10 shadow-2xl ml-0 relative z-10 backdrop-blur-xl h-screen">
            {/* Logo Area */}
            <div className="p-6 border-b border-indigo-500/10">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-indigo-500/20 shadow-lg shadow-indigo-600/20 flex items-center justify-center bg-white/5">
                        <img src={sgLogo} alt="SG Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight leading-none">Portal</h1>
                        <p className="text-xs text-indigo-300 font-medium tracking-widest uppercase mt-1">Software Gaze</p>
                    </div>
                </div>

                {/* User Card */}
                <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-xl p-4 border border-indigo-500/20 flex items-center space-x-3 shadow-inner group transition-all duration-300 hover:border-indigo-500/40">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                        <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                            <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                <p className="text-xs font-bold text-indigo-300/60 uppercase tracking-widest mb-4 px-2">Main Menu</p>
                <nav className="space-y-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'shadow-lg shadow-indigo-900/20'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                {/* Active Background Gradient */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-90" />
                                )}

                                {/* Hover Glow Effect (Inactive) */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors duration-300" />
                                )}

                                <div className={`relative z-10 mr-3 p-2 rounded-lg transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'
                                    }`}>
                                    {React.cloneElement(tab.icon, {
                                        size: 22,
                                        strokeWidth: isActive ? 2.5 : 2
                                    })}
                                </div>

                                <span className={`relative z-10 font-semibold text-[15px] transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                    }`}>
                                    {tab.label}
                                </span>

                                {isActive && (
                                    <ChevronRight className="ml-auto text-white relative z-10 animate-in fade-in slide-in-from-left-2" size={16} />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-indigo-500/10 bg-[#0f172a]/50">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-red-900/80 hover:to-red-800/80 text-slate-300 hover:text-white rounded-xl border border-white/5 hover:border-red-500/30 transition-all duration-300 group shadow-lg"
                >
                    <LogOut size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
