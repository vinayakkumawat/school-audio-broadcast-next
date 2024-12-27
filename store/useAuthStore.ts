import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_CONFIG } from '../config/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface Admin {
  id: string;
  username: string;
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    username?: string;
    currentPassword: string;
    newPassword?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          Cookies.set('auth-token', data.token, { expires: 7 }); // Set cookie
          set({
            token: data.token,
            admin: data.admin,
            isAuthenticated: true,
          });

          const router = useRouter();
          router.push('/dashboard');
        } catch (error) {
          throw new Error('Login failed');
        }
      },

      logout: () => {
        Cookies.remove('auth-token');
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        });
        
        const router = useRouter();
        router.push('/');
      },

      updateProfile: async (data) => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update profile');
          }

          if (data.username) {
            set((state) => ({
              admin: state.admin ? { ...state.admin, username: data.username || state.admin.username } : null,
            }));
          }
        } catch (error) {
          throw new Error('Profile update failed');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);