import { create } from 'zustand';
import { Audio, AudioStatus } from '../types';

const WAIT_DURATION = 30000; // 30 seconds in milliseconds

interface AudioState {
  audioList: Audio[];
  currentlyPlaying: Audio | null;
  error: string | null;
  isPlaying: boolean;
  userInteracted: boolean;
  addAudio: (audio: Omit<Audio, 'playCount' | 'nextPlayTime' | 'status' | 'playIndex'>) => void;
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
    const now = Date.now();
    
    // Create 6 playback entries for this audio
    const newAudioEntries: Audio[] = Array.from({ length: 6 }).map((_, index) => {
      const entry: Audio = {
        ...audioData,
        id: `${audioData.id}-${index + 1}`, // Create unique IDs for each entry
        playCount: 0,
        playIndex: index + 1, // Track the position (1-6)
        status: 'READY_TO_PLAY' as AudioStatus,
        nextPlayTime: index < 2 ? null : now + (WAIT_DURATION * (index - 1)) // First 2 play immediately, others scheduled
      };
      return entry;
    });
    
    console.log('Added 6 new audio entries:', newAudioEntries.map(a => ({ 
      id: a.id, 
      playIndex: a.playIndex, 
      nextPlayTime: a.nextPlayTime 
    })));

    set((state) => ({
      audioList: [...state.audioList, ...newAudioEntries],
      error: null,
    }));
  },

  removeAudio: (audioId) => {
    const { currentlyPlaying, setCurrentlyPlaying } = get();
    const baseId = audioId.split('-')[0]; // Get the base ID without the entry index
    
    // If currently playing audio is from this group, stop it
    if (currentlyPlaying && currentlyPlaying.id.startsWith(baseId)) {
      setCurrentlyPlaying(null);
      set({ isPlaying: false });
    }

    // Remove all entries associated with this audio
    set((state) => ({
      audioList: state.audioList.filter((a) => !a.id.startsWith(baseId)),
      error: null,
    }));
  },

  updateAudioStatus: (audioId) => {
    set((state) => {
      const updatedList = state.audioList.map((audio) => {
        if (audio.id !== audioId) return audio;
        
        // Mark this entry as played
        const updatedAudio: Audio = { 
          ...audio,
          playCount: 1,
          status: 'COMPLETED' as AudioStatus
        };
        
        console.log('Audio entry completed:', { 
          id: audioId, 
          playIndex: audio.playIndex 
        });
        
        return updatedAudio;
      });

      return { audioList: updatedList };
    });

    // Clear currently playing state
    const { setCurrentlyPlaying } = get();
    setCurrentlyPlaying(null);
    set({ isPlaying: false });
  },

  getNextAudioToPlay: () => {
    const { audioList, currentlyPlaying } = get();
    const now = Date.now();

    // If something is currently playing, don't play anything else
    if (currentlyPlaying) return null;

    // First, check for immediate plays (playIndex 1 or 2)
    const immediateAudio = audioList.find(audio => 
      audio.status === 'READY_TO_PLAY' && 
      audio.playCount === 0 && 
      (audio.playIndex === 1 || audio.playIndex === 2)
    );
    
    if (immediateAudio) {
      console.log('Found immediate audio to play:', { 
        id: immediateAudio.id, 
        playIndex: immediateAudio.playIndex 
      });
      return immediateAudio;
    }

    // Then, check for scheduled plays that are ready (time has elapsed)
    const scheduledAudio = audioList.find(audio => 
      audio.status === 'READY_TO_PLAY' && 
      audio.playCount === 0 && 
      audio.nextPlayTime && 
      now >= audio.nextPlayTime
    );
    
    if (scheduledAudio) {
      console.log('Found scheduled audio ready to play:', { 
        id: scheduledAudio.id, 
        playIndex: scheduledAudio.playIndex,
        waitedFor: now - (scheduledAudio.nextPlayTime || 0)
      });
      return scheduledAudio;
    }

    return null;
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