/**
 * Represents the possible columns a task can belong to.
 */
export type ColumnId = "backlog" | "in_progress" | "review" | "done";

/**
 * Represents a single task in the Kanban board.
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  column: ColumnId;
}

/**
 * Column metadata for display purposes.
 */
export interface ColumnConfig {
  id: ColumnId;
  title: string;
  color: string;
}

/**
 * All available columns with their display configuration.
 */
export const COLUMNS: ColumnConfig[] = [
  { id: "backlog", title: "Backlog", color: "#94a3b8" },
  { id: "in_progress", title: "In Progress", color: "#818cf8" },
  { id: "review", title: "Review", color: "#f59e0b" },
  { id: "done", title: "Done", color: "#34d399" },
];

/** Number of tasks to load per page in each column */
export const PAGE_SIZE = 5;
