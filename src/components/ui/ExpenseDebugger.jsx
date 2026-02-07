import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin.service';

const ExpenseDebugger = () => {
    const [debugInfo, setDebugInfo] = useState({});
    const [testResult, setTestResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAuthenticated, isAdmin } = useAuth();

    const runDiagnostics = async () => {
        setIsLoading(true);
        setDebugInfo({});
        setTestResult('');

        try {
            // 1. Check authentication status
            const authStatus = {
                isAuthenticated,
                isAdmin,
                user: user ? {
                    username: user.username,
                    role: user.role,
                    hasToken: !!user.token
                } : null,
                token: localStorage.getItem('token')
            };

            // 2. Test JWT token validity
            let tokenValid = false;
            let tokenError = '';
            try {
                if (authStatus.token) {
                    const parts = authStatus.token.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1]));
                        const currentTime = Date.now() / 1000;
                        tokenValid = payload.exp > currentTime;
                        if (!tokenValid) {
                            tokenError = 'Token has expired';
                        }
                    } else {
                        tokenError = 'Invalid token format';
                    }
                } else {
                    tokenError = 'No token found';
                }
            } catch (err) {
                tokenError = `Token decode error: ${err.message}`;
            }

            // 3. Test API endpoints
            const endpointTests = [];

            // Test GET expenses
            try {
                const getResponse = await adminService.getExpenses();
                endpointTests.push({
                    endpoint: 'GET /admin/expenses',
                    status: 'success',
                    statusCode: getResponse.status,
                    message: 'Success'
                });
            } catch (err) {
                endpointTests.push({
                    endpoint: 'GET /admin/expenses',
                    status: 'error',
                    statusCode: err.response?.status || 'N/A',
                    message: err.response?.statusText || err.message
                });
            }

            // Test POST expense
            try {
                const testExpense = {
                    billType: 'Debug Test',
                    amount: 1.00,
                    comment: 'Debug test expense',
                    date: new Date().toISOString().split('T')[0]
                };
                const postResponse = await adminService.addExpense(testExpense);
                endpointTests.push({
                    endpoint: 'POST /admin/expenses',
                    status: 'success',
                    statusCode: postResponse.status,
                    message: 'Success - Test expense added'
                });
            } catch (err) {
                endpointTests.push({
                    endpoint: 'POST /admin/expenses',
                    status: 'error',
                    statusCode: err.response?.status || 'N/A',
                    message: err.response?.statusText || err.message
                });
            }

            setDebugInfo({
                authStatus,
                tokenValid,
                tokenError,
                endpointTests
            });

            // 4. Generate recommendations
            let recommendations = [];

            if (!authStatus.isAuthenticated) {
                recommendations.push('❌ User is not authenticated. Please login first.');
            }

            if (!authStatus.isAdmin) {
                recommendations.push('⚠️ User does not have ADMIN role. Check if user has correct permissions.');
            }

            if (!tokenValid) {
                recommendations.push('❌ JWT token is invalid or expired. Please login again.');
            }

            if (endpointTests.some(test => test.status === 'error' && test.statusCode === 403)) {
                recommendations.push('❌ 403 Forbidden: Check backend Spring Security configuration. Ensure /api/admin/** endpoints are allowed for ADMIN role.');
            }

            if (endpointTests.some(test => test.status === 'error' && test.statusCode === 404)) {
                recommendations.push('❌ 404 Not Found: Check if backend endpoint exists and is properly mapped.');
            }

            if (recommendations.length === 0) {
                recommendations.push('✅ All tests passed! The expense functionality should work correctly.');
            }

            setTestResult(recommendations.join('\n'));

        } catch (error) {
            setTestResult(`❌ Diagnostic error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Expense Debugger</h3>

            <button
                onClick={runDiagnostics}
                disabled={isLoading}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Running Diagnostics...' : 'Run Expense Diagnostics'}
            </button>

            {Object.keys(debugInfo).length > 0 && (
                <div className="space-y-4">
                    {/* Authentication Status */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Authentication Status:</h4>
                        <pre className="text-sm text-gray-600 overflow-auto">
                            {JSON.stringify(debugInfo.authStatus, null, 2)}
                        </pre>
                    </div>

                    {/* Token Status */}
                    <div className={`border rounded-lg p-4 ${debugInfo.tokenValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                        <h4 className={`font-medium mb-2 ${debugInfo.tokenValid ? 'text-green-900' : 'text-red-900'
                            }`}>
                            JWT Token Status:
                        </h4>
                        <p className={`text-sm ${debugInfo.tokenValid ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {debugInfo.tokenValid ? '✅ Valid' : `❌ ${debugInfo.tokenError}`}
                        </p>
                    </div>

                    {/* Endpoint Tests */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Endpoint Tests:</h4>
                        <div className="space-y-2">
                            {debugInfo.endpointTests?.map((test, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded">
                                    <span className="font-medium">{test.endpoint}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded text-xs ${test.status === 'success'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {test.statusCode}
                                        </span>
                                        <span className="text-sm text-gray-600">{test.message}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {testResult && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Recommendations:</h4>
                    <pre className="text-sm text-blue-800 whitespace-pre-wrap">{testResult}</pre>
                </div>
            )}
        </div>
    );
};

export default ExpenseDebugger;
