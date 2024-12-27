import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL, WS_EVENTS } from '../config/websocket';
import { useAudioStore } from '../store/useAudioStore';
import { Audio } from '../types';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { addAudio, removeAudio } = useAudioStore();

  const connect = useCallback(() => {
    socketRef.current = io(WS_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }, []);

  const handleNewAudio = useCallback((audio: Audio) => {
    addAudio(audio);
  }, [addAudio]);

  const handleAudioRemoved = useCallback((audioId: string) => {
    removeAudio(audioId);
  }, [removeAudio]);

  useEffect(() => {
    connect();

    if (socketRef.current) {
      socketRef.current.on(WS_EVENTS.NEW_AUDIO, handleNewAudio);
      socketRef.current.on(WS_EVENTS.AUDIO_REMOVED, handleAudioRemoved);
      
      socketRef.current.on(WS_EVENTS.ERROR, (error) => {
        console.error('WebSocket error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(WS_EVENTS.NEW_AUDIO);
        socketRef.current.off(WS_EVENTS.AUDIO_REMOVED);
        socketRef.current.off(WS_EVENTS.ERROR);
      }
    };
  }, [connect, handleNewAudio, handleAudioRemoved]);

  return socketRef.current;
};