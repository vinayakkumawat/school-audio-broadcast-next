'use client'

import React from 'react';
import { User } from '../types';
import { useUserStore } from '../store/useUserStore';
import { Edit, Trash2 } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onEdit }) => {
  const { deleteUser } = useUserStore();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id}>
            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {user.username}
                  </p>
                  <p className="ml-4 text-sm text-gray-500">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => onEdit(user)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="p-2 text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
        {users.length === 0 && (
          <li className="px-4 py-4 text-center text-gray-500 sm:px-6">
            No users found
          </li>
        )}
      </ul>
    </div>
  );
};