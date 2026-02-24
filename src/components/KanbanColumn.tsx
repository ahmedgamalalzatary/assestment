import { useCallback, useRef, useMemo } from "react";
import { Box, Typography, Button, Chip, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task, ColumnConfig } from "../types/task.ts";
import { PAGE_SIZE } from "../types/task.ts";
import { useAppStore } from "../store/useAppStore.ts";
import TaskCard from "./TaskCard.tsx";

interface KanbanColumnProps {
  config: ColumnConfig;
  tasks: Task[];
  onAddClick: () => void;
  onUpdate: (id: number, updates: Partial<Omit<Task, "id">>) => void;
  onDelete: (id: number) => void;
}

/**
 * A single Kanban column that displays tasks with infinite scroll.
 * Tasks are droppable targets for dnd-kit drag-and-drop.
 */
export default function KanbanColumn({
  config,
  tasks,
  onAddClick,
  onUpdate,
  onDelete,
}: KanbanColumnProps) {
  const columnPages = useAppStore((s) => s.columnPages);
  const loadMoreForColumn = useAppStore((s) => s.loadMoreForColumn);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate how many tasks to display based on current page
  const currentPage = columnPages[config.id] ?? 1;
  const visibleCount = currentPage * PAGE_SIZE;
  const visibleTasks = useMemo(
    () => tasks.slice(0, visibleCount),
    [tasks, visibleCount]
  );
  const hasMore = tasks.length > visibleCount;

  // Set up droppable area for this column
  const { setNodeRef, isOver } = useDroppable({
    id: config.id,
    data: { column: config.id },
  });

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    // Load more when user scrolls near the bottom (within 50px)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreForColumn(config.id);
    }
  }, [hasMore, loadMoreForColumn, config.id]);

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 280,
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        bgcolor: isOver ? "action.hover" : "grey.50",
        borderRadius: 2,
        transition: "background-color 0.2s",
        border: isOver ? "2px dashed" : "2px solid transparent",
        borderColor: isOver ? config.color : "transparent",
      }}
    >
      {/* Column header */}
      <Box
        sx={{
          p: 2,
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: config.color,
            }}
          />
          <Typography variant="subtitle1" fontWeight={700}>
            {config.title}
          </Typography>
          <Chip label={tasks.length} size="small" variant="outlined" />
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{ minWidth: "auto" }}
        >
          Add
        </Button>
      </Box>

      {/* Scrollable task list */}
      <Box
        ref={(node: HTMLDivElement | null) => {
          // Combine refs: droppable ref + scroll ref
          setNodeRef(node);
          (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.5,
          pt: 0.5,
          minHeight: 200,
          maxHeight: "calc(100vh - 240px)",
        }}
      >
        <SortableContext
          items={visibleTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 100,
              color: "text.disabled",
            }}
          >
            <Typography variant="body2">No tasks</Typography>
          </Box>
        )}

        {/* Load more button (fallback for infinite scroll) */}
        {hasMore && (
          <Button
            size="small"
            fullWidth
            onClick={() => loadMoreForColumn(config.id)}
            sx={{ mt: 1 }}
          >
            Load more ({tasks.length - visibleCount} remaining)
          </Button>
        )}
      </Box>
    </Paper>
  );
}
