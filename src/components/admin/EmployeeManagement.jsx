import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { authService } from '../../services/auth.service';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Briefcase,
    Shield,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Building2,
    Save,
    X
} from 'lucide-react';

const EmployeeManagement = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, employee: null });
    const [editModal, setEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        username: '',
        password: '',
        email: '',
        designation: '',
        role: 'USER'
    });

    // Fetch employees
    const { data: employeesRes, isLoading, error: fetchError } = useQuery({
        queryKey: ['employees'],
        queryFn: adminService.getEmployees
    });

    const employees = employeesRes?.data || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            showSuccess('Employee deleted successfully');
            setDeleteModal({ isOpen: false, employee: null });
        },
        onError: (error) => {
            console.error('Delete operation failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete employee';
            showError(errorMessage);
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, userData }) => adminService.updateUser(id, userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            showSuccess('Employee updated successfully');
            setEditModal(false);
            setEditingEmployee(null);
        },
        onError: (error) => {
            console.error('Update operation failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update employee';
            showError(errorMessage);
        }
    });

    const handleDeleteEmployee = async () => {
        if (deleteModal.employee) {
            deleteMutation.mutate(deleteModal.employee.id);
        }
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee({ ...employee });
        setEditModal(true);
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        const userData = {
            username: editingEmployee.username,
            password: editingEmployee.password,
            email: editingEmployee.email,
            designation: editingEmployee.designation,
            role: editingEmployee.role
        };
        updateMutation.mutate({ id: editingEmployee.id, userData });
    };

    const handleInputChange = (e) => {
        setEditingEmployee({
            ...editingEmployee,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateInputChange = (e) => {
        setNewEmployee({
            ...newEmployee,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await authService.signup(newEmployee);
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            showSuccess('Employee created successfully');
            setCreateModal(false);
            setNewEmployee({
                username: '',
                password: '',
                email: '',
                designation: '',
                role: 'USER'
            });
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create employee');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-indigo-500/10">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                        <Users className="mr-3 text-indigo-400" size={28} />
                        Employee Management
                    </h2>
                    <p className="text-slate-400 text-sm">Manage team members, roles, and access.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center px-4 py-2 bg-[#0f172a]/40 rounded-xl border border-indigo-500/10 backdrop-blur-sm">
                        <Users className="text-indigo-400 mr-2" size={18} />
                        <span className="text-slate-300 font-medium mr-2">Total:</span>
                        <span className="text-white font-bold bg-indigo-500/20 px-2 py-0.5 rounded text-sm border border-indigo-500/30">
                            {employees.length}
                        </span>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setCreateModal(true)}
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 border-0"
                    >
                        <UserPlus size={18} className="mr-2" />
                        Add Member
                    </Button>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center text-red-400">
                    <XCircle className="mr-2" size={20} />
                    Failed to fetch employees. Please try again later.
                </div>
            )}

            {/* Main Content Card */}
            <Card className="border-0 bg-[#0f172a]/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="!divide-white/5">
                        <Table.Header className="!bg-white/5">
                            <tr className="!border-b !border-white/5">
                                <Table.Cell header className="!text-indigo-200 !font-semibold !text-sm !py-4 !pl-6 !uppercase !tracking-wider">Employee Details</Table.Cell>
                                <Table.Cell header className="!text-indigo-200 !font-semibold !text-sm !py-4 !uppercase !tracking-wider">Contact</Table.Cell>
                                <Table.Cell header className="!text-indigo-200 !font-semibold !text-sm !py-4 !uppercase !tracking-wider">Role & Designation</Table.Cell>
                                <Table.Cell header className="!text-indigo-200 !font-semibold !text-sm !py-4 !pr-6 !text-right !uppercase !tracking-wider">Actions</Table.Cell>
                            </tr>
                        </Table.Header>
                        <Table.Body className="!bg-transparent !divide-white/5">
                            {employees.map((employee, index) => (
                                <Table.Row
                                    key={employee.id}
                                    className="!bg-transparent hover:!bg-white/5 transition-colors duration-200 !border-b !border-white/5 last:!border-0"
                                >
                                    <Table.Cell className="!py-4 !pl-6 !text-gray-300">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mr-4 group-hover:scale-110 transition-transform duration-300 !text-xl">
                                                {employee.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors !text-base">
                                                    {employee.username}
                                                </div>
                                                <div className="text-sm text-slate-500 font-mono mt-0.5">
                                                    ID: #{employee.id}
                                                </div>
                                            </div>
                                        </div>
                                    </Table.Cell>

                                    <Table.Cell className="!py-4 !text-gray-300 !text-sm">
                                        <div className="flex items-center text-slate-300">
                                            <Mail size={18} className="mr-2 text-slate-500" />
                                            {employee.email}
                                        </div>
                                    </Table.Cell>

                                    <Table.Cell className="!py-4 !text-gray-300 !text-sm">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center font-medium text-white">
                                                <Briefcase size={18} className="mr-2 text-indigo-400" />
                                                {employee.designation || 'Not Specified'}
                                            </div>
                                            <div className="flex items-center">
                                                <Shield size={18} className={`mr-2 ${employee.role === 'ADMIN' ? 'text-emerald-400' : 'text-slate-500'}`} />
                                                <Badge
                                                    variant={employee.role === 'ADMIN' ? 'success' : 'neutral'}
                                                    className={`${employee.role === 'ADMIN'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-slate-700/30 text-slate-300 border-slate-600/30'
                                                        } border !text-sm !px-2.5 !py-1`}
                                                >
                                                    {employee.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Table.Cell>

                                    <Table.Cell className="!py-4 !pr-6 !text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditEmployee(employee)}
                                                className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/20 transition-all font-medium flex items-center"
                                                title="Edit Employee"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, employee })}
                                                disabled={deleteMutation.isLoading && deleteModal.employee?.id === employee.id}
                                                className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all font-medium flex items-center"
                                                title="Delete Employee"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                            {employees.length === 0 && (
                                <tr className="!border-b !border-white/5">
                                    <td colSpan="4" className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Users size={48} className="text-slate-600 mb-4" />
                                            <p className="text-lg font-medium">No employees found</p>
                                            <p className="text-sm">Get started by adding a new team member.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
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
                                loading={deleteMutation.isLoading}
                                disabled={deleteMutation.isLoading}
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
                                <label className="block text-sm font-medium text-white mb-2">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={editingEmployee.role || 'USER'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white transition-all duration-200 text-sm"
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
                                    loading={updateMutation.isLoading}
                                    disabled={updateMutation.isLoading}
                                    className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md bg-gradient-to-r from-blue-500 to-indigo-600"
                                >
                                    Update Employee
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            {/* Create Employee Modal */}
            <Modal
                isOpen={createModal}
                onClose={() => setCreateModal(false)}
                title="Create New User"
                size="lg"
            >
                <div className="bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-blue-500/30">
                    <form onSubmit={handleCreateUser} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                <Input
                                    label="Username"
                                    name="username"
                                    value={newEmployee.username}
                                    onChange={handleCreateInputChange}
                                    required
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={newEmployee.password}
                                    onChange={handleCreateInputChange}
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
                                value={newEmployee.email}
                                onChange={handleCreateInputChange}
                                required
                                placeholder="Enter email"
                            />
                        </div>

                        <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                            <Input
                                label="Designation"
                                name="designation"
                                value={newEmployee.designation}
                                onChange={handleCreateInputChange}
                                required
                                placeholder="e.g., Software Developer, Manager"
                            />
                        </div>

                        <div className="transform transition-all duration-200 ease-in-out hover:scale-105">
                            <label className="block text-sm font-medium text-white mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={newEmployee.role}
                                onChange={handleCreateInputChange}
                                className="w-full px-4 py-2.5 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800/50 text-white transition-all duration-200 text-sm"
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
                                onClick={() => setCreateModal(false)}
                                className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md bg-gradient-to-r from-blue-500 to-indigo-600"
                            >
                                Create User
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;
