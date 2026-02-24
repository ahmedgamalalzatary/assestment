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
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !activeTask) return;

      const activeId = active.id as number;
      const overId = over.id;

      const activeColumn = findColumnOfId(activeId, tasksByColumn);
      const overColumn = findColumnOfId(overId, tasksByColumn);

      if (!activeColumn || !overColumn) return;
      if (activeColumn === overColumn) return;

      const sourceIds = tasksByColumn[activeColumn].map((t) => t.id);
      const destIds = tasksByColumn[overColumn].map((t) => t.id);

      const newSourceIds = sourceIds.filter((id) => id !== activeId);

      let insertIndex: number;
      if (typeof overId === "string" && COLUMNS.some((c) => c.id === overId)) {
        insertIndex = destIds.length;
      } else {
        const overIndex = destIds.indexOf(overId as number);
        insertIndex = overIndex >= 0 ? overIndex : destIds.length;
      }

      const newDestIds = [...destIds];
      newDestIds.splice(insertIndex, 0, activeId);

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
        if (originalColumn) {
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

      const currentColumn = findColumnOfId(activeId, tasksByColumn);
      if (!currentColumn) return;

      if (active.id !== over.id) {
        const currentIds = tasksByColumn[currentColumn].map((t) => t.id);
        const oldIndex = currentIds.indexOf(activeId);
        const newIndex = currentIds.indexOf(over.id as number);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reorderedIds = arrayMove(currentIds, oldIndex, newIndex);
          setColumnOrder(currentColumn, reorderedIds);
        }
      }

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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
          gap: 2,
        }}
      >
        <CircularProgress
          size={40}
          thickness={3}
          sx={{
            color: "#818cf8",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          Loading your board…
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{
          m: 3,
          borderRadius: 3,
          bgcolor: "rgba(248, 113, 113, 0.08)",
          border: "1px solid rgba(248, 113, 113, 0.2)",
          "& .MuiAlert-icon": { color: "#f87171" },
        }}
      >
        <Typography variant="subtitle2">Failed to load tasks</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 2.5 },
            p: { xs: 1.5, sm: 2, md: 3 },
            overflowX: { xs: "hidden", md: "auto" },
            overflowY: { xs: "auto", md: "visible" },
            minHeight: { xs: "auto", md: "calc(100vh - 80px)" },
            alignItems: { xs: "stretch", md: "flex-start" },
            pb: { xs: 4, md: 3 },
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
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <Box sx={{ transform: "rotate(2deg)", opacity: 0.92 }}>
              <TaskCard
                task={activeTask}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            </Box>
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
