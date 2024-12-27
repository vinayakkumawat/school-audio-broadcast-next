import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isTestingEnabled: boolean;
  toggleTesting: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isTestingEnabled: true, // Default to true
      toggleTesting: () => set((state) => ({ isTestingEnabled: !state.isTestingEnabled })),
    }),
    {
      name: 'settings-storage',
    }
  )
);