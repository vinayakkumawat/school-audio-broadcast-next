'use client'

import React, { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { AlertCircle } from 'lucide-react';
import { findNextAudioToPlay } from '../utils/queueHelpers';
import { getQueueName } from '../utils/queueHelpers';

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playCountRef = useRef<{ [key: string]: number }>({});

  const {
    firstQueue,
    secondQueue,
    thirdQueue,
    moveToNextQueue,
    currentlyPlaying,
    setCurrentlyPlaying,
    error,
    setError,
    setIsPlaying,
    cleanExpiredAudios,
    setUserInteracted,
    userInteracted
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
        // Initialize play count for new audio in first queue
        if (nextAudio.queue === 1 && !playCountRef.current[nextAudio.id]) {
          playCountRef.current[nextAudio.id] = 0;
        }

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
      // If audio is in first queue and hasn't played twice yet
      if (currentlyPlaying.queue === 1 && (playCountRef.current[currentlyPlaying.id] || 0) < 1) {
        // Increment play count
        playCountRef.current[currentlyPlaying.id] = (playCountRef.current[currentlyPlaying.id] || 0) + 1;
        
        // Play the same audio again
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play()
            .catch((error) => {
              console.error('Audio replay error:', error);
              setError('Failed to replay audio file');
              moveToNextQueue(currentlyPlaying);
              setCurrentlyPlaying(null);
              setIsPlaying(false);
            });
        }
      } else {
        // Clear play count and move to next queue
        delete playCountRef.current[currentlyPlaying.id];
        moveToNextQueue(currentlyPlaying);
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      }
    }
  }, [currentlyPlaying, moveToNextQueue, setCurrentlyPlaying, setIsPlaying, setError]);

  const handleError = useCallback(() => {
    setError('Failed to play audio file');
    if (currentlyPlaying) {
      moveToNextQueue(currentlyPlaying);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  }, [currentlyPlaying, moveToNextQueue, setCurrentlyPlaying, setError, setIsPlaying]);

  if (!userInteracted) {
    return (
      <div className='fixed flex items-center justify-center bottom-0 w-full bg-white border-t border-gray-200 p-4'>
        <button
          onClick={() => setUserInteracted()}
          className="p-2 text-sm text-gray-800 border border-gray-300 rounded-full"
        >
          Click here to Enable Audio
        </button>
      </div>
    );
  }

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
            {currentlyPlaying.queue === 1 && (
              <span className="ml-2">
                (Play {(playCountRef.current[currentlyPlaying.id] || 0) + 1}/2)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};