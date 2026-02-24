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

  /**
   * Temporary column overrides during a drag operation.
   * Key = task ID, Value = column ID the task should appear in visually.
   * This allows cross-column preview without changing the actual API data.
   */
  dragColumnOverrides: Record<number, string>;
  setDragColumnOverride: (taskId: number, columnId: string) => void;
  clearDragColumnOverrides: () => void;
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

  dragColumnOverrides: {},
  setDragColumnOverride: (taskId, columnId) =>
    set((state) => ({
      dragColumnOverrides: {
        ...state.dragColumnOverrides,
        [taskId]: columnId,
      },
    })),
  clearDragColumnOverrides: () => set({ dragColumnOverrides: {} }),
}));
