import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: '',
        designation: '',
        role: user?.role || ''
    });

    const handleInputChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // In a real app, this would make an API call to update the profile
        console.log('Saving profile:', profileData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <Button
                    variant={isEditing ? 'secondary' : 'primary'}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <div className="p-6 text-center">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
                            <p className="text-gray-600">{profileData.designation || 'No designation set'}</p>
                            <div className="mt-4">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                    user?.role === 'ROLE_ADMIN' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Username"
                                        name="username"
                                        value={profileData.username}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                    
                                    <Input
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                    
                                    <Input
                                        label="Designation"
                                        name="designation"
                                        value={profileData.designation}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end space-x-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave}>
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="mt-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                                        <p className="text-sm text-gray-600">Update your account password</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Change
                                    </Button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Enable
                                    </Button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                                        <p className="text-sm text-gray-600">Manage your notification preferences</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Configure
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
