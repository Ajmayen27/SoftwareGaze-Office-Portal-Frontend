import React, { useState, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import BackendConnectionTest from '../ui/BackendConnectionTest';
import BackendDiagnostics from '../ui/BackendDiagnostics';
import BackendStatus from '../ui/BackendStatus';
import { adminService } from '../../services/admin.service';
import { useNotification } from '../../contexts/NotificationContext';

const Settings = () => {
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
    const [graceHours, setGraceHours] = useState('');
    const [currentGracePeriod, setCurrentGracePeriod] = useState(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [updatingGracePeriod, setUpdatingGracePeriod] = useState(false);
    const [loadingGracePeriod, setLoadingGracePeriod] = useState(false);
    const { showSuccess, showError } = useNotification();

    const formatDateArray = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) return null;
        const [year, month, day, hour, minute] = dateArray;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${day} ${monthNames[month - 1]} ${year}, ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
    };

    const fetchGracePeriod = useCallback(async () => {
        setLoadingGracePeriod(true);
        try {
            const response = await adminService.getGracePeriod();
            // Assuming GET might return same structure or just the value
            const data = response.data;
            if (data && typeof data === 'object') {
                setCurrentGracePeriod(data.newGraceHours || data.graceHours || 0);
                if (data.updatedAt) setLastUpdatedAt(formatDateArray(data.updatedAt));
            } else {
                setCurrentGracePeriod(data || 0);
            }
        } catch (err) {
            console.error('Failed to fetch grace period:', err);
        } finally {
            setLoadingGracePeriod(false);
        }
    }, []);

    useEffect(() => {
        fetchGracePeriod();
    }, [fetchGracePeriod]);

    const handleUpdateGracePeriod = async (e) => {
        e.preventDefault();
        if (!graceHours) {
            showError('Please enter a grace period value');
            return;
        }

        setUpdatingGracePeriod(true);
        try {
            const response = await adminService.updateGracePeriod(graceHours);
            const { newGraceHours, updatedAt } = response.data;

            setCurrentGracePeriod(newGraceHours);
            if (updatedAt) setLastUpdatedAt(formatDateArray(updatedAt));

            showSuccess(`Grace period updated to ${newGraceHours} hour(s) successfully`);
            setGraceHours('');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update grace period';
            showError(errorMessage);
        } finally {
            setUpdatingGracePeriod(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(147, 51, 234, 0.5)' }}>
                Settings
            </h1>

            <Card className="transform transition-all duration-300 hover:shadow-xl">
                <div className="px-6 py-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        Backend Utilities
                        <div className="ml-auto">
                            <BackendStatus />
                        </div>
                    </h3>
                </div>
                <div className="p-0">
                    <div className="divide-y divide-gray-700/50">
                        {/* Connection Test Item */}
                        <div className="p-6 transition-colors duration-200 hover:bg-gray-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">Connection Integrity Test</h4>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Verify connectivity to the backend API and database. Use this to troubleshoot network or server issues.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConnectionModal(true)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all duration-200 flex items-center justify-center whitespace-nowrap"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Run Test
                            </button>
                        </div>

                        {/* Diagnostics Item */}
                        <div className="p-6 transition-colors duration-200 hover:bg-gray-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">System Diagnostics</h4>
                                    <p className="text-gray-400 text-sm mt-1">
                                        View detailed system health status, configuration details, and potential issues with the backend services.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDiagnosticsModal(true)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-medium shadow-sm transition-all duration-200 flex items-center justify-center whitespace-nowrap"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Open Diagnostics
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="transform transition-all duration-300 hover:shadow-xl">
                <div className="px-6 py-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Attendance Settings
                        <div className="ml-auto flex items-center bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600">
                            <span className="text-xs text-gray-400 mr-2">Current:</span>
                            <span className="text-sm font-bold text-emerald-400">
                                {loadingGracePeriod ? (
                                    <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                ) : (
                                    `${currentGracePeriod ?? '--'} hrs`
                                )}
                            </span>
                        </div>
                    </h3>
                </div>
                <div className="p-6">
                    <form onSubmit={handleUpdateGracePeriod} className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Grace Period (Hours)
                                </label>
                                <div className="text-right">
                                    {currentGracePeriod !== null && (
                                        <div className="text-xs text-emerald-400 font-medium whitespace-nowrap">
                                            Current: {currentGracePeriod} hours
                                        </div>
                                    )}
                                    {lastUpdatedAt && (
                                        <div className="text-[10px] text-gray-500 italic whitespace-nowrap">
                                            Last updated: {lastUpdatedAt}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={graceHours}
                                    onChange={(e) => setGraceHours(e.target.value)}
                                    placeholder="Enter grace hours (e.g. 1.0)"
                                    className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                                />
                                <button
                                    type="submit"
                                    disabled={updatingGracePeriod}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {updatingGracePeriod ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    Update Grace Period
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                                This will update the allowed grace period for attendance records. The value is in hours.
                            </p>
                        </div>
                    </form>
                </div>
            </Card >

            <Modal
                isOpen={showConnectionModal}
                onClose={() => setShowConnectionModal(false)}
                title="Backend Connection Test"
            >
                <div className="max-h-[70vh] overflow-y-auto">
                    <BackendConnectionTest />
                </div>
            </Modal>
            <Modal
                isOpen={showDiagnosticsModal}
                onClose={() => setShowDiagnosticsModal(false)}
                title="Backend Diagnostics"
            >
                <div className="max-h-[70vh] overflow-y-auto">
                    <BackendDiagnostics />
                </div>
            </Modal>
        </div >
    );
};

export default Settings;
