import { useState, useMemo, useCallback } from "react";
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
import type { Task, ColumnId } from "../types/task.ts";
import { COLUMNS } from "../types/task.ts";
import { useTasks } from "../hooks/useTasks.ts";
import { useAppStore } from "../store/useAppStore.ts";
import KanbanColumn from "./KanbanColumn.tsx";
import TaskDialog from "./TaskDialog.tsx";
import TaskCard from "./TaskCard.tsx";

/**
 * Main Kanban board component.
 * Orchestrates columns, drag-and-drop, and task CRUD operations.
 */
export default function KanbanBoard() {
  const searchQuery = useAppStore((s) => s.searchQuery);
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

  // Drag state for overlay
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure pointer sensor with activation constraint to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<ColumnId, Task[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of tasks) {
      if (grouped[task.column]) {
        grouped[task.column].push(task);
      }
    }
    return grouped;
  }, [tasks]);

  // Drag event handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback is handled by the droppable isOver state
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);

      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as number;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine target column: could be dropping on another task or on the column itself
      let targetColumn: ColumnId | undefined;

      // Check if dropping over a column droppable
      if (
        typeof over.id === "string" &&
        COLUMNS.some((c) => c.id === over.id)
      ) {
        targetColumn = over.id as ColumnId;
      } else {
        // Dropping over another task — find which column that task is in
        const overTask = tasks.find((t) => t.id === over.id);
        if (overTask) {
          targetColumn = overTask.column;
        }
      }

      // Only move if dropping into a different column
      if (targetColumn && targetColumn !== task.column) {
        moveTask({ id: taskId, column: targetColumn });
      }
    },
    [tasks, moveTask]
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
