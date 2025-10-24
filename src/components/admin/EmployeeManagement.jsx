import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import Table from '../ui/Table';
import Badge from '../ui/Badge';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, employee: null });
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

            <Card>
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
                        {employees.map((employee) => (
                            <Table.Row key={employee.id}>
                                <Table.Cell>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {employee.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.username}
                                            </div>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>{employee.email}</Table.Cell>
                                <Table.Cell>{employee.designation}</Table.Cell>
                                <Table.Cell>
                                    <Badge variant={employee.role === 'ADMIN' ? 'danger' : 'success'}>
                                        {employee.role}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setDeleteModal({ isOpen: true, employee })}
                                    >
                                        Delete
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
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
        </div>
    );
};

export default EmployeeManagement;
