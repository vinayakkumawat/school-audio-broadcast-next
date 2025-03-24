import { create } from 'zustand';
import { Audio } from '../types';

const WAIT_DURATION = 30000; // 30 seconds in milliseconds

interface AudioState {
  audioList: Audio[];
  currentlyPlaying: Audio | null;
  error: string | null;
  isPlaying: boolean;
  userInteracted: boolean;
  addAudio: (audio: Omit<Audio, 'playCount' | 'nextPlayTime' | 'status'>) => void;
  removeAudio: (audioId: string) => void;
  updateAudioStatus: (audioId: string) => void;
  setCurrentlyPlaying: (audio: Audio | null) => void;
  setError: (error: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setUserInteracted: () => void;
  getNextAudioToPlay: () => Audio | null;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioList: [],
  currentlyPlaying: null,
  error: null,
  isPlaying: false,
  userInteracted: false,

  addAudio: (audioData) => {
    const newAudio: Audio = {
      ...audioData,
      playCount: 0,
      nextPlayTime: null,
      status: 'FIRST_BURST'
    };

    set((state) => ({
      audioList: [...state.audioList, newAudio],
      error: null,
    }));
  },

  removeAudio: (audioId) => {
    const { currentlyPlaying, setCurrentlyPlaying } = get();
    
    if (currentlyPlaying?.id === audioId) {
      setCurrentlyPlaying(null);
      set({ isPlaying: false });
    }

    set((state) => ({
      audioList: state.audioList.filter((a) => a.id !== audioId),
      error: null,
    }));
  },

  updateAudioStatus: (audioId) => {
    const { setCurrentlyPlaying } = get();
    
    set((state) => {
      const updatedList = state.audioList.map((audio) => {
        if (audio.id !== audioId) return audio;

        const now = Date.now();
        const updatedAudio = { ...audio };
        
        // First check if we need to transition from waiting states
        if (updatedAudio.status === 'WAITING_FIRST' && now >= (updatedAudio.nextPlayTime || 0)) {
          updatedAudio.status = 'SECOND_BURST';
          updatedAudio.nextPlayTime = null;
          console.log('Transitioning to second burst:', { id: audio.id });
          return updatedAudio;
        }

        if (updatedAudio.status === 'WAITING_SECOND' && now >= (updatedAudio.nextPlayTime || 0)) {
          updatedAudio.status = 'FINAL_PLAY';
          updatedAudio.nextPlayTime = null;
          console.log('Transitioning to final play:', { id: audio.id });
          return updatedAudio;
        }

        // Then handle play count updates based on current status
        switch (updatedAudio.status) {
          case 'FIRST_BURST':
            // First play (0 -> 1)
            if (updatedAudio.playCount === 0) {
              updatedAudio.playCount = 1;
              console.log('First burst first play:', { id: audio.id, newCount: updatedAudio.playCount });
            } 
            // Second play (1 -> 2) and transition to waiting
            else if (updatedAudio.playCount === 1) {
              updatedAudio.playCount = 2;
              updatedAudio.status = 'WAITING_FIRST';
              updatedAudio.nextPlayTime = now + WAIT_DURATION;
              console.log('First burst second play and wait:', { id: audio.id, nextPlay: updatedAudio.nextPlayTime });
            }
            break;

          case 'SECOND_BURST':
            // First play of second burst (2 -> 3)
            if (updatedAudio.playCount === 2) {
              updatedAudio.playCount = 3;
              console.log('Second burst first play:', { id: audio.id, newCount: updatedAudio.playCount });
            }
            // Second play of second burst (3 -> 4) and transition to waiting
            else if (updatedAudio.playCount === 3) {
              updatedAudio.playCount = 4;
              updatedAudio.status = 'WAITING_SECOND';
              updatedAudio.nextPlayTime = now + WAIT_DURATION;
              console.log('Second burst second play and wait:', { id: audio.id, nextPlay: updatedAudio.nextPlayTime });
            }
            break;

          case 'FINAL_PLAY':
            // Final play (4 -> 5) and complete
            updatedAudio.playCount = 5;
            updatedAudio.status = 'COMPLETED';
            updatedAudio.nextPlayTime = null;
            console.log('Final play and complete:', { id: audio.id });
            break;

          default:
            break;
        }

        return updatedAudio;
      });

      return {
        audioList: updatedList,
      };
    });

    // Clear currently playing if the audio is completed
    const updatedAudio = get().audioList.find(a => a.id === audioId);
    if (updatedAudio?.status === 'COMPLETED') {
      setCurrentlyPlaying(null);
      set({ isPlaying: false });
    }
  },

  getNextAudioToPlay: () => {
    const { audioList, currentlyPlaying } = get();
    const now = Date.now();

    // If something is currently playing, don't play anything else
    if (currentlyPlaying) return null;

    // First, check for any waiting audio that's ready
    const waitingAudio = audioList.find(audio => 
      (audio.status === 'WAITING_FIRST' || audio.status === 'WAITING_SECOND') &&
      audio.nextPlayTime && now >= audio.nextPlayTime
    );
    if (waitingAudio) {
      console.log('Found waiting audio ready:', { 
        id: waitingAudio.id, 
        status: waitingAudio.status,
        playCount: waitingAudio.playCount,
        nextPlayTime: waitingAudio.nextPlayTime
      });
      return waitingAudio;
    }

    // Then check for any audio in FIRST_BURST
    const firstBurstAudio = audioList.find(audio => 
      audio.status === 'FIRST_BURST' && audio.playCount === 0
    );
    if (firstBurstAudio) {
      console.log('Found first burst audio:', { 
        id: firstBurstAudio.id, 
        status: firstBurstAudio.status,
        playCount: firstBurstAudio.playCount
      });
      return firstBurstAudio;
    }

    // Then check for any audio in SECOND_BURST
    const secondBurstAudio = audioList.find(audio => 
      audio.status === 'SECOND_BURST' && audio.playCount === 2
    );
    if (secondBurstAudio) {
      console.log('Found second burst audio:', { 
        id: secondBurstAudio.id, 
        status: secondBurstAudio.status,
        playCount: secondBurstAudio.playCount
      });
      return secondBurstAudio;
    }

    // Finally, check for any audio ready for its final play
    const finalAudio = audioList.find(audio => 
      audio.status === 'FINAL_PLAY'
    );
    if (finalAudio) {
      console.log('Found final play audio:', { 
        id: finalAudio.id, 
        status: finalAudio.status,
        playCount: finalAudio.playCount
      });
    }
    return finalAudio || null;
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

  setUserInteracted: () => {
    set({ userInteracted: true });
  },
}));