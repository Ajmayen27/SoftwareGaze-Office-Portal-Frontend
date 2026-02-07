import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const BackendDiagnostics = () => {
    const [diagnostics, setDiagnostics] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const runDiagnostics = async () => {
        setIsRunning(true);
        const results = [];

        // Test 1: Basic connectivity
        try {
            const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/actuator/health`, {
                method: 'GET',
                mode: 'cors'
            });
            results.push({
                test: 'Backend Health Check',
                status: response.ok ? 'success' : 'error',
                message: response.ok ? 'Backend is running' : `Health check failed: ${response.status}`
            });
        } catch (error) {
            results.push({
                test: 'Backend Health Check',
                status: 'error',
                message: 'Backend is not running or not accessible'
            });
        }

        // Test 2: CORS preflight
        try {
            const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/signup`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': window.location.origin,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });
            results.push({
                test: 'CORS Preflight Check',
                status: response.ok ? 'success' : 'error',
                message: response.ok ? 'CORS is configured' : `CORS issue: ${response.status}`
            });
        } catch (error) {
            results.push({
                test: 'CORS Preflight Check',
                status: 'error',
                message: 'CORS not configured properly'
            });
        }

        // Test 3: Authentication endpoint
        try {
            const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    username: 'test',
                    password: 'test',
                    email: 'test@test.com',
                    designation: 'Developer',
                    role: 'USER'
                })
            });
            results.push({
                test: 'Authentication Endpoint',
                status: response.ok ? 'success' : 'error',
                message: response.ok ? 'Auth endpoint working' : `Auth error: ${response.status}`
            });
        } catch (error) {
            results.push({
                test: 'Authentication Endpoint',
                status: 'error',
                message: 'Authentication endpoint not accessible'
            });
        }

        // Test 4: Admin endpoint (without auth)
        try {
            const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/admin/expenses`, {
                method: 'GET',
                headers: {
                    'Origin': window.location.origin
                }
            });
            results.push({
                test: 'Admin Endpoint Access',
                status: response.status === 401 ? 'success' : 'error',
                message: response.status === 401 ? 'Admin endpoint protected (good)' : `Unexpected status: ${response.status}`
            });
        } catch (error) {
            results.push({
                test: 'Admin Endpoint Access',
                status: 'error',
                message: 'Admin endpoint not accessible'
            });
        }

        setDiagnostics(results);
        setIsRunning(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Backend Diagnostics</h3>
            
            <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
                {isRunning ? 'Running Diagnostics...' : 'Run Backend Diagnostics'}
            </button>
            
            {diagnostics && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Diagnostic Results:</h4>
                    {diagnostics.map((result, index) => (
                        <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">{result.test}</span>
                                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                result.status === 'success' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {result.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Common Solutions:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Add CORS configuration to your Spring Boot app</li>
                    <li>• Update Security configuration to allow CORS</li>
                    <li>• Add @CrossOrigin annotations to controllers</li>
                    <li>• Ensure backend is running on port 8080</li>
                    <li>• Check application.properties for CORS settings</li>
                </ul>
            </div>
        </div>
    );
};

export default BackendDiagnostics;
