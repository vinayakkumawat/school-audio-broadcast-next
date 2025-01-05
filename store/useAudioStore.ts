import { create } from 'zustand';
import { Audio } from '../types';
import { isAudioExpired, getNextQueueNumber, shouldRemoveAudio } from '../utils/audioQueue';

interface AudioState {
  firstQueue: Audio[];
  secondQueue: Audio[];
  thirdQueue: Audio[];
  currentlyPlaying: Audio | null;
  error: string | null;
  isPlaying: boolean;
  addAudio: (audio: Audio) => void;
  removeAudio: (audioId: string) => void;
  moveToNextQueue: (audio: Audio) => void;
  setCurrentlyPlaying: (audio: Audio | null) => void;
  setError: (error: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  cleanExpiredAudios: () => void;
  userInteracted: boolean;
  setUserInteracted: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  firstQueue: [],
  secondQueue: [],
  thirdQueue: [],
  currentlyPlaying: null,
  error: null,
  isPlaying: false,
  userInteracted: false,
  setUserInteracted: () => set({ userInteracted: true }),

  addAudio: (audio) => {
    const { firstQueue, secondQueue, thirdQueue } = get();
    const exists = [...firstQueue, ...secondQueue, ...thirdQueue]
      .some(a => a.id === audio.id);

    if (!exists && !isAudioExpired(audio)) {
      set((state) => ({
        firstQueue: [...state.firstQueue, { ...audio, queue: 1 }],
        error: null,
      }));
    }
  },

  removeAudio: (audioId) => {
    const { currentlyPlaying, setCurrentlyPlaying, setError } = get();
    
    try {
      if (currentlyPlaying?.id === audioId) {
        setCurrentlyPlaying(null);
      }

      set((state) => ({
        firstQueue: state.firstQueue.filter((a) => a.id !== audioId),
        secondQueue: state.secondQueue.filter((a) => a.id !== audioId),
        thirdQueue: state.thirdQueue.filter((a) => a.id !== audioId),
        error: null,
      }));
    } catch (error) {
      setError('Failed to remove audio');
    }
  },

  moveToNextQueue: (audio) => {
    const { removeAudio, setError, userInteracted } = get();
    
    try {
      if (!userInteracted) {
        setError('Please click play to start audio playback');
        return;
      }
      
      const nextQueue = getNextQueueNumber(audio.queue);
      if (!nextQueue) {
        removeAudio(audio.id);
        return;
      }

      if (!isAudioExpired(audio)) {
        removeAudio(audio.id);
        set((state) => ({
          [nextQueue === 2 ? 'secondQueue' : 'thirdQueue']: [
            ...state[nextQueue === 2 ? 'secondQueue' : 'thirdQueue'],
            { ...audio, queue: nextQueue },
          ],
          error: null,
        }));
      } else {
        removeAudio(audio.id);
      }
    } catch (error) {
      setError('Failed to move audio to next queue');
    }
  },

  setCurrentlyPlaying: (audio) => {
    set({ currentlyPlaying: audio, error: null });
  },

  setError: (error) => {
    set({ error });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  cleanExpiredAudios: () => {
    set((state) => ({
      firstQueue: state.firstQueue.filter((a) => !isAudioExpired(a)),
      secondQueue: state.secondQueue.filter((a) => !isAudioExpired(a)),
      thirdQueue: state.thirdQueue.filter((a) => !shouldRemoveAudio(a)),
      error: null,
    }));
  },
}));