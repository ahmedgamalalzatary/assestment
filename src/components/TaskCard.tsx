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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          mb: 1.5,
          cursor: "grab",
          position: "relative",
          touchAction: "none",
          bgcolor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: { xs: "12px", sm: "14px" },
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)",
          backgroundImage: "none",
          transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          overflow: "visible",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.12)",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2)",
            transform: "translateY(-2px)",
            "& .card-actions": {
              opacity: 1,
            },
            "& .drag-handle": {
              opacity: 0.6,
            },
          },
          "&:active": {
            cursor: "grabbing",
          },
        }}
      >
        <CardContent sx={{ p: { xs: "10px !important", sm: "14px !important" }, "&:last-child": { pb: { xs: "10px !important", sm: "14px !important" } } }}>
          {/* Drag handle and title row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box
              className="drag-handle"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                mt: 0.25,
                flexShrink: 0,
                opacity: 0.3,
                transition: "opacity 0.2s ease",
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 18 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                noWrap
                title={task.title}
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#f1f5f9",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.4,
                }}
              >
                {task.title}
              </Typography>
              {task.description && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    color: "#64748b",
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>

            {/* Action buttons — always visible on touch, hover-reveal on desktop */}
            <Box
              className="card-actions"
              sx={{
                display: "flex",
                flexShrink: 0,
                ml: 0.5,
                opacity: { xs: 1, md: 0 },
                transition: "opacity 0.2s ease",
                gap: 0.25,
              }}
            >
              <Tooltip title="Edit" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "text.secondary",
                    "&:hover": {
                      color: "#818cf8",
                      bgcolor: "rgba(129, 140, 248, 0.1)",
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "text.secondary",
                    "&:hover": {
                      color: "#f87171",
                      bgcolor: "rgba(248, 113, 113, 0.1)",
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 15 }} />
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
