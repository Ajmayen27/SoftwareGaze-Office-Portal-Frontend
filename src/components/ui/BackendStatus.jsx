import React, { useState, useEffect } from 'react';

const BackendStatus = () => {
    const [status, setStatus] = useState('checking');
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        checkBackendStatus();
    }, []);

    const checkBackendStatus = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/admin/expenses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(3000)
            });
            
            if (response.ok) {
                setStatus('online');
                setIsOnline(true);
            } else {
                setStatus('offline');
                setIsOnline(false);
            }
        } catch (error) {
            setStatus('offline');
            setIsOnline(false);
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'online':
                return 'bg-green-100 text-green-800';
            case 'offline':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'online':
                return 'Backend Connected';
            case 'offline':
                return 'Using Mock Data';
            default:
                return 'Checking...';
        }
    };

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            {getStatusText()}
        </div>
    );
};

export default BackendStatus;
