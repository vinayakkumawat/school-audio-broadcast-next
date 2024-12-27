'use client'

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import { useUserStore } from '../store/useUserStore';
import { Plus } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <UserList users={users} onEdit={handleEdit} />

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};