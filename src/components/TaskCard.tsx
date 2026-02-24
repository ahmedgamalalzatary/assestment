import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task.ts";
import TaskDialog from "./TaskDialog.tsx";
import ConfirmDialog from "./ConfirmDialog.tsx";

interface TaskCardProps {
  task: Task;
  onUpdate: (id: number, updates: Partial<Omit<Task, "id">>) => void;
  onDelete: (id: number) => void;
}

/**
 * A draggable task card displaying title, description, and action buttons.
 * Integrates with dnd-kit for drag-and-drop functionality.
 */
export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          mb: 1,
          cursor: "grab",
          "&:hover": { boxShadow: 3 },
          position: "relative",
          touchAction: "none",
        }}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          {/* Drag handle and title row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                mt: 0.25,
                flexShrink: 0,
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                noWrap
                title={task.title}
              >
                {task.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {task.description}
              </Typography>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: "flex", flexShrink: 0, ml: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      {editOpen && (
        <TaskDialog
          open={editOpen}
          task={task}
          onClose={() => setEditOpen(false)}
          onSave={(updates) => {
            onUpdate(task.id, updates);
            setEditOpen(false);
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        onConfirm={() => {
          onDelete(task.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
