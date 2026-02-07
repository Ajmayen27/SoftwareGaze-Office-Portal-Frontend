import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const BackendConnectionTest = () => {
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const testEndpoints = [
        { name: 'Auth Signup', url: '/auth/signup', method: 'POST' },
        { name: 'Auth Signin', url: '/auth/signin', method: 'POST' },
        { name: 'Get Employees', url: '/admin/employees', method: 'GET' },
        { name: 'Get Expenses', url: '/admin/expenses', method: 'GET' },
        { name: 'Get Users', url: '/users', method: 'GET' },
    ];

    const testConnection = async () => {
        setIsRunning(true);
        setTestResults([]);
        
        for (const endpoint of testEndpoints) {
            try {
                const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}${endpoint.url}`, {
                    method: endpoint.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                
                setTestResults(prev => [...prev, {
                    name: endpoint.name,
                    status: response.ok ? 'success' : 'error',
                    statusCode: response.status,
                    message: response.ok ? 'OK' : `Error: ${response.status}`
                }]);
            } catch (error) {
                setTestResults(prev => [...prev, {
                    name: endpoint.name,
                    status: 'error',
                    statusCode: 'N/A',
                    message: error.message
                }]);
            }
        }
        
        setIsRunning(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Backend Connection Test</h3>
            
            <button
                onClick={testConnection}
                disabled={isRunning}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {isRunning ? 'Testing...' : 'Test Backend Connection'}
            </button>
            
            {testResults.length > 0 && (
                <div className="space-y-2">
                    {testResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded">
                            <span className="font-medium">{result.name}</span>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    result.status === 'success' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {result.statusCode}
                                </span>
                                <span className="text-sm text-gray-600">{result.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Backend Setup Checklist:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Spring Boot server running on port 8080</li>
                    <li>✅ CORS enabled for {window.location.origin}</li>
                    <li>✅ H2 database configured</li>
                    <li>✅ JWT authentication configured</li>
                    <li>✅ All required endpoints implemented</li>
                </ul>
            </div>
        </div>
    );
};

export default BackendConnectionTest;
