'use client'

import React, { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { AlertCircle, Clock, Play, Trash2 } from 'lucide-react';
import { Audio } from '../types';

const formatTimeLeft = (status: string, nextPlayTime: number | null): string => {
  if (!nextPlayTime) return '';
  if (status !== 'WAITING_FIRST' && status !== 'WAITING_SECOND' && status !== 'READY_TO_PLAY') return '';
  
  const timeLeft = Math.max(0, Math.ceil((nextPlayTime - Date.now()) / 1000));
  return `${timeLeft}s`;
};

const getStatusDisplay = (status: string, playIndex?: number): string => {
  // For new playback logic, use playIndex to show position
  if (status === 'READY_TO_PLAY' && playIndex) {
    if (playIndex <= 2) {
      return 'Immediate Play';
    } else {
      return `Scheduled Play #${playIndex}`;
    }
  }

  // Legacy status display
  switch (status) {
    case 'FIRST_BURST':
      return 'First Play';
    case 'WAITING_FIRST':
      return 'Waiting (1st)';
    case 'SECOND_BURST':
      return 'Second Play';
    case 'WAITING_SECOND':
      return 'Waiting (2nd)';
    case 'FINAL_PLAY':
      return 'Final Play';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
};

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    audioList,
    currentlyPlaying,
    setCurrentlyPlaying,
    error,
    setError,
    setIsPlaying,
    updateAudioStatus,
    getNextAudioToPlay,
    removeAudio,
    setUserInteracted,
    userInteracted
  } = useAudioStore();

  const playAudio = useCallback(async (audio: Audio) => {
    console.log('Attempting to play audio', {
      id: audio.id,
      status: audio.status,
      playCount: audio.playCount,
      userInteracted
    });

    if (!audioRef.current || loadingRef.current || !userInteracted) {
      console.log('Cannot play: audio element not ready or loading or no user interaction', { 
        hasAudioRef: !!audioRef.current, 
        isLoading: loadingRef.current,
        hasUserInteracted: userInteracted
      });
      return;
    }

    try {
      loadingRef.current = true;
      console.log('Starting to play audio:', { id: audio.id, status: audio.status });

      if (!audio.url) {
        console.error('Audio URL is missing');
        setError('Audio URL is missing');
        removeAudio(audio.id);
        return;
      }

      // Reset the audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      console.log('Setting audio source:', audio.url.substring(0, 50) + '...');
      audioRef.current.src = audio.url;

      // Set volume
      audioRef.current.volume = 1;

      // Wait for the audio to be loaded
      await new Promise((resolve, reject) => {
        if (!audioRef.current) return reject(new Error('No audio element'));

        const onCanPlay = () => {
          console.log('Audio can play now');
          audioRef.current?.removeEventListener('canplay', onCanPlay);
          resolve(null);
        };

        const onError = (e: Event) => {
          const audioElement = e.target as HTMLAudioElement;
          console.error('Audio loading error:', {
            error: audioElement.error,
            networkState: audioElement.networkState,
            readyState: audioElement.readyState
          });
          audioRef.current?.removeEventListener('error', onError);
          reject(new Error('Audio loading failed'));
        };

        audioRef.current.addEventListener('canplay', onCanPlay);
        audioRef.current.addEventListener('error', onError);
      });

      console.log('Attempting to play audio');
      const playPromise = audioRef.current.play();
      await playPromise;
      
      console.log('Audio started playing successfully');
      setCurrentlyPlaying(audio);
      setIsPlaying(true);
      setError(null);

    } catch (error) {
      console.error('Audio playback error:', error);
      setError('Failed to play audio file');
      setIsPlaying(false);
      removeAudio(audio.id);
    } finally {
      loadingRef.current = false;
    }
  }, [userInteracted, setCurrentlyPlaying, setError, setIsPlaying, removeAudio]);

  const handleEnded = useCallback(() => {
    console.log('Audio ended details', {
      currentlyPlaying,
      audioList,
      userInteracted
    });

    if (currentlyPlaying) {
      const prevPlayCount = currentlyPlaying.playCount;
      const prevStatus = currentlyPlaying.status;
      
      // Update the status first
      updateAudioStatus(currentlyPlaying.id);
      
      // Get the updated audio to check its new state
      const updatedAudio = audioList.find(a => a.id === currentlyPlaying.id);
      console.log('Audio state after update:', {
        id: currentlyPlaying.id,
        prevPlayCount,
        prevStatus,
        newPlayCount: updatedAudio?.playCount,
        newStatus: updatedAudio?.status
      });
      
      // Clear currently playing and isPlaying state
      setCurrentlyPlaying(null);
      setIsPlaying(false);

      // If the audio is not completed, try to play the next one immediately
      if (updatedAudio && updatedAudio.status !== 'COMPLETED') {
        const nextAudio = getNextAudioToPlay();
        if (nextAudio) {
          console.log('Playing next audio after ended:', {
            id: nextAudio.id,
            status: nextAudio.status,
            playCount: nextAudio.playCount
          });
          playAudio(nextAudio);
        }
      }
    }
  }, [currentlyPlaying, audioList, updateAudioStatus, setCurrentlyPlaying, setIsPlaying, getNextAudioToPlay, playAudio]);

  const handleError = () => {
    const audioElement = audioRef.current;
    console.error('Audio error occurred:', {
      error: audioElement?.error,
      networkState: audioElement?.networkState,
      readyState: audioElement?.readyState
    });
    
    setError('Failed to play audio file');
    if (currentlyPlaying) {
      removeAudio(currentlyPlaying.id);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  };

  // Check for next audio to play periodically
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!currentlyPlaying && userInteracted) {
        const nextAudio = getNextAudioToPlay();
        if (nextAudio) {
          console.log('Found next audio to play:', { 
            id: nextAudio.id, 
            status: nextAudio.status,
            playCount: nextAudio.playCount
          });
          playAudio(nextAudio);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [userInteracted, currentlyPlaying, getNextAudioToPlay, playAudio]);

  // Remove completed audios
  useEffect(() => {
    const completedBaseIds = new Set<string>();
    
    audioList.forEach(audio => {
      if (audio.status === 'COMPLETED') {
        // Get the base ID without the position suffix
        const baseId = audio.id.split('-')[0];
        console.log('Completed audio:', audio.id, 'Base ID:', baseId);
        completedBaseIds.add(baseId);
      }
    });
    
    // Only remove once for each base ID
    completedBaseIds.forEach(baseId => {
      console.log('Removing completed audio group:', baseId);
      removeAudio(baseId);
    });
  }, [audioList, removeAudio]);

  if (!userInteracted) {
    return (
      <div className='flex items-center justify-center w-full bg-white border-t border-gray-200 p-4'>
        <button
          onClick={() => {
            console.log('User interaction received');
            setUserInteracted();
          }}
          className="p-2 text-sm text-gray-800 border border-gray-300 rounded-full"
        >
          Click here to Enable Audio
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-t border-gray-200">
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
          style={{ display: 'none' }}
        />
        <div className="mt-2 space-y-2">
          {currentlyPlaying && (
            <div className="text-sm text-gray-500">
              Now playing: Audio {currentlyPlaying.id.split('-')[0]} 
              {currentlyPlaying.playIndex 
                ? `(${getStatusDisplay(currentlyPlaying.status, currentlyPlaying.playIndex)}, ${currentlyPlaying.playIndex}/6)` 
                : `(${getStatusDisplay(currentlyPlaying.status)}, ${currentlyPlaying.playCount}/5 plays)`
              }
            </div>
          )}
          <div className='max-h-20 overflow-scroll'>
            {audioList
              .filter(audio => 
                (audio.status === 'WAITING_FIRST' || audio.status === 'WAITING_SECOND') || 
                (audio.status === 'READY_TO_PLAY' && audio.nextPlayTime)
              )
              .map((audio) => (
                <div key={audio.id} className="flex items-center text-sm text-yellow-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Audio {audio.id.split('-')[0]} ({getStatusDisplay(audio.status, audio.playIndex)}) waiting: {formatTimeLeft(audio.status, audio.nextPlayTime)}
                </div>
              ))}
          </div>

          <div className="space-y-2">
            {audioList
              .filter(audio => audio.status !== 'COMPLETED')
              .map((audio) => (
                <div
                  key={audio.id}
                  className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex items-center space-x-4">
                    <Play className={`w-5 h-5 ${currentlyPlaying?.id === audio.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <div>
                      <p className="font-medium">Audio {audio.id.split('-')[0]}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>
                          {getStatusDisplay(audio.status, audio.playIndex)} {audio.playIndex ? `(${audio.playIndex}/6)` : `(${audio.playCount}/5 plays)`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAudio(audio.id.split('-')[0])}
                    className="p-2 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};