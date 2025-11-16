import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
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
    
    // View Individual Attendance State
    const [individualAttendance, setIndividualAttendance] = useState(null);
    const [individualUsername, setIndividualUsername] = useState('');
    const [individualMonth, setIndividualMonth] = useState(new Date().getMonth() + 1);
    const [individualYear, setIndividualYear] = useState(new Date().getFullYear());
    
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
                if (!dateTimeString) return '';
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

        try {
            const response = await adminService.getAttendanceSummary(summaryMonth, summaryYear);
            setAllSummary(response.data || []);
            if ((response.data || []).length === 0) {
                showInfo(`No attendance records found for ${summaryMonth}/${summaryYear}`);
            } else {
                showSuccess(`Found ${response.data.length} employee attendance records`);
            }
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
            <Card className="transition-all duration-200 ease-in-out hover:shadow-xl bg-white/80 backdrop-blur-xl border border-white/30">
                <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        Add Attendance
                    </h3>
                </div>
                <div className="p-6 bg-white/30 backdrop-blur-sm">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleAddAttendance} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee Username *
                            </label>
                            <select
                                value={attendanceForm.employeeUsername}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, employeeUsername: e.target.value })}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.username}>
                                        {emp.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Punch In *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={attendanceForm.punchIn}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, punchIn: e.target.value })}
                                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Punch Out *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={attendanceForm.punchOut}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, punchOut: e.target.value })}
                                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment
                            </label>
                            <textarea
                                value={attendanceForm.comment}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, comment: e.target.value })}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                                rows="3"
                                placeholder="e.g., Worked Full day, Worked Half day"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                loading={loading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600"
                            >
                                Add Attendance
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    };

    const renderViewAllAttendance = () => {
        return (
            <Card className="transition-all duration-200 ease-in-out hover:shadow-xl bg-white/80 backdrop-blur-xl border border-white/30">
                <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-green-50/50 to-emerald-50/50 backdrop-blur-sm">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        View All Users Attendance Summary
                    </h3>
                </div>
                <div className="p-6 bg-white/30 backdrop-blur-sm">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <select
                                value={summaryMonth}
                                onChange={(e) => setSummaryMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <input
                                type="number"
                                value={summaryYear}
                                onChange={(e) => setSummaryYear(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                                min="2020"
                                max="2100"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleViewAllAttendance}
                                disabled={loading}
                                loading={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                            >
                                View Summary
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : allSummary.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Header>
                                    <tr className="bg-white/20 backdrop-blur-sm">
                                        <Table.Cell header>Employee Username</Table.Cell>
                                        <Table.Cell header>Month</Table.Cell>
                                        <Table.Cell header>Year</Table.Cell>
                                        <Table.Cell header>Days Present</Table.Cell>
                                    </tr>
                                </Table.Header>
                                <Table.Body>
                                    {allSummary.map((summary, index) => (
                                        <Table.Row key={index} className="hover:bg-white/30">
                                            <Table.Cell className="font-medium">
                                                {summary.employeeUsername}
                                            </Table.Cell>
                                            <Table.Cell>{summary.month}</Table.Cell>
                                            <Table.Cell>{summary.year}</Table.Cell>
                                            <Table.Cell>
                                                <Badge variant="success">{summary.daysPresent} days</Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No attendance records found. Please select month and year and click "View Summary".</p>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const renderViewIndividualAttendance = () => {
        return (
            <Card className="transition-all duration-200 ease-in-out hover:shadow-xl bg-white/80 backdrop-blur-xl border border-white/30">
                <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 backdrop-blur-sm">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        View Individual User Attendance
                    </h3>
                </div>
                <div className="p-6 bg-white/30 backdrop-blur-sm">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee Username *
                            </label>
                            <select
                                value={individualUsername}
                                onChange={(e) => setIndividualUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.username}>
                                        {emp.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <select
                                value={individualMonth}
                                onChange={(e) => setIndividualMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <input
                                type="number"
                                value={individualYear}
                                onChange={(e) => setIndividualYear(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                                min="2020"
                                max="2100"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleViewIndividualAttendance}
                                disabled={loading}
                                loading={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                            >
                                View Attendance
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : individualAttendance && individualAttendance.attendances && Array.isArray(individualAttendance.attendances) && individualAttendance.attendances.length > 0 ? (
                        <div>
                            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-lg border border-purple-200/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1 text-lg">
                                            Attendance Records for: <span className="text-purple-600">{individualAttendance.employee || individualUsername}</span>
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Period: {individualAttendance.month ? new Date(individualAttendance.year, individualAttendance.month - 1).toLocaleString('default', { month: 'long' }) : new Date(individualYear, individualMonth - 1).toLocaleString('default', { month: 'long' })} {individualAttendance.year || individualYear}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {individualAttendance.attendances.length}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            Total Records
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <Table>
                                    <Table.Header>
                                        <tr className="bg-white/20 backdrop-blur-sm">
                                            <Table.Cell header>Day</Table.Cell>
                                            <Table.Cell header>Month</Table.Cell>
                                            <Table.Cell header>Year</Table.Cell>
                                            <Table.Cell header>Punch In</Table.Cell>
                                            <Table.Cell header>Punch Out</Table.Cell>
                                            <Table.Cell header>Comment</Table.Cell>
                                        </tr>
                                    </Table.Header>
                                    <Table.Body>
                                        {individualAttendance.attendances.map((attendance, index) => {
                                            // New API structure: { day, punchIn: "HH:MM", punchOut: "HH:MM" }
                                            // Get month and year from top-level response
                                            const month = individualAttendance.month || individualMonth;
                                            const year = individualAttendance.year || individualYear;
                                            const day = attendance.day;
                                            
                                            // Format month name
                                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                                               'July', 'August', 'September', 'October', 'November', 'December'];
                                            const monthName = monthNames[month - 1] || 'N/A';
                                            
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
                                            
                                            return (
                                                <Table.Row key={index} className="hover:bg-white/30">
                                                    <Table.Cell className="font-medium">
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-2xl font-bold text-gray-800">
                                                                {day}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Day</div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-lg font-semibold text-gray-700">
                                                                {monthName}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Month</div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-lg font-semibold text-gray-700">
                                                                {year}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Year</div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-200/30">
                                                            <div className="text-xs text-blue-700 font-medium mb-1 uppercase">
                                                                Punch In
                                                            </div>
                                                            <div className="text-sm font-bold text-blue-600">
                                                                {punchInTime.formatted}
                                                            </div>
                                                            {punchInTime.time24 && punchInTime.time24 !== 'N/A' && (
                                                                <div className="text-xs text-blue-500 mt-1">
                                                                    {punchInTime.time24} (24h)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="bg-green-50/50 px-3 py-2 rounded-lg border border-green-200/30">
                                                            <div className="text-xs text-green-700 font-medium mb-1 uppercase">
                                                                Punch Out
                                                            </div>
                                                            <div className="text-sm font-bold text-green-600">
                                                                {punchOutTime.formatted}
                                                            </div>
                                                            {punchOutTime.time24 && punchOutTime.time24 !== 'N/A' && (
                                                                <div className="text-xs text-green-500 mt-1">
                                                                    {punchOutTime.time24} (24h)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-200/30">
                                                            <div className="text-xs text-gray-700 font-medium mb-1 uppercase">
                                                                Comment
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                {attendance.comment || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        })}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No attendance records found. Please enter username, select month and year, then click "View Attendance".</p>
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
                    <h2 className="text-3xl font-bold text-white flex items-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(147, 51, 234, 0.5)' }}>
                        Attendance Management
                    </h2>
                    <p className="text-gray-200 mt-1">Manage employee attendance records</p>
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
        </div>
    );
};

export default AttendanceManagement;

