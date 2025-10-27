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
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
                <div className="text-sm text-gray-600">
                    Total: {employees.length} employees
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <Card className="transform transition-all duration-300 hover:shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        Employee Directory
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                    <Table.Header>
                        <tr>
                            <Table.Cell header>Employee</Table.Cell>
                            <Table.Cell header>Email</Table.Cell>
                            <Table.Cell header>Designation</Table.Cell>
                            <Table.Cell header>Role</Table.Cell>
                            <Table.Cell header>Actions</Table.Cell>
                        </tr>
                    </Table.Header>
                    <Table.Body>
                        {employees.map((employee, index) => (
                            <Table.Row 
                                key={employee.id}
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-gray-50"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <Table.Cell className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-110">
                                            {employee.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">
                                                {employee.username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {employee.id}
                                            </div>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{employee.email}</div>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{employee.designation}</div>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-4">
                                    <Badge 
                                        variant={employee.role === 'ADMIN' ? 'danger' : 'success'}
                                        className="transform transition-all duration-300 hover:scale-105"
                                    >
                                        {employee.role}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEditEmployee(employee)}
                                            className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                                        >
                                             Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteModal({ isOpen: true, employee })}
                                            className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
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
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{deleteModal.employee?.username}</strong>? 
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ isOpen: false, employee: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteEmployee}
                        >
                            Delete
                        </Button>
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
                    <form onSubmit={handleUpdateEmployee} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Username"
                                    name="username"
                                    value={editingEmployee.username || ''}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter username"
                                />
                            </div>
                            <div>
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
                        
                        <div>
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

                        <div>
                            <Input
                                label="Designation"
                                name="designation"
                                value={editingEmployee.designation || ''}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., Software Developer, Manager"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={editingEmployee.role || 'USER'}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
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
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md bg-gradient-to-r from-blue-500 to-blue-600"
                            >
                                Update Employee
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeManagement;
