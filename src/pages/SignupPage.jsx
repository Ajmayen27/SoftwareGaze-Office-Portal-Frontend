import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/apiService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        designation: '',
        role: 'USER'
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        
        try {
            await authService.signup(formData);
            setMessage('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Username or email may already be taken.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center modern-bg">
            <div className="floating-shapes"></div>
            <div className="pattern-overlay"></div>
            
            {/* Attractive Banner */}
            <div className="w-full max-w-5xl mx-auto px-4 relative z-10 mb-8 animate-slide-down">
                <div className="text-center">
                    {/* Main Title */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight animate-fade-in drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(147, 51, 234, 0.5)' }}>
                        Software Gaze Portal
                    </h1>
                    
                    {/* Tagline */}
                    <p className="text-xl md:text-2xl text-gray-200 font-light tracking-wide mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        Join Your Digital Workspace
                    </p>
                    
                    {/* Subtle animated dots */}
                    <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-4xl relative z-10">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
                        <p className="text-gray-600 text-sm">Get started today</p>
                    </div>
                    
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input
                                    label="Username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                
                                <Input
                                    label="Designation"
                                    name="designation"
                                    type="text"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div></div> {/* Empty div for spacing */}
                        </div>
                        
                        {message && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-green-600 text-sm">{message}</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                        
                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={loading}
                        >
                            Create Account
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SignupPage;

