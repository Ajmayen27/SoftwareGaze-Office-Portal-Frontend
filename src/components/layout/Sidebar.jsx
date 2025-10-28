import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'employees', label: 'Employees', icon: '👥' },
        { id: 'expenses', label: 'Expenses', icon: '💰' },
        { id: 'monthly-breakdown', label: 'Monthly Breakdown', icon: '📅' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'contacts', label: 'Contacts', icon: '👥' },
        { id: 'profile', label: 'Profile', icon: '👤' },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="w-64 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/30 h-full flex flex-col hidden lg:flex">
            <div className="p-6 border-b border-purple-200/50 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Software Gaze</h1>
                <p className="text-sm text-gray-600 font-medium">Portal</p>
            </div>
            
            <div className="flex-1 p-4">
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105 border-r-4 border-purple-300'
                                    : 'text-gray-700 hover:bg-white/50 hover:shadow-md hover:scale-105'
                            }`}
                        >
                            <span className="text-lg mr-3">{tab.icon}</span>
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-4 border-t border-purple-200/50">
                <div className="flex items-center mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-purple-600 font-semibold">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
