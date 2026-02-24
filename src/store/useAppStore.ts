import { create } from "zustand";

/**
 * Global application state managed by Zustand.
 * Handles UI state like search query and dialog visibility.
 */
interface AppState {
  /** Current search query for filtering tasks */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  /** Tracks how many items are visible per column (for infinite scroll) */
  columnPages: Record<string, number>;
  loadMoreForColumn: (columnId: string) => void;
  resetColumnPages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) =>
    set({ searchQuery: query, columnPages: {} }),

  columnPages: {},
  loadMoreForColumn: (columnId) =>
    set((state) => ({
      columnPages: {
        ...state.columnPages,
        [columnId]: (state.columnPages[columnId] ?? 1) + 1,
      },
    })),
  resetColumnPages: () => set({ columnPages: {} }),
}));
