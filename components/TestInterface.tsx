import React from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { TestUserAuth } from './TestUserAuth';
import { useTestUserStore } from '../store/useTestUserStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { LogOut } from 'lucide-react';

export const TestInterface: React.FC = () => {
  const { user, isAuthenticated, logout } = useTestUserStore();
  const socket = useWebSocket();

  if (!isAuthenticated || !user) {
    return <TestUserAuth />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Test Interface</h2>
          <p className="text-sm text-gray-500">Logged in as: {user.username}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-900"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-medium mb-4">Voice Recording</h3>
          <VoiceRecorder userId={user.id} />
        </section>

        <section>
          <h3 className="text-lg font-medium mb-4">WebSocket Status</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  socket?.connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="ml-2 text-sm text-gray-600">
                {socket?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};