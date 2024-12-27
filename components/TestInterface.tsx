'use client'

import React from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { useWebSocket } from '../hooks/useWebSocket';

export const TestInterface: React.FC = () => {
  const socket = useWebSocket();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Test Interface</h2>
        </div>
      </div>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-medium mb-4">Voice Recording</h3>
          <VoiceRecorder userId={"testing"} />
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