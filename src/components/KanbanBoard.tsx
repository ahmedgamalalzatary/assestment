import { useState, useMemo, useCallback, useRef } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task, ColumnId } from "../types/task.ts";
import { COLUMNS } from "../types/task.ts";
import { useTasks } from "../hooks/useTasks.ts";
import { useAppStore } from "../store/useAppStore.ts";
import KanbanColumn from "./KanbanColumn.tsx";
import TaskDialog from "./TaskDialog.tsx";
import TaskCard from "./TaskCard.tsx";

/**
 * Helper: find which column a droppable/sortable ID belongs to,
 * given the current ordered task lists per column.
 */
function findColumnOfId(
  id: string | number,
  orderedColumns: Record<ColumnId, Task[]>
): ColumnId | undefined {
  // Check if it's a column ID directly
  if (typeof id === "string" && COLUMNS.some((c) => c.id === id)) {
    return id as ColumnId;
  }
  // Otherwise search through each column's task list
  for (const colId of Object.keys(orderedColumns) as ColumnId[]) {
    if (orderedColumns[colId].some((t) => t.id === id)) {
      return colId;
    }
  }
  return undefined;
}

/**
 * Main Kanban board component.
 * Orchestrates columns, drag-and-drop (including live cross-column preview),
 * and task CRUD operations.
 */
