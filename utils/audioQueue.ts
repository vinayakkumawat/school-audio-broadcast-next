import { Audio } from '../types';

const EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

export const isAudioExpired = (audio: Audio): boolean => {
  const createdAt = new Date(audio.createdAt).getTime();
  const now = new Date().getTime();
  return now - createdAt >= EXPIRY_TIME;
};

export const getNextQueueNumber = (currentQueue: number): number | null => {
  if (currentQueue < 1 || currentQueue > 3) return null;
  return currentQueue < 3 ? currentQueue + 1 : null;
};

export const shouldRemoveAudio = (audio: Audio): boolean => {
  return isAudioExpired(audio) && audio.queue === 3;
};