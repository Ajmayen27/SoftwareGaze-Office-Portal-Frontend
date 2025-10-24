import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const MobileHeader = ({ activeTab, setActiveTab }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'employees', label: 'Employees', icon: '👥' },
        { id: 'expenses', label: 'Expenses', icon: '💰' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
    ];

    const userTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'contacts', label: 'Contacts', icon: '👥' },
        { id: 'profile', label: 'Profile', icon: '👤' },
    ];

    const tabs = user?.role === 'ROLE_ADMIN' ? adminTabs : userTabs;

    return (
        <div className="lg:hidden">
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-lg font-bold text-gray-900">Software Gaze</h1>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="bg-white border-b border-gray-200 shadow-lg">
                    <div className="px-4 py-2">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                <p className="text-xs text-gray-500">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                        
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-lg mr-3">{tab.icon}</span>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={logout}
                                className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <span className="mr-3">🚪</span>
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileHeader;
