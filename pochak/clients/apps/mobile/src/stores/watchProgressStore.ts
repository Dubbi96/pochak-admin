import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchProgress {
  position: number;
  duration: number;
  updatedAt: number;
}

const MAX_ENTRIES = 100;

interface WatchProgressStore {
  progress: Record<string, WatchProgress>;
  saveProgress: (key: string, position: number, duration: number) => void;
  getProgress: (key: string) => WatchProgress | null;
  clearProgress: (key: string) => void;
}

export const useWatchProgressStore = create<WatchProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      saveProgress: (key: string, position: number, duration: number) => {
        // Only save if position > 10s and position < duration - 30s
        if (position <= 10 || position >= duration - 30) {
          return;
        }

        const current = get().progress;
        const updated: Record<string, WatchProgress> = {
          ...current,
          [key]: {position, duration, updatedAt: Date.now()},
        };

        // Evict oldest entries if over MAX_ENTRIES
        const keys = Object.keys(updated);
        if (keys.length > MAX_ENTRIES) {
          const sorted = keys.sort(
            (a, b) => updated[a].updatedAt - updated[b].updatedAt,
          );
          const toRemove = sorted.slice(0, keys.length - MAX_ENTRIES);
          for (const k of toRemove) {
            delete updated[k];
          }
        }

        set({progress: updated});
      },

      getProgress: (key: string): WatchProgress | null => {
        return get().progress[key] ?? null;
      },

      clearProgress: (key: string) => {
        const current = {...get().progress};
        delete current[key];
        set({progress: current});
      },
    }),
    {
      name: 'pochak-watch-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
