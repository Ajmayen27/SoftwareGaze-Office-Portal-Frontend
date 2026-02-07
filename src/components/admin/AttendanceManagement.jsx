import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import Table from '../ui/Table';
import Badge from '../ui/Badge';

const AttendanceManagement = () => {
    const [activeView, setActiveView] = useState('add'); // 'add', 'all', 'individual'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Add Attendance State
    const [attendanceForm, setAttendanceForm] = useState({
        employeeUsername: '',
        punchIn: '',
        punchOut: '',
        comment: ''
    });

    // View All Attendance State
    const [allSummary, setAllSummary] = useState([]);
    const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
    const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
    const [summaryStatusFilter, setSummaryStatusFilter] = useState('Present');

    // View Individual Attendance State
    const [individualAttendance, setIndividualAttendance] = useState(null);
    const [individualUsername, setIndividualUsername] = useState('');
    const [individualMonth, setIndividualMonth] = useState(new Date().getMonth() + 1);
    const [individualYear, setIndividualYear] = useState(new Date().getFullYear());
    const [commentFilter, setCommentFilter] = useState('');

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [attendanceToDelete, setAttendanceToDelete] = useState(null);

    // Employees list for dropdown
    const [employees, setEmployees] = useState([]);

    const { showSuccess, showError, showInfo } = useNotification();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await adminService.getEmployees();
            setEmployees(response.data || []);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        }
    };

    const handleAddAttendance = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Format the date-time strings to ISO format (datetime-local returns YYYY-MM-DDTHH:mm, need YYYY-MM-DDTHH:mm:ss)
            const formatDateTime = (dateTimeString) => {
                if (!dateTimeString) return null;
                // If it doesn't have seconds, add :00
                if (dateTimeString.length === 16) {
                    return dateTimeString + ':00';
                }
                return dateTimeString;
            };

            const attendanceData = {
                employeeUsername: attendanceForm.employeeUsername,
                punchIn: formatDateTime(attendanceForm.punchIn),
                punchOut: formatDateTime(attendanceForm.punchOut),
                comment: attendanceForm.comment || ''
            };

            await adminService.addAttendance(attendanceData);

            // Reset form
            setAttendanceForm({
                employeeUsername: '',
                punchIn: '',
                punchOut: '',
                comment: ''
            });

            showSuccess(`Attendance added successfully for Employee ${attendanceData.employeeUsername}`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to add attendance';
            setError(errorMessage);
            showError(errorMessage);
            console.error('Failed to add attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAllAttendance = async () => {
        setError('');
        setLoading(true);
        setAllSummary([]);

        try {
            // Get employee list if not already available
            let empList = employees;
            if (empList.length === 0) {
                try {
                    const empRes = await adminService.getEmployees();
                    empList = empRes.data || [];
                    setEmployees(empList);
                } catch (e) {
                    console.error("Failed to fetch employees list inside summary view", e);
                    empList = [];
                }
            }

            if (empList.length === 0) {
                showInfo("No employees found to generate summary.");
                setLoading(false);
                return;
            }

            // Fetch attendance for each employee individually to count by status
            const promises = empList.map(async (emp) => {
                try {
                    // Start with default object
                    const result = {
                        employeeUsername: emp.username,
                        month: new Date(2024, summaryMonth - 1).toLocaleString('default', { month: 'long' }),
                        year: summaryYear,
                        count: 0
                    };

                    const response = await adminService.getIndividualAttendance(emp.username, summaryMonth, summaryYear);
                    const responseData = response.data;

                    if (responseData && responseData.attendances && Array.isArray(responseData.attendances)) {
                        result.count = responseData.attendances.filter(att => {
                            // If filter is empty/All, count everything
                            if (summaryStatusFilter === 'All Records' || !summaryStatusFilter) return true;

                            const comment = att.comment || att.Comment || att.COMMENT || att.note || att.notes || att.description || att.Description || '';
                            // Case-sensitive exact match might be too strict if data is messy, but based on dropdown values it should be fine.
                            return comment === summaryStatusFilter;
                        }).length;
                    }
                    return result;

                } catch (err) {
                    console.error(`Failed to fetch attendance for ${emp.username}`, err);
                    // Return zero count entry on error
                    return {
                        employeeUsername: emp.username,
                        month: new Date(2024, summaryMonth - 1).toLocaleString('default', { month: 'long' }),
                        year: summaryYear,
                        count: 0
                    };
                }
            });

            const results = await Promise.all(promises);
            setAllSummary(results);

            showSuccess(`Processed attendance records for ${results.length} employees`);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch attendance summary';
            setError(errorMessage);
            showError(errorMessage);
            console.error('Failed to fetch attendance summary:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewIndividualAttendance = async () => {
        if (!individualUsername.trim()) {
            setError('Please select a username');
            showError('Please select a username');
            return;
        }

        setError('');
        setLoading(true);
        setIndividualAttendance(null);

        try {
            const response = await adminService.getIndividualAttendance(individualUsername, individualMonth, individualYear);
            console.log('Individual attendance API response:', response);
            console.log('Response data:', response.data);
            console.log('Response status:', response.status);

            // Axios wraps the response, so response.data contains the actual API response
            const responseData = response.data;

            // New API structure: { month, year, employee, attendances: [{ day, punchIn, punchOut }] }
            // Check if response has attendances array
            if (responseData && responseData.attendances && Array.isArray(responseData.attendances) && responseData.attendances.length > 0) {
                setIndividualAttendance(responseData);
                showSuccess(`Found ${responseData.attendances.length} attendance record(s) for ${responseData.employee || individualUsername}`);
            } else {
                // No data found - could be empty array or null
                setIndividualAttendance(null);
                showInfo(`No attendance records found for ${individualUsername} in ${individualMonth}/${individualYear}`);
            }
        } catch (err) {
            console.error('Failed to fetch individual attendance:', err);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);

            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch individual attendance';
            setError(errorMessage);
            setIndividualAttendance(null);

            // If it's a 404, show info instead of error
            if (err.response?.status === 404) {
                showInfo(`No attendance records found for ${individualUsername} in ${individualMonth}/${individualYear}`);
            } else {
                showError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (attendance) => {
        setAttendanceToDelete(attendance);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!attendanceToDelete) return;

        try {
            setLoading(true);

            // Extract parameters for the new API: username, year, month, day
            const username = individualAttendance?.employee || individualUsername;
            const year = individualAttendance?.year || individualYear;
            const month = individualAttendance?.month || individualMonth;
            const day = attendanceToDelete.day;

            if (!username || !year || !month || !day) {
                showError('Cannot delete: Missing required parameters (username, year, month, or day)');
                setLoading(false);
                return;
            }

            await adminService.deleteAttendance(username, year, month, day);
            showSuccess('Attendance has been deleted successfully');
            setDeleteModalOpen(false);
            setAttendanceToDelete(null);

            // Refresh data
            await handleViewIndividualAttendance();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete attendance';
            showError(errorMessage);
            console.error('Failed to delete attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTimeArray = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) return 'N/A';
        const [year, month, day, hour, minute] = dateArray;
        // Format time as HH:MM AM/PM
        const hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
    };

    const formatFullDateTime = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) return { date: 'N/A', time: 'N/A', hour: 'N/A', minute: 'N/A' };
        const [year, month, day, hour, minute] = dateArray;
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return {
            date: `${day}, ${monthNames[month - 1]} ${year}`,
            time: `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`,
            hour: hour,
            minute: minute,
            day: day,
            month: monthNames[month - 1],
            year: year
        };
    };

    const formatDateArray = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return 'N/A';
        const [year, month, day] = dateArray;
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${day}, ${monthNames[month - 1]} ${year}`;
    };

    const formatDateParts = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return { day: 'N/A', month: 'N/A', year: 'N/A' };
        const [year, month, day] = dateArray;
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return {
            day: day,
            month: monthNames[month - 1],
            year: year
        };
    };

    const renderAddAttendance = () => {
        // Get current date-time in ISO format for default values
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].substring(0, 5);

        return (
            <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl backdrop-blur-xl border border-blue-500/30 shadow-lg rounded-2xl overflow-hidden">
                <div className="px-8 py-5 border-b border-blue-500/30 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-md">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mr-4 flex items-center justify-center shadow-lg border border-white/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        Add Attendance
                    </h3>
                    <p className="text-blue-100 text-sm mt-1 ml-14">Record new attendance entries for employees</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30">
                    {error && (
                        <div className="mb-6 bg-gradient-to-r from-red-600/20 to-red-500/20 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-300 text-base font-medium">{error}</p>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleAddAttendance} className="space-y-6">
                        <div>
                            <label className="block text-base font-bold text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Employee Username *
                            </label>
                            <select
                                value={attendanceForm.employeeUsername}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, employeeUsername: e.target.value })}
                                className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                required
                            >
                                <option value="" className="bg-gray-800 text-white">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.username} className="bg-gray-800 text-white">
                                        {emp.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-bold text-white mb-3 flex items-center">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Punch In
                                </label>
                                <input
                                    type="datetime-local"
                                    value={attendanceForm.punchIn}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, punchIn: e.target.value })}
                                    className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>

                            <div>
                                <label className="block text-base font-bold text-white mb-3 flex items-center">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Punch Out
                                </label>
                                <input
                                    type="datetime-local"
                                    value={attendanceForm.punchOut}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, punchOut: e.target.value })}
                                    className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-bold text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Comment
                            </label>
                            <select
                                value={attendanceForm.comment}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, comment: e.target.value })}
                                className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            >
                                <option value="" className="bg-gray-800 text-white">Select Status</option>
                                <option value="Present" className="bg-gray-800 text-white">Present</option>
                                <option value="Absent" className="bg-gray-800 text-white">Absent</option>
                                <option value="Leave" className="bg-gray-800 text-white">Leave</option>
                                <option value="Sick" className="bg-gray-800 text-white">Sick</option>
                                <option value="Office Tour" className="bg-gray-800 text-white">Office Tour</option>
                                <option value="Other" className="bg-gray-800 text-white">Other</option>
                            </select>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-700/50">
                            <Button
                                type="submit"
                                disabled={loading}
                                loading={loading}
                                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Add Attendance
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    };

    const renderViewAllAttendance = () => {
        return (
            <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl backdrop-blur-xl border border-green-500/30 shadow-lg rounded-2xl overflow-hidden">
                <div className="px-8 py-5 border-b border-green-500/30 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 shadow-md">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mr-4 flex items-center justify-center shadow-lg border border-white/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        View All Users Attendance Summary
                    </h3>
                    <p className="text-green-100 text-sm mt-1 ml-14">View comprehensive attendance statistics for all employees</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30">
                    {error && (
                        <div className="mb-6 bg-gradient-to-r from-red-600/20 to-red-500/20 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-300 text-base font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <label className="block text-base font-bold text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Month
                            </label>
                            <select
                                value={summaryMonth}
                                onChange={(e) => setSummaryMonth(parseInt(e.target.value))}
                                className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month} className="bg-gray-800 text-white">
                                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-base font-bold text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Year
                            </label>
                            <input
                                type="number"
                                value={summaryYear}
                                onChange={(e) => setSummaryYear(parseInt(e.target.value))}
                                className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                min="2020"
                                max="2100"
                            />
                        </div>
                        <div>
                            <label className="block text-base font-bold text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Filter by Status
                            </label>
                            <select
                                value={summaryStatusFilter}
                                onChange={(e) => setSummaryStatusFilter(e.target.value)}
                                className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                            >
                                <option value="Present" className="bg-gray-800 text-white">Present</option>
                                <option value="Absent" className="bg-gray-800 text-white">Absent</option>
                                <option value="Leave" className="bg-gray-800 text-white">Leave</option>
                                <option value="Sick" className="bg-gray-800 text-white">Sick</option>
                                <option value="Office Tour" className="bg-gray-800 text-white">Office Tour</option>
                                <option value="Other" className="bg-gray-800 text-white">Other</option>
                                <option value="All Records" className="bg-gray-800 text-white">All Records</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleViewAllAttendance}
                                disabled={loading}
                                loading={loading}
                                className="w-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    View Summary
                                </span>
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : allSummary.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-gray-700/50 shadow-md">
                            <Table>
                                <Table.Header>
                                    <tr className="bg-gradient-to-r from-green-600/20 to-emerald-600/20">
                                        <Table.Cell header className="font-bold text-base text-white">Employee Username</Table.Cell>
                                        <Table.Cell header className="font-bold text-base text-white">Month</Table.Cell>
                                        <Table.Cell header className="font-bold text-base text-white">Year</Table.Cell>
                                        <Table.Cell header className="font-bold text-base text-white">Days {summaryStatusFilter === 'All Records' || !summaryStatusFilter ? 'Total' : summaryStatusFilter}</Table.Cell>
                                    </tr>
                                </Table.Header>
                                <Table.Body>
                                    {allSummary.map((summary, index) => (
                                        <Table.Row key={index} className="hover:bg-gray-800/40 transition-all duration-200 border-b border-gray-700/50">
                                            <Table.Cell className="font-bold text-base text-white py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-md">
                                                        {summary.employeeUsername.charAt(0).toUpperCase()}
                                                    </div>
                                                    {summary.employeeUsername}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-base text-white font-medium py-4">{summary.month}</Table.Cell>
                                            <Table.Cell className="text-base text-white font-medium py-4">{summary.year}</Table.Cell>
                                            <Table.Cell className="text-base py-4">
                                                <Badge variant="success" className="px-4 py-2 font-bold shadow-md">{summary.count} days</Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl border-2 border-dashed border-gray-600/50">
                            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-white mb-2">No attendance records found</p>
                            <p className="text-base text-gray-300">Please select month and year and click "View Summary" to load data.</p>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const renderViewIndividualAttendance = () => {
        return (
            <Card className="transition-all duration-300 ease-in-out hover:shadow-2xl backdrop-blur-xl border border-purple-500/30 shadow-lg rounded-2xl overflow-hidden">
                <div className="px-8 py-5 border-b border-purple-500/30 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 shadow-md">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mr-4 flex items-center justify-center shadow-lg border border-white/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        View Individual User Attendance
                    </h3>
                    <p className="text-purple-100 text-sm mt-1 ml-14">View detailed attendance records for a specific employee</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30">
                    {error && (
                        <div className="mb-6 bg-gradient-to-r from-red-600/20 to-red-500/20 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-300 text-base font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Layout Refinement: Username on top row, filters and button below */}
                    <div className="space-y-6 mb-8">
                        {/* Row 1: Employee Username - Full width for better visibility */}
                        <div>
                            <label className="block text-base font-bold text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Employee Username *
                            </label>
                            <select
                                value={individualUsername}
                                onChange={(e) => setIndividualUsername(e.target.value)}
                                className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                required
                            >
                                <option value="" className="bg-gray-800 text-white">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.username} className="bg-gray-800 text-white">
                                        {emp.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Row 2: Filters and Action Button */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-base font-bold text-white mb-3 flex items-center">
                                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Month
                                </label>
                                <select
                                    value={individualMonth}
                                    onChange={(e) => setIndividualMonth(parseInt(e.target.value))}
                                    className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                        <option key={month} value={month} className="bg-gray-800 text-white">
                                            {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-base font-bold text-white mb-3 flex items-center">
                                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Year
                                </label>
                                <input
                                    type="number"
                                    value={individualYear}
                                    onChange={(e) => setIndividualYear(parseInt(e.target.value))}
                                    className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                    min="2020"
                                    max="2100"
                                />
                            </div>

                            <div>
                                <label className="block text-base font-bold text-white mb-3 flex items-center">
                                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Status
                                </label>
                                <select
                                    value={commentFilter}
                                    onChange={(e) => setCommentFilter(e.target.value)}
                                    className="w-full px-5 py-3.5 text-base border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-800/50 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                                >
                                    <option value="" className="bg-gray-800 text-white">All Records</option>
                                    <option value="Present" className="bg-gray-800 text-white">Present</option>
                                    <option value="Absent" className="bg-gray-800 text-white">Absent</option>
                                    <option value="Leave" className="bg-gray-800 text-white">Leave</option>
                                    <option value="Sick" className="bg-gray-800 text-white">Sick</option>
                                    <option value="Office Tour" className="bg-gray-800 text-white">Office Tour</option>
                                    <option value="Other" className="bg-gray-800 text-white">Other</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleViewIndividualAttendance}
                                    disabled={loading}
                                    loading={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-[54px] rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        View Attendance
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : individualAttendance && individualAttendance.attendances && Array.isArray(individualAttendance.attendances) && individualAttendance.attendances.length > 0 ? (
                        <div>
                            <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 rounded-xl border border-purple-300/30 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 border border-white/30 shadow-lg">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1 text-xl">
                                                {individualAttendance.employee || individualUsername}
                                            </h4>
                                            <p className="text-purple-100 text-base">
                                                {individualAttendance.month ? new Date(individualAttendance.year, individualAttendance.month - 1).toLocaleString('default', { month: 'long' }) : new Date(individualYear, individualMonth - 1).toLocaleString('default', { month: 'long' })} {individualAttendance.year || individualYear}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30 shadow-lg">
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {individualAttendance.attendances.length}
                                        </div>
                                        <div className="text-sm text-purple-100 font-semibold uppercase tracking-wide">
                                            Total Records
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-700/50 shadow-md">
                                <Table>
                                    <Table.Header>
                                        <tr className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                                            <Table.Cell header className="font-bold text-base text-white">Date</Table.Cell>
                                            <Table.Cell header className="font-bold text-base text-white">Punch In</Table.Cell>
                                            <Table.Cell header className="font-bold text-base text-white">Punch Out</Table.Cell>
                                            <Table.Cell header className="font-bold text-base text-white">Total Working Hours</Table.Cell>
                                            <Table.Cell header className="font-bold text-base text-white">Over Time</Table.Cell>
                                            <Table.Cell header className="font-bold text-base text-white">Comment</Table.Cell>
                                            <Table.Cell header className="font-bold text-base text-white">Action</Table.Cell>
                                        </tr>
                                    </Table.Header>
                                    <Table.Body>
                                        {individualAttendance.attendances.filter(attendance => {
                                            if (!commentFilter) return true;
                                            const comment = attendance.comment ||
                                                attendance.Comment ||
                                                attendance.COMMENT ||
                                                attendance.note ||
                                                attendance.notes ||
                                                attendance.description ||
                                                attendance.Description ||
                                                '';
                                            return comment === commentFilter;
                                        }).map((attendance, index) => {
                                            // Debug: Log attendance object to see all fields
                                            if (index === 0) {
                                                console.log('Attendance object:', attendance);
                                                console.log('All attendance keys:', Object.keys(attendance));
                                            }

                                            // New API structure: { day, punchIn: "HH:MM", punchOut: "HH:MM", comment?: string }
                                            // Get month and year from top-level response
                                            const month = individualAttendance.month || individualMonth;
                                            const year = individualAttendance.year || individualYear;
                                            const day = attendance.day;

                                            // Format month name
                                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                                'July', 'August', 'September', 'October', 'November', 'December'];
                                            const monthName = monthNames[month - 1] || 'N/A';

                                            // Format date as "16 October 2025"
                                            const formattedDate = `${day} ${monthName} ${year}`;

                                            // Format time strings (punchIn and punchOut are in "HH:MM" format)
                                            const formatTimeString = (timeStr) => {
                                                if (!timeStr || typeof timeStr !== 'string') {
                                                    return { formatted: 'N/A', time24: null };
                                                }
                                                const [hours, minutes] = timeStr.split(':');
                                                const hour24 = parseInt(hours, 10);
                                                const minute = parseInt(minutes, 10);
                                                if (isNaN(hour24) || isNaN(minute)) {
                                                    return { formatted: timeStr, time24: timeStr };
                                                }

                                                const hour12 = hour24 % 12 || 12;
                                                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                                                return {
                                                    formatted: `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`,
                                                    time24: `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
                                                };
                                            };

                                            const punchInTime = formatTimeString(attendance.punchIn);
                                            const punchOutTime = formatTimeString(attendance.punchOut);

                                            // Get comment - check multiple possible field names (case-insensitive)
                                            const comment = attendance.comment ||
                                                attendance.Comment ||
                                                attendance.COMMENT ||
                                                attendance.note ||
                                                attendance.notes ||
                                                attendance.description ||
                                                attendance.Description ||
                                                null;

                                            return (
                                                <Table.Row key={index} className="hover:bg-gray-800/40 transition-all duration-200 border-b border-gray-700/50">
                                                    <Table.Cell className="py-4">
                                                        <div className="bg-gradient-to-br from-indigo-600/20 via-indigo-500/15 to-purple-600/20 px-4 py-3 rounded-xl border border-indigo-500/30 shadow-sm hover:shadow-md transition-all duration-200">
                                                            <div className="text-xs text-indigo-300 font-bold mb-1 uppercase tracking-wide">
                                                                Date
                                                            </div>
                                                            <div className="text-base font-bold text-white">
                                                                {formattedDate}
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <div className="bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-cyan-600/20 px-4 py-3 rounded-xl border border-blue-500/30 shadow-sm hover:shadow-md transition-all duration-200">
                                                            <div className="text-xs text-blue-300 font-bold mb-1 uppercase tracking-wide">
                                                                Punch In
                                                            </div>
                                                            <div className="text-base font-bold text-white">
                                                                {punchInTime.formatted}
                                                            </div>
                                                            {punchInTime.time24 && punchInTime.time24 !== 'N/A' && (
                                                                <div className="text-xs text-blue-400 mt-1 font-medium">
                                                                    {punchInTime.time24} (24h)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <div className="bg-gradient-to-br from-green-600/20 via-green-500/15 to-emerald-600/20 px-4 py-3 rounded-xl border border-green-500/30 shadow-sm hover:shadow-md transition-all duration-200">
                                                            <div className="text-xs text-green-300 font-bold mb-1 uppercase tracking-wide">
                                                                Punch Out
                                                            </div>
                                                            <div className="text-base font-bold text-white">
                                                                {punchOutTime.formatted}
                                                            </div>
                                                            {punchOutTime.time24 && punchOutTime.time24 !== 'N/A' && (
                                                                <div className="text-xs text-green-400 mt-1 font-medium">
                                                                    {punchOutTime.time24} (24h)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <div className="bg-gradient-to-br from-orange-600/20 via-orange-500/15 to-amber-600/20 px-4 py-3 rounded-xl border border-orange-500/30 shadow-sm hover:shadow-md transition-all duration-200">
                                                            <div className="text-xs text-orange-300 font-bold mb-1 uppercase tracking-wide">
                                                                Total Hours
                                                            </div>
                                                            <div className="text-base font-bold text-white">
                                                                {attendance.totalWorkingHours !== undefined && attendance.totalWorkingHours !== null ? attendance.totalWorkingHours : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <div className="bg-gradient-to-br from-pink-600/20 via-pink-500/15 to-rose-600/20 px-4 py-3 rounded-xl border border-pink-500/30 shadow-sm hover:shadow-md transition-all duration-200">
                                                            <div className="text-xs text-pink-300 font-bold mb-1 uppercase tracking-wide">
                                                                Over Time
                                                            </div>
                                                            <div className="text-base font-bold text-white">
                                                                {attendance.overTime !== undefined && attendance.overTime !== null ? attendance.overTime : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <div className="bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-700/30 px-4 py-3 rounded-xl border border-gray-600/30 shadow-sm hover:shadow-md transition-all duration-200 min-w-[150px]">
                                                            <div className="text-xs text-gray-300 font-bold mb-1 uppercase tracking-wide">
                                                                Comment
                                                            </div>
                                                            <div className="text-base text-white break-words font-medium">
                                                                {comment && comment.trim() !== '' ? comment : <span className="text-gray-400 italic">N/A</span>}
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <Button
                                                            onClick={() => handleDeleteClick(attendance)}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        })}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl border-2 border-dashed border-gray-600/50">
                            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-white mb-2">No attendance records found</p>
                            <p className="text-base text-gray-300">Please enter username, select month and year, then click "View Attendance" to load data.</p>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white flex items-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(147, 51, 234, 0.5)' }}>
                        Attendance Management
                    </h2>
                    <p className="text-gray-200 mt-1 text-lg">Manage employee attendance records</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeView === 'add' ? 'primary' : 'secondary'}
                    onClick={() => setActiveView('add')}
                    className={activeView === 'add' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}
                >
                    Add Attendance
                </Button>
                <Button
                    variant={activeView === 'all' ? 'primary' : 'secondary'}
                    onClick={() => setActiveView('all')}
                    className={activeView === 'all' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''}
                >
                    View All Summary
                </Button>
                <Button
                    variant={activeView === 'individual' ? 'primary' : 'secondary'}
                    onClick={() => setActiveView('individual')}
                    className={activeView === 'individual' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : ''}
                >
                    View Individual
                </Button>
            </div>

            {/* Render Active View */}
            {activeView === 'add' && renderAddAttendance()}
            {activeView === 'all' && renderViewAllAttendance()}
            {activeView === 'individual' && renderViewIndividualAttendance()}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-gray-300 text-lg">
                        Are you sure you want to delete this attendance record? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            onClick={() => setDeleteModalOpen(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AttendanceManagement;

