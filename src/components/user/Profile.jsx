import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Profile = () => {
    const { user, isAdmin } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        designation: user?.designation || '',
    });

    const handleInputChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // Future: Integration with userService.updateProfile
        console.log('Saving profile:', profileData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">My Profile</h2>
                <Button
                    variant={isEditing ? 'secondary' : 'primary'}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="backdrop-blur-xl border-blue-500/30">
                        <div className="p-6 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-bold text-white">{user?.username}</h3>
                            <p className="text-gray-300">{profileData.designation || 'Team Member'}</p>
                            <div className="mt-4">
                                <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${isAdmin
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    }`}>
                                    {isAdmin ? 'Administrator' : 'User'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="backdrop-blur-xl border-blue-500/30">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">Profile Information</h3>
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
                                        <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={isAdmin ? 'Administrator' : 'User'}
                                            disabled
                                            className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-gray-800/50 text-gray-400 cursor-not-allowed"
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
                                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="mt-6 backdrop-blur-xl border-blue-500/30">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">Account Settings</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Change Password</h4>
                                        <p className="text-sm text-gray-400">Update your account password</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Change
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-400">Add an extra layer of security</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Enable
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
