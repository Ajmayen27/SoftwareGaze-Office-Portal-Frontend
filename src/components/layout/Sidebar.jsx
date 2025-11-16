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
        { id: 'analytics', label: 'Analytics', color: 'from-indigo-500 to-indigo-600' },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
        { id: 'contacts', label: 'Contacts', color: 'from-green-500 to-green-600' },
        { id: 'profile', label: 'Profile', color: 'from-purple-500 to-purple-600' },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="w-64 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-indigo-600/20 backdrop-blur-2xl shadow-2xl border-r border-indigo-300/30 h-full flex flex-col hidden lg:flex rounded-r-2xl overflow-hidden ml-4 mt-4 mb-4">
            <div className="p-6 border-b border-indigo-300/20 bg-gradient-to-br from-indigo-400/30 via-purple-400/30 to-indigo-500/30 backdrop-blur-sm rounded-t-2xl">
                <div className="bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-indigo-600/40 backdrop-blur-md rounded-xl p-4 shadow-xl border border-indigo-300/40">
                    <h1 className="text-xl font-bold text-white drop-shadow-xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(118, 75, 162, 0.6)' }}>Software Gaze</h1>
                    <p className="text-sm text-indigo-100 font-medium drop-shadow-lg">Portal</p>
                </div>
            </div>
            
            <div className="flex-1 p-4 bg-gradient-to-b from-indigo-400/10 via-purple-400/10 to-indigo-500/10">
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ease-in-out group ${
                                activeTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg border-r-4 border-indigo-300/60 rounded-r-xl`
                                    : 'text-indigo-100 hover:bg-indigo-400/30 hover:shadow-lg hover:text-white hover:scale-[1.02]'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ease-in-out ${
                                activeTab === tab.id
                                    ? 'bg-white/30 shadow-lg'
                                    : `bg-gradient-to-br ${tab.color} group-hover:shadow-lg group-hover:scale-105`
                            }`}>
                                <div className={`w-4 h-4 rounded-sm transition-all duration-200 ease-in-out ${
                                    activeTab === tab.id ? 'bg-white' : 'bg-white'
                                }`}></div>
                            </div>
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-4 border-t border-indigo-300/20 bg-gradient-to-t from-indigo-400/20 via-purple-400/20 to-indigo-500/20 rounded-b-2xl">
                <div className="flex items-center mb-4 p-3 rounded-xl bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-indigo-600/30 backdrop-blur-sm border border-indigo-300/40 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105">
                        <div className="w-5 h-5 bg-white rounded-sm"></div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{user?.username}</p>
                        <p className="text-xs text-indigo-200 font-semibold bg-indigo-400/30 px-2 py-1 rounded-md backdrop-blur-sm shadow-sm">
                            {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-105"
                >
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