export default function KanbanBoard() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const taskOrder = useAppStore((s) => s.taskOrder);
  const setColumnOrder = useAppStore((s) => s.setColumnOrder);
  const {
    tasks,
    isLoading,
    isError,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks(searchQuery || undefined);

  // Dialog state for creating new tasks
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumn, setCreateColumn] = useState<ColumnId>("backlog");

  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  /** The column the task was in when drag started — used to detect cross-column moves */
  const dragSourceColumn = useRef<ColumnId | null>(null);

  // Configure pointer sensor with activation constraint to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Build a reverse lookup: task ID → column ID based on taskOrder arrays.
  // If a task ID appears in a taskOrder array, that determines its visual column.
  // This is what makes cross-column drag preview work without flicker —
  // during drag-over we move the ID between order arrays, and the grouping follows.
  const orderColumnMap = useMemo(() => {
    const map = new Map<number, ColumnId>();
    for (const colId of Object.keys(taskOrder) as ColumnId[]) {
      for (const id of taskOrder[colId]) {
        map.set(id, colId);
      }
    }
    return map;
  }, [taskOrder]);

  // Group tasks by column (using orderColumnMap override) and apply ordering
  const tasksByColumn = useMemo(() => {
    const grouped: Record<ColumnId, Task[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of tasks) {
      // If the task ID is in an order array, use that column; otherwise use API column
      const col = orderColumnMap.get(task.id) ?? task.column;
      if (grouped[col]) {
        grouped[col].push(task);
      }
    }
    // Apply custom ordering per column if available
    for (const colId of Object.keys(grouped) as ColumnId[]) {
      const order = taskOrder[colId];
      if (order && order.length > 0) {
        const idToTask = new Map(grouped[colId].map((t) => [t.id, t]));
        const ordered: Task[] = [];
        for (const id of order) {
          const task = idToTask.get(id);
          if (task) {
            ordered.push(task);
            idToTask.delete(id);
          }
        }
        for (const task of idToTask.values()) {
          ordered.push(task);
        }
        grouped[colId] = ordered;
      }
    }
    return grouped;
  }, [tasks, taskOrder, orderColumnMap]);

  // ---- DRAG START ----
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) {
        setActiveTask(task);
        dragSourceColumn.current = task.column;
      }
    },
    [tasks]
  );

  // ---- DRAG OVER ----
  // Live-moves the task ID between column order arrays so dnd-kit
  // can animate the insertion preview in the target column.
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !activeTask) return;

      const activeId = active.id as number;
      const overId = over.id;

      // Find which columns the active and over items are currently in
      const activeColumn = findColumnOfId(activeId, tasksByColumn);
      const overColumn = findColumnOfId(overId, tasksByColumn);

      if (!activeColumn || !overColumn) return;

      // Only act when moving to a DIFFERENT column
      if (activeColumn === overColumn) return;

      // Get current ID lists for both columns
      const sourceIds = tasksByColumn[activeColumn].map((t) => t.id);
      const destIds = tasksByColumn[overColumn].map((t) => t.id);

      // Remove the active task from the source column
      const newSourceIds = sourceIds.filter((id) => id !== activeId);

      // Determine insertion index in the destination column
      let insertIndex: number;
      if (typeof overId === "string" && COLUMNS.some((c) => c.id === overId)) {
        // Dropping on the column droppable itself → append at end
        insertIndex = destIds.length;
      } else {
        // Dropping on a specific task → insert at that task's position
        const overIndex = destIds.indexOf(overId as number);
        insertIndex = overIndex >= 0 ? overIndex : destIds.length;
      }

      // Insert the active task into the destination column
      const newDestIds = [...destIds];
      newDestIds.splice(insertIndex, 0, activeId);

      // Update both columns' orders — tasksByColumn will automatically
      // pick up the change via orderColumnMap since the task ID moved
      setColumnOrder(activeColumn, newSourceIds);
      setColumnOrder(overColumn, newDestIds);
    },
    [activeTask, tasksByColumn, setColumnOrder]
  );

  // ---- DRAG END ----
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const originalColumn = dragSourceColumn.current;

      setActiveTask(null);
      dragSourceColumn.current = null;

      if (!over) {
        // Drag cancelled — remove the task from any order arrays it was moved into
        // so it goes back to its original column (derived from task.column)
        if (originalColumn) {
          // Clear all order arrays to reset to API state
          const allColIds = Object.keys(taskOrder) as ColumnId[];
          for (const colId of allColIds) {
            const order = taskOrder[colId];
            if (order) {
              const filtered = order.filter((id) => id !== (active.id as number));
              if (filtered.length !== order.length) {
                setColumnOrder(colId, filtered);
              }
            }
          }
        }
        return;
      }

      const activeId = active.id as number;

      // Find which column the task is now in (after any handleDragOver moves)
      const currentColumn = findColumnOfId(activeId, tasksByColumn);
      if (!currentColumn) return;

      // Handle same-column reorder (within the column the task is currently in)
      if (active.id !== over.id) {
        const currentIds = tasksByColumn[currentColumn].map((t) => t.id);
        const oldIndex = currentIds.indexOf(activeId);
        const newIndex = currentIds.indexOf(over.id as number);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reorderedIds = arrayMove(currentIds, oldIndex, newIndex);
          setColumnOrder(currentColumn, reorderedIds);
        }
      }

      // If the task moved to a different column, persist via API
      if (originalColumn && currentColumn !== originalColumn) {
        moveTask({ id: activeId, column: currentColumn });
      }
    },
    [tasksByColumn, taskOrder, moveTask, setColumnOrder]
  );

  // Handle add button click per column
  const handleAddClick = useCallback((columnId: ColumnId) => {
    setCreateColumn(columnId);
    setCreateDialogOpen(true);
  }, []);

  // Handle task update
  const handleUpdate = useCallback(
    (id: number, updates: Partial<Omit<Task, "id">>) => {
      updateTask({ id, updates });
    },
    [updateTask]
  );

  // Handle task delete
  const handleDelete = useCallback(
    (id: number) => {
      deleteTask(id);
    },
    [deleteTask]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="subtitle2">Failed to load tasks</Typography>
        <Typography variant="body2">
          {error?.message ?? "Unknown error"}. Make sure json-server is
          running on port 4000.
        </Typography>
      </Alert>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            overflowX: "auto",
            minHeight: "calc(100vh - 150px)",
          }}
        >
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              config={col}
              tasks={tasksByColumn[col.id]}
              onAddClick={() => handleAddClick(col.id)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </Box>

        {/* Drag overlay shows a ghost of the card being dragged */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create task dialog */}
      {createDialogOpen && (
        <TaskDialog
          open={createDialogOpen}
          defaultColumn={createColumn}
          onClose={() => setCreateDialogOpen(false)}
          onSave={(data) => {
            createTask(data);
            setCreateDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
