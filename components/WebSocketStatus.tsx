'use client'

import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { WifiOff, Wifi } from 'lucide-react';

export const WebSocketStatus: React.FC = () => {
  const socket = useWebSocket();
  const isConnected = socket?.connected;

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">Disconnected</span>
        </>
      )}
    </div>
  );
};