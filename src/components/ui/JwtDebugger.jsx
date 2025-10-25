import React, { useState } from 'react';

const JwtDebugger = () => {
    const [token, setToken] = useState('');
    const [decodedToken, setDecodedToken] = useState(null);
    const [error, setError] = useState('');

    const decodeToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found in localStorage');
                return;
            }

            setToken(token);
            
            // Simple JWT decode (without verification)
            const parts = token.split('.');
            if (parts.length !== 3) {
                setError('Invalid JWT token format');
                return;
            }

            const payload = JSON.parse(atob(parts[1]));
            setDecodedToken(payload);
            setError('');
        } catch (err) {
            setError(`Error decoding token: ${err.message}`);
        }
    };

    const testApiCall = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/expense', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    billType: 'Test Bill',
                    amount: 100.00,
                    comment: 'Test expense',
                    date: new Date().toISOString().split('T')[0]
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                alert('API call successful! Check console for response.');
            } else {
                alert(`API call failed: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            alert(`API call error: ${err.message}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">JWT Token Debugger</h3>
            
            <div className="space-y-4">
                <div>
                    <button
                        onClick={decodeToken}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Decode JWT Token
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {decodedToken && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-medium text-green-900 mb-2">Decoded Token:</h4>
                        <pre className="text-sm text-green-800 overflow-auto">
                            {JSON.stringify(decodedToken, null, 2)}
                        </pre>
                    </div>
                )}

                {token && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-2">Raw Token:</h4>
                        <p className="text-sm text-gray-600 break-all">{token}</p>
                    </div>
                )}

                <div>
                    <button
                        onClick={testApiCall}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Test Add Expense API Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JwtDebugger;
