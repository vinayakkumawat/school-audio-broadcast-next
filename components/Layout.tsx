'use client'

import React, { useState, PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { WebSocketStatus } from './WebSocketStatus';
import { AdminProfile } from './AdminProfile';
import { Settings, LayoutDashboard, Users, TestTube } from 'lucide-react';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();

  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const admin = useAuthStore((state) => state.admin);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">Audio Management System</h1>

              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" legacyBehavior>
                  <a
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </a>
                </Link>

                <Link href="/users" legacyBehavior>
                  <a
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${pathname === '/users'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </a>
                </Link>

                <Link href="/testing" legacyBehavior>
                  <a
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${pathname === '/testing'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Testing
                  </a>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <WebSocketStatus />
              <button
                onClick={() => setShowAdminProfile(true)}
                className="flex items-center p-2 text-gray-400 hover:text-gray-500"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span className="text-sm">{admin?.username}</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children} {/* This will render the child components or pages */}
      </main>

      {showAdminProfile && (
        <AdminProfile onClose={() => setShowAdminProfile(false)} />
      )}
    </div>
  );
};