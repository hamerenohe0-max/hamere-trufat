import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameScore } from '../../../types/models';

interface GameState {
  scores: GameScore[];
  addScore: (score: GameScore) => void;
  leaderboard: (game: GameScore['game']) => GameScore[];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      scores: [],
      addScore: (score) =>
        set((state) => ({
          scores: [score, ...state.scores].slice(0, 100),
        })),
      leaderboard: (game) =>
        get()
          .scores.filter((score) => score.game === game)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10),
    }),
    {
      name: 'hamere-games',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);


