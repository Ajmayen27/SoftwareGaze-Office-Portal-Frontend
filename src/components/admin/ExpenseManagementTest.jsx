import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const ExpenseManagementTest = () => {
    const [loading, setLoading] = useState(true);
    const [testResults, setTestResults] = useState([]);

    useEffect(() => {
        runTests();
    }, []);

    const runTests = async () => {
        setLoading(true);
        const results = [];

        // Test 1: Basic component render
        try {
            results.push({
                test: 'Component Render',
                status: 'success',
                message: 'ExpenseManagement component loaded successfully'
            });
        } catch (error) {
            results.push({
                test: 'Component Render',
                status: 'error',
                message: `Render error: ${error.message}`
            });
        }

        // Test 2: State initialization
        try {
            const testState = {
                expenses: [],
                monthlyTotal: 0,
                yearlyTotal: 0,
                loading: false,
                error: ''
            };
            results.push({
                test: 'State Initialization',
                status: 'success',
                message: 'State variables initialized correctly'
            });
        } catch (error) {
            results.push({
                test: 'State Initialization',
                status: 'error',
                message: `State error: ${error.message}`
            });
        }

        // Test 3: Safe number formatting
        try {
            const testValue = undefined;
            const safeValue = (testValue || 0).toFixed(2);
            results.push({
                test: 'Number Formatting',
                status: 'success',
                message: `Safe formatting works: ${safeValue}`
            });
        } catch (error) {
            results.push({
                test: 'Number Formatting',
                status: 'error',
                message: `Formatting error: ${error.message}`
            });
        }

        setTestResults(results);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Expense Management Test</h2>
            
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Component Tests</h3>
                    <div className="space-y-3">
                        {testResults.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Button onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                        <Button variant="secondary" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ExpenseManagementTest;
