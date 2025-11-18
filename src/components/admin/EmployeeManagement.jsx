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

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, employee: null });
    const [editModal, setEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await adminService.getEmployees();
            setEmployees(response.data);
        } catch (err) {
            setError('Failed to fetch employees');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async () => {
        try {
            await adminService.deleteUser(deleteModal.employee.id);
            setEmployees(employees.filter(emp => emp.id !== deleteModal.employee.id));
            setDeleteModal({ isOpen: false, employee: null });
            showSuccess('Employee deleted successfully');
        } catch (err) {
            setError('Failed to delete employee');
            showError('Failed to delete employee');
            console.error(err);
        }
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee({ ...employee });
        setEditModal(true);
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        try {
            const userData = {
                username: editingEmployee.username,
                password: editingEmployee.password,
                email: editingEmployee.email,
                designation: editingEmployee.designation,
                role: editingEmployee.role
            };
            
            const response = await adminService.updateUser(editingEmployee.id, userData);
            
            // Update the employee in the list
            const updatedEmployees = employees.map(emp => 
                emp.id === editingEmployee.id ? { ...emp, ...response.data } : emp
            );
            setEmployees(updatedEmployees);
            setEditModal(false);
            setEditingEmployee(null);
            showSuccess('Employee updated successfully');
        } catch (err) {
            setError('Failed to update employee');
            showError('Failed to update employee');
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setEditingEmployee({
            ...editingEmployee,
            [e.target.name]: e.target.value
        });
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center">
                        Employee Management
                    </h2>
                    <p className="text-gray-300 mt-1">Manage your team members and their roles</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-base font-medium text-white bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-indigo-600/20 border border-blue-500/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                        Total: <span className="font-bold text-blue-400">{employees.length}</span> employees
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 border-l-4 border-red-500 rounded-lg p-4">
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            <Card className="transition-all duration-200 ease-in-out hover:shadow-xl backdrop-blur-xl border border-blue-500/30 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </div>
                        Employee Directory
                    </h3>
                </div>
                <div className="overflow-x-auto bg-gray-900/30 backdrop-blur-sm">
                    <Table>
                    <Table.Header>
                        <tr className="bg-gray-800/50 backdrop-blur-sm">
                            <Table.Cell header className="text-base font-bold text-white uppercase tracking-wider">Employee</Table.Cell>
                            <Table.Cell header className="text-base font-bold text-white uppercase tracking-wider">Email</Table.Cell>
                            <Table.Cell header className="text-base font-bold text-white uppercase tracking-wider">Designation</Table.Cell>
                            <Table.Cell header className="text-base font-bold text-white uppercase tracking-wider">Role</Table.Cell>
                            <Table.Cell header className="text-base font-bold text-white uppercase tracking-wider">Actions</Table.Cell>
                        </tr>
                    </Table.Header>
                    <Table.Body>
                        {employees.map((employee, index) => (
                            <Table.Row 
                                key={employee.id}
                                className="transition-all duration-200 ease-in-out hover:bg-gray-800/40 hover:shadow-md group border-b border-gray-700/50"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Table.Cell className="px-6 py-5">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 ease-in-out">
                                            <div className="w-6 h-6 bg-white rounded-sm"></div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-base font-bold text-white">
                                                {employee.username}
                                            </div>
                                            <div className="text-sm text-gray-300 bg-gray-800/50 px-2 py-1 rounded-md backdrop-blur-sm mt-1">
                                                ID: {employee.id}
                                            </div>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-5">
                                    <div className="text-base font-medium text-white bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-indigo-600/20 border border-blue-500/30 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:from-blue-600/30 group-hover:via-blue-500/25 group-hover:to-indigo-600/30 group-hover:scale-105 transition-all duration-200 ease-in-out">
                                        {employee.email}
                                    </div>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-5">
                                    <div className="text-base font-medium text-white bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-700/30 border border-gray-600/30 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:from-gray-700/40 group-hover:via-gray-600/30 group-hover:to-gray-700/40 group-hover:scale-105 transition-all duration-200 ease-in-out">
                                        {employee.designation}
                                    </div>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-5">
                                    <Badge 
                                        variant={employee.role === 'ADMIN' ? 'danger' : 'success'}
                                        className="transition-all duration-200 ease-in-out group-hover:scale-105 text-base font-bold px-3 py-1"
                                    >
                                        {employee.role}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-5">
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEditEmployee(employee)}
                                            className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md text-base font-medium px-4 py-2"
                                        >
                                             Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteModal({ isOpen: true, employee })}
                                            className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md text-base font-medium px-4 py-2"
                                        >
                                             Delete
                                        </Button>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                    </Table>
                </div>
            </Card>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, employee: null })}
                title="Delete Employee"
            >
                <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-red-500/30">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    Are you sure you want to delete <strong className="text-red-400">{deleteModal.employee?.username}</strong>?
                                </p>
                                <p className="text-sm text-gray-300 mt-1">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setDeleteModal({ isOpen: false, employee: null })}
                                className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteEmployee}
                                className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal
                isOpen={editModal}
                onClose={() => {
                    setEditModal(false);
                    setEditingEmployee(null);
                }}
                title="Edit Employee"
                size="lg"
            >
                {editingEmployee && (
                    <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-blue-500/30">
                        <form onSubmit={handleUpdateEmployee} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                    <Input
                                        label="Username"
                                        name="username"
                                        value={editingEmployee.username || ''}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                    <Input
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={editingEmployee.password || ''}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>
                            
                            <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={editingEmployee.email || ''}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter email"
                                />
                            </div>

                            <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                <Input
                                    label="Designation"
                                    name="designation"
                                    value={editingEmployee.designation || ''}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Software Developer, Manager"
                                />
                            </div>

                            <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                <label className="block text-sm font-semibold text-white mb-2 tracking-wide uppercase">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={editingEmployee.role || 'USER'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white transition-all duration-200 ease-in-out hover:shadow-md"
                                    required
                                >
                                    <option value="USER" className="bg-gray-800 text-white">USER</option>
                                    <option value="ADMIN" className="bg-gray-800 text-white">ADMIN</option>
                                </select>
                            </div>
                            
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setEditModal(false);
                                        setEditingEmployee(null);
                                    }}
                                    className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md bg-gradient-to-r from-blue-500 to-indigo-600"
                                >
                                    Update Employee
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeManagement;
