import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

interface AppState {
  remainingSeconds: number;
  currentTimestamp: number;
  init: () => void;
}

export const useAuthStore = create(
  immer<AppState>(set => ({
    remainingSeconds: 0,
    currentTimestamp: 0,
    init: () => {
      setInterval(() => {
        set(state => {
          const currentTimestamp = new Date().getTime();
          const remainingSeconds = Math.floor(30 - ((currentTimestamp / 1000) % 30));
          state.remainingSeconds = remainingSeconds;
          state.currentTimestamp = currentTimestamp;
        });
      }, 1000);
    },
  })),
);
