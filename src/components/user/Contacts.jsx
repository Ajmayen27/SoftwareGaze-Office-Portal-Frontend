import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import Input from '../ui/Input';

const Contacts = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch contacts
    const { data: contactsRes, isLoading, error: fetchError } = useQuery({
        queryKey: ['contacts'],
        queryFn: userService.getAllUsers
    });

    const contacts = contactsRes?.data || [];

    const filteredContacts = contacts.filter(contact =>
        contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Team Contacts</h2>
                <div className="text-sm text-gray-600">
                    {filteredContacts.length} contacts
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Failed to fetch contacts. Please try again later.</p>
                </div>
            )}

            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredContacts.map((contact) => (
                            <div key={contact.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {contact.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="font-medium text-gray-900">{contact.username}</h3>
                                        <p className="text-sm text-gray-600">{contact.designation}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Email:</span> {contact.email}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Role:</span>
                                        <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${contact.role === 'ADMIN'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {contact.role}
                                        </span>
                                    </p>
                                </div>
                                <div className="mt-3 flex space-x-2">
                                    <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                        Message
                                    </button>
                                    <button className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                        Call
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Contacts;
