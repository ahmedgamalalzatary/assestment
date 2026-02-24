import { create } from "zustand";

/**
 * Global application state managed by Zustand.
 * Handles UI state like search query, pagination, and task ordering.
 */
interface AppState {
  /** Current search query for filtering tasks */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  /** Tracks how many items are visible per column (for infinite scroll) */
  columnPages: Record<string, number>;
  loadMoreForColumn: (columnId: string) => void;
  resetColumnPages: () => void;

  /**
   * Tracks custom task ordering per column.
   * Key = column ID, Value = ordered array of task IDs.
   * If a column has no entry, tasks are shown in their default (API) order.
   */
  taskOrder: Record<string, number[]>;
  setColumnOrder: (columnId: string, orderedIds: number[]) => void;
  clearTaskOrder: () => void;

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

  taskOrder: {},
  setColumnOrder: (columnId, orderedIds) =>
    set((state) => ({
      taskOrder: {
        ...state.taskOrder,
        [columnId]: orderedIds,
      },
    })),
  clearTaskOrder: () => set({ taskOrder: {} }),
}));
