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
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreForColumn(config.id);
    }
  }, [hasMore, loadMoreForColumn, config.id]);

  return (
    <Paper
      elevation={0}
      className="kanban-column-animate"
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: isOver ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.025)",
        borderRadius: { xs: "14px", sm: "18px" },
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        border: "1px solid",
        borderColor: isOver
          ? `${config.color}44`
          : "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.1)",
          bgcolor: "rgba(255, 255, 255, 0.03)",
        },
        // Top glow line
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${config.color}88, transparent)`,
          borderRadius: "0 0 4px 4px",
        },
      }}
    >
      {/* Column header */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          pt: { xs: 2, sm: 2.5 },
          pb: { xs: 1, sm: 1.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Glowing status dot */}
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: config.color,
              boxShadow: `0 0 8px ${config.color}66, 0 0 16px ${config.color}33`,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "-0.01em",
              color: "#f1f5f9",
            }}
          >
            {config.title}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              height: 22,
              minWidth: 28,
              fontSize: "0.7rem",
              fontWeight: 700,
              bgcolor: `${config.color}18`,
              color: config.color,
              border: `1px solid ${config.color}30`,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </Box>
        <Button
          size="small"
          onClick={onAddClick}
          sx={{
            minWidth: "auto",
            px: 1.5,
            py: 0.5,
            fontSize: "0.78rem",
            color: "text.secondary",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            bgcolor: "rgba(255, 255, 255, 0.03)",
            transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
            "&:hover": {
              bgcolor: `${config.color}15`,
              borderColor: `${config.color}40`,
              color: config.color,
              transform: "translateY(-1px)",
            },
          }}
          startIcon={<AddIcon sx={{ fontSize: "16px !important" }} />}
        >
          Add
        </Button>
      </Box>

      {/* Scrollable task list */}
      <Box
        ref={(node: HTMLDivElement | null) => {
          setNodeRef(node);
          (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: 1, sm: 1.5 },
          pb: 1.5,
          pt: 0.5,
          minHeight: { xs: 120, md: 180 },
          maxHeight: { xs: "50vh", md: "calc(100vh - 240px)" },
        }}
      >
        <SortableContext
          items={visibleTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleTasks.map((task, index) => (
            <Box
              key={task.id}
              className="task-card-animate"
              sx={{ animationDelay: `${index * 0.04}s` }}
            >
              <TaskCard
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </Box>
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 140,
              color: "text.disabled",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                border: "2px dashed rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.disabled",
                fontSize: "1.2rem",
              }}
            >
              +
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#475569",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              No tasks yet
            </Typography>
          </Box>
        )}

        {/* Load more button (fallback for infinite scroll) */}
        {hasMore && (
          <Button
            size="small"
            fullWidth
            onClick={() => loadMoreForColumn(config.id)}
            sx={{
              mt: 1,
              py: 0.8,
              fontSize: "0.75rem",
              color: "text.secondary",
              borderRadius: "10px",
              border: "1px dashed rgba(255, 255, 255, 0.08)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.04)",
                borderColor: "rgba(255, 255, 255, 0.15)",
              },
            }}
          >
            Load more ({tasks.length - visibleCount} remaining)
          </Button>
        )}
      </Box>
    </Paper>
  );
}
