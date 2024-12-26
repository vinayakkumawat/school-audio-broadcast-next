import React, { useState, useRef } from 'react';
import { Mic, Square, AlertCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNotification } from '../hooks/useNotification';
import { v4 as uuidv4 } from 'uuid';

interface VoiceRecorderProps {
  userId: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const socket = useWebSocket();
  const { showSuccess, showError } = useNotification();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          
          if (socket?.connected) {
            const audioData = {
              id: uuidv4(),
              userId,
              url: base64Audio,
              createdAt: new Date().toISOString(),
              queue: 1,
              played: false,
            };

            socket.emit('new_audio', audioData);
            showSuccess('Audio recorded and sent successfully');
          } else {
            showError('WebSocket connection lost. Please try again.');
          }
        };
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to access microphone. Please ensure microphone permissions are granted.';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="ml-2 text-sm text-gray-600">Recording...</span>
        </div>
      )}
    </div>
  );
};