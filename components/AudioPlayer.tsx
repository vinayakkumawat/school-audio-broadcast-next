'use client'

import React, { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { AlertCircle } from 'lucide-react';
import { findNextAudioToPlay } from '../utils/queueHelpers';
import { getQueueName } from '../utils/queueHelpers';

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    firstQueue,
    secondQueue,
    thirdQueue,
    moveToNextQueue,
    currentlyPlaying,
    setCurrentlyPlaying,
    error,
    setError,
    isPlaying,
    setIsPlaying,
    cleanExpiredAudios,
  } = useAudioStore();

  useEffect(() => {
    // Clean expired audios every minute
    const cleanupInterval = setInterval(() => {
      cleanExpiredAudios();
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, [cleanExpiredAudios]);

  useEffect(() => {
    const nextAudio = !currentlyPlaying && findNextAudioToPlay(firstQueue, secondQueue, thirdQueue);
    
    if (nextAudio && audioRef.current) {
      try {
        // Handle base64 audio data
        if (nextAudio.url.startsWith('data:audio')) {
          audioRef.current.src = nextAudio.url;
        } else {
          setError('Invalid audio format');
          moveToNextQueue(nextAudio);
          return;
        }

        audioRef.current.play()
          .then(() => {
            setCurrentlyPlaying(nextAudio);
            setIsPlaying(true);
            setError(null);
          })
          .catch((error) => {
            console.error('Audio playback error:', error);
            setError('Failed to play audio file');
            setIsPlaying(false);
            moveToNextQueue(nextAudio);
          });
      } catch (error) {
        console.error('Audio setup error:', error);
        setError('Audio playback error');
        setIsPlaying(false);
        moveToNextQueue(nextAudio);
      }
    }
  }, [firstQueue, secondQueue, thirdQueue, currentlyPlaying, setCurrentlyPlaying, setError, moveToNextQueue, setIsPlaying]);

  const handleEnded = useCallback(() => {
    if (currentlyPlaying) {
      moveToNextQueue(currentlyPlaying);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  }, [currentlyPlaying, moveToNextQueue, setCurrentlyPlaying, setIsPlaying]);

  const handleError = useCallback(() => {
    setError('Failed to play audio file');
    if (currentlyPlaying) {
      moveToNextQueue(currentlyPlaying);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  }, [currentlyPlaying, moveToNextQueue, setCurrentlyPlaying, setError, setIsPlaying]);

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200">
      {error && (
        <div className="bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      <div className="p-4">
        <audio
          ref={audioRef}
          onEnded={handleEnded}
          onError={handleError}
          controls
          className="w-full"
        />
        {currentlyPlaying && (
          <div className="mt-2 text-sm text-gray-500">
            Now playing: Audio {currentlyPlaying.id} ({getQueueName(currentlyPlaying.queue)})
          </div>
        )}
      </div>
    </div>
  );
};