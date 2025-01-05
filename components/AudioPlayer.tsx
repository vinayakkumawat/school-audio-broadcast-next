'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { AlertCircle, Clock } from 'lucide-react';
import { findNextAudioToPlay } from '../utils/queueHelpers';
import { getQueueName } from '../utils/queueHelpers';
import { Audio } from '../types';

const DELAY_BETWEEN_PLAYS = 30; // 30 seconds

interface DelayInfo {
  timeLeft: number;
  timerId: NodeJS.Timeout;
  queueNumber: number;
  playCount: number;
}

interface AudioDelays {
  [audioId: string]: DelayInfo;
}

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playCountRef = useRef<{ [key: string]: number }>({});
  const delaysRef = useRef<AudioDelays>({});
  const [delays, setDelays] = useState<AudioDelays>({});
  const loadingRef = useRef<boolean>(false);

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

  const isAudioInQueues = useCallback((audioId: string) => {
    return [...firstQueue, ...secondQueue, ...thirdQueue].some(audio => audio.id === audioId);
  }, [firstQueue, secondQueue, thirdQueue]);

  const clearDelayForAudio = useCallback((audioId: string) => {
    if (delaysRef.current[audioId]) {
      clearInterval(delaysRef.current[audioId].timerId);
      delete delaysRef.current[audioId];
      setDelays(prev => {
        const newDelays = { ...prev };
        delete newDelays[audioId];
        return newDelays;
      });
    }
  }, []);

  const startDelayForAudio = useCallback((audio: Audio, onComplete: () => void) => {
    clearDelayForAudio(audio.id);

    const startDelay = DELAY_BETWEEN_PLAYS;
    const playCount = playCountRef.current[audio.id] || 0;

    const timer = setInterval(() => {
      // First check if the delay exists
      const currentDelay = delaysRef.current[audio.id];

      if (!currentDelay) {
        clearInterval(timer);
        return;
      }

      // Safely update the timeLeft
      delaysRef.current[audio.id].timeLeft -= 1;

      // Only update state if the delay still exists
      setDelays(prev => ({
        ...prev,
        [audio.id]: {
          ...currentDelay,
          timeLeft: currentDelay.timeLeft
        }
      }));

      // When delay is complete, clear it and check if we can play
      if (currentDelay.timeLeft <= 0) {
        clearDelayForAudio(audio.id);
        if (isAudioInQueues(audio.id)) {
          // Check if no other audio is currently playing
          if (!currentlyPlaying) {
            onComplete();
          }
        }
      }
    }, 1000);

    const delayInfo: DelayInfo = {
      timeLeft: startDelay,
      timerId: timer,
      queueNumber: audio.queue,
      playCount
    };

    delaysRef.current[audio.id] = delayInfo;
    setDelays(prev => ({ ...prev, [audio.id]: delayInfo }));
  }, [clearDelayForAudio, isAudioInQueues, currentlyPlaying]);

  const playAudio = useCallback(async (audio: Audio) => {
    if (!audioRef.current || !isAudioInQueues(audio.id) || loadingRef.current) return;

    try {
      loadingRef.current = true;

      if (!audio.url.startsWith('data:audio')) {
        setError('Invalid audio format');
        moveToNextQueue(audio);
        loadingRef.current = false;
        return;
      }

      // Clear any existing delays for this audio
      clearDelayForAudio(audio.id);

      // Reset the audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Set new source
      audioRef.current.src = audio.url;

      // Wait for the audio to be loaded
      await new Promise((resolve, reject) => {
        if (!audioRef.current) return reject(new Error('No audio element'));

        const onCanPlay = () => {
          audioRef.current?.removeEventListener('canplay', onCanPlay);
          resolve(null);
        };

        const onError = (e: Event) => {
          audioRef.current?.removeEventListener('error', onError);
          reject(new Error('Audio loading failed'));
        };

        audioRef.current.addEventListener('canplay', onCanPlay);
        audioRef.current.addEventListener('error', onError);
      });

      // Now play the audio
      await audioRef.current.play();
      setCurrentlyPlaying(audio);
      setIsPlaying(true);
      setError(null);
    } catch (error) {
      console.error('Audio playback error:', error);
      setError('Failed to play audio file');
      setIsPlaying(false);
      moveToNextQueue(audio);
    } finally {
      loadingRef.current = false;
    }
  }, [isAudioInQueues, moveToNextQueue, setCurrentlyPlaying, setError, setIsPlaying, clearDelayForAudio]);

  const handleEnded = useCallback(() => {
    if (currentlyPlaying) {
      if (!isAudioInQueues(currentlyPlaying.id)) {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
        return;
      }

      const currentCount = playCountRef.current[currentlyPlaying.id] || 0;

      if (currentCount < 1) {
        playCountRef.current[currentlyPlaying.id] = currentCount + 1;

        if (currentlyPlaying.queue > 1) {
          setCurrentlyPlaying(null);
          setIsPlaying(false);
          startDelayForAudio(currentlyPlaying, () => {
            // Check for higher priority audios before playing
            const higherPriorityAudio = findNextAudioToPlay(firstQueue, [], []);
            if (higherPriorityAudio) {
              playAudio(higherPriorityAudio);
            } else {
              playAudio(currentlyPlaying);
            }
          });
        } else {
          // Queue 1 plays immediately again
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
        }
      } else {
        delete playCountRef.current[currentlyPlaying.id];
        moveToNextQueue(currentlyPlaying);
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      }
    }
  }, [currentlyPlaying, moveToNextQueue, setCurrentlyPlaying, setIsPlaying, setError, isAudioInQueues, startDelayForAudio, playAudio]);

  const handleError = useCallback(() => {
    setError('Failed to play audio file');
    if (currentlyPlaying) {
      moveToNextQueue(currentlyPlaying);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  }, [currentlyPlaying, moveToNextQueue, setCurrentlyPlaying, setError, setIsPlaying]);

  useEffect(() => {
    // Clean expired audios every minute
    const cleanupInterval = setInterval(() => {
      cleanExpiredAudios();
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, [cleanExpiredAudios]);

  useEffect(() => {
    // If no audio is playing, start delays for all queue 2 and 3 audios
    const queue2and3 = [...secondQueue, ...thirdQueue];

    // Start delays for all audios that don't have delays yet
    queue2and3.forEach(audio => {
      if (!delays[audio.id]) {
        startDelayForAudio(audio, () => {
          // Only play if no other audio is currently playing
          if (!currentlyPlaying) {
            // Check for any queue 1 audio first
            const higherPriorityAudio = findNextAudioToPlay(firstQueue, [], []);
            if (higherPriorityAudio) {
              playAudio(higherPriorityAudio);
            } else {
              playAudio(audio);
            }
          }
        });
      }
    });

    // Handle queue 1 immediately if nothing is playing
    if (!currentlyPlaying) {
      const nextQueue1Audio = findNextAudioToPlay(firstQueue, [], []);
      if (nextQueue1Audio) {
        playAudio(nextQueue1Audio);
      }
    }
  }, [firstQueue, secondQueue, thirdQueue, currentlyPlaying, delays, startDelayForAudio, playAudio]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      Object.keys(delaysRef.current).forEach(clearDelayForAudio);
    };
  }, [clearDelayForAudio]);

  // Clean up if audio is removed
  useEffect(() => {
    Object.keys(delays).forEach(audioId => {
      if (!isAudioInQueues(audioId)) {
        clearDelayForAudio(audioId);
      }
    });
  }, [firstQueue, secondQueue, thirdQueue, clearDelayForAudio, isAudioInQueues]);

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
        <div className="mt-2 space-y-2">
          {currentlyPlaying && (
            <div className="text-sm text-gray-500">
              Now playing: Audio {currentlyPlaying.id} ({getQueueName(currentlyPlaying.queue)})
              <span className="ml-2">
                (Play {(playCountRef.current[currentlyPlaying.id] || 0) + 1}/2)
              </span>
            </div>
          )}
          {Object.keys(delays).length > 0 && <div className='max-h-20 overflow-scroll'>
            {Object.entries(delays).map(([audioId, delay]) => (
              <div key={audioId} className="flex items-center text-sm text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                Audio {audioId} ({getQueueName(delay.queueNumber)}) waiting: {delay.timeLeft}s
              </div>
            ))}
          </div>}

        </div>
      </div>
    </div>
  );
};