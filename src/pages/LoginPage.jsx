import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/apiService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await authService.signin({ username, password });
            if (response.data.jwt) {
                login(response.data.jwt);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                        Streamline Your Office Management
                    </p>
                    
                    {/* Subtle animated dots */}
                    <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-md relative z-10">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h1>
                        <p className="text-gray-600 text-sm">Access your account</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            error={error && error.includes('username') ? error : ''}
                        />
                        
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            error={error && error.includes('password') ? error : ''}
                        />
                        
                        {error && !error.includes('username') && !error.includes('password') && (
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
                            Sign In
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;

