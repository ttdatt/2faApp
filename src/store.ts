import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

interface AppState {
  currentTimestamp: number;
  init: () => void;
}

export const useAuthStore = create(
  immer<AppState>(set => ({
    currentTimestamp: 0,
    init: () => {
      setInterval(() => {
        set(state => {
          const currentTimestamp = new Date().getTime();
          state.currentTimestamp = currentTimestamp;
        });
      }, 1000);
    },
  })),
);
