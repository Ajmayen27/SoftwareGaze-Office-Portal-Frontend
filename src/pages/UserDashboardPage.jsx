import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import MobileHeader from '../components/layout/MobileHeader';
import Contacts from '../components/user/Contacts';
import Profile from '../components/user/Profile';
import Card from '../components/ui/Card';

const UserDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user } = useAuth();

    const renderContent = () => {
        switch (activeTab) {
            case 'contacts':
                return <Contacts />;
            case 'profile':
                return <Profile />;
            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Welcome, {user?.username}!</h1>
                            <p className="text-gray-700 mt-2 font-medium">Here's your personal dashboard.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="text-2xl">👥</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Team Members</p>
                                            <p className="text-2xl font-bold text-gray-900">12</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <span className="text-2xl">📧</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Messages</p>
                                            <p className="text-2xl font-bold text-gray-900">5</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <span className="text-2xl">📅</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                                            <p className="text-2xl font-bold text-gray-900">3</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setActiveTab('contacts')}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">👥</span>
                                                <span className="font-medium">View Contacts</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">👤</span>
                                                <span className="font-medium">Edit Profile</span>
                                            </div>
                                        </button>
                                        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">📧</span>
                                                <span className="font-medium">Send Message</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">Logged in successfully</p>
                                                <p className="text-xs text-gray-500">2 minutes ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">Profile updated</p>
                                                <p className="text-xs text-gray-500">1 hour ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">Contact list viewed</p>
                                                <p className="text-xs text-gray-500">3 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen modern-bg">
            <div className="floating-shapes"></div>
            <div className="pattern-overlay"></div>
            <div className="content-layer">
                <MobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex">
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="flex-1 p-4 lg:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;

