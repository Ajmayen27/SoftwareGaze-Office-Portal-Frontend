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
        <div className="w-64 bg-white shadow-lg h-full flex flex-col hidden lg:flex">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Software Gaze</h1>
                <p className="text-sm text-gray-600">Portal</p>
            </div>
            
            <div className="flex-1 p-4">
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-lg mr-3">{tab.icon}</span>
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
