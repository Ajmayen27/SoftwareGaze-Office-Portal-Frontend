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
            <div className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-white/30 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Software Gaze</h1>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-110"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="bg-white/95 backdrop-blur-xl border-b border-white/30 shadow-2xl">
                    <div className="px-4 py-2">
                        <div className="flex items-center mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                <p className="text-xs text-purple-600 font-semibold">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
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
                                    className={`w-full flex items-center px-3 py-2 text-left rounded-xl transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-white/50'
                                    }`}
                                >
                                    <span className="text-lg mr-3">{tab.icon}</span>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                        
                        <div className="mt-4 pt-4 border-t border-purple-200/50">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
