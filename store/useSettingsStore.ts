import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isTestingEnabled: boolean;
  selectedAudioDevice: string;
  toggleTesting: () => void;
  setAudioDevice: (deviceId: string) => void;
}

const createSettingsStore = (set: any) => ({
  isTestingEnabled: true,
  selectedAudioDevice: 'default', // Default audio device
  toggleTesting: () =>
    set((state: SettingsState) => ({
      isTestingEnabled: !state.isTestingEnabled,
    })),
  setAudioDevice: (deviceId: string) => {
    set({ selectedAudioDevice: deviceId });
    updateAudioOutput(deviceId); // Update the audio output
  },
});

export const useSettingsStore = create<SettingsState>()(
  persist(createSettingsStore, {
    name: 'settings-storage',
  })
);

// Function to update the audio output device
const updateAudioOutput = async (deviceId: string) => {
  const audioElements = document.querySelectorAll<HTMLMediaElement>('audio');
  for (const audioElement of audioElements) {
    if (typeof audioElement.setSinkId === 'function') {
      try {
        await audioElement.setSinkId(deviceId);
        console.log(`Audio output set to device: ${deviceId}`);
      } catch (error) {
        console.error(`Error setting audio output device: ${error}`);
      }
    } else {
      console.warn('setSinkId is not supported in this browser.');
    }
  }
};
