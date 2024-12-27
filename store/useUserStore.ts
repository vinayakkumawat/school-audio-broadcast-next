import { create } from 'zustand';
import { User } from '../types';
import { API_CONFIG } from '../config/api';

interface UserState {
  users: User[];
  fetchUsers: () => Promise<void>;
  createUser: (userData: { username: string; password: string }) => Promise<void>;
  updateUser: (user: User & { password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  
  fetchUsers: async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      const newUser = await response.json();
      set((state) => ({ users: [...state.users, newUser] }));
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (user) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      set((state) => ({
        users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
}));