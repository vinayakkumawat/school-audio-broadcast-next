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
        
        // Expanded logging for better tracking
        console.log('Updating audio status:', {
          id: audioId,
          currentStatus: updatedAudio.status,
          currentPlayCount: updatedAudio.playCount,
          currentTime: now
        });

        // More robust state transition logic
        switch (updatedAudio.status) {
          case 'FIRST_BURST':
            // Increment play count first
            updatedAudio.playCount += 1;
            
            // If we've played twice, move to waiting state
            if (updatedAudio.playCount >= 2) {
              updatedAudio.status = 'WAITING_FIRST';
              updatedAudio.nextPlayTime = now + WAIT_DURATION;
              console.log('Moved to WAITING_FIRST with nextPlayTime:', updatedAudio.nextPlayTime);
            }
            break;

          case 'WAITING_FIRST':
            // Only transition if the waiting time has passed
            if (now >= (updatedAudio.nextPlayTime || 0)) {
              updatedAudio.status = 'SECOND_BURST';
              updatedAudio.playCount = 2; // Reset to 2 to track second burst plays
              updatedAudio.nextPlayTime = null;
              console.log('Moved from WAITING_FIRST to SECOND_BURST');
            }
            break;

          case 'SECOND_BURST':
            // Increment play count (starting from 2)
            updatedAudio.playCount += 1;
            
            // After playing twice in second burst (reaching count 4), move to next waiting state
            if (updatedAudio.playCount >= 4) {
              updatedAudio.status = 'WAITING_SECOND';
              updatedAudio.nextPlayTime = now + WAIT_DURATION;
              console.log('Moved to WAITING_SECOND with nextPlayTime:', updatedAudio.nextPlayTime);
            }
            break;

          case 'WAITING_SECOND':
            // Only transition if the waiting time has passed
            if (now >= (updatedAudio.nextPlayTime || 0)) {
              updatedAudio.status = 'FINAL_PLAY';
              updatedAudio.playCount = 4; // Reset to 4 to track final play
              updatedAudio.nextPlayTime = null;
              console.log('Moved from WAITING_SECOND to FINAL_PLAY');
            }
            break;

          case 'FINAL_PLAY':
            // After one play in final state, mark as completed
            updatedAudio.playCount += 1;
            updatedAudio.status = 'COMPLETED';
            console.log('Completed audio playback');
            break;
        }

        console.log('Updated audio status:', {
          id: audioId,
          newStatus: updatedAudio.status,
          newPlayCount: updatedAudio.playCount,
          nextPlayTime: updatedAudio.nextPlayTime
        });

        return updatedAudio;
      });

      return { audioList: updatedList };
    });

    // Check if the audio's status was updated to COMPLETED
    const updatedAudio = get().audioList.find(a => a.id === audioId);
    if (updatedAudio?.status === 'COMPLETED') {
      setCurrentlyPlaying(null);
      set({ isPlaying: false });
    } else if (updatedAudio?.status === 'WAITING_FIRST' || updatedAudio?.status === 'WAITING_SECOND') {
      // If we're in a waiting state, clear the currently playing
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
      audio.status === 'FIRST_BURST'
    );
    if (firstBurstAudio) {
      console.log('Found first burst audio:', { 
        id: firstBurstAudio.id, 
        status: firstBurstAudio.status,
        playCount: firstBurstAudio.playCount
      });
      return firstBurstAudio;
    }

    // Then check for any audio in SECOND_BURST with play count less than 4
    const secondBurstAudio = audioList.find(audio => 
      audio.status === 'SECOND_BURST' && audio.playCount < 4
    );
    if (secondBurstAudio) {
      console.log('Found second burst audio:', { 
        id: secondBurstAudio.id, 
        status: secondBurstAudio.status,
        playCount: secondBurstAudio.playCount
      });
      return secondBurstAudio;
    }

    // Finally, check for any audio ready for its final play with play count of 4
    const finalAudio = audioList.find(audio => 
      audio.status === 'FINAL_PLAY' && audio.playCount === 4
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