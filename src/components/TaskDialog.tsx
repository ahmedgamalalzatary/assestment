import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import type { Task, ColumnId } from "../types/task.ts";
import { COLUMNS } from "../types/task.ts";

interface TaskDialogProps {
  open: boolean;
  /** If provided, dialog is in edit mode; otherwise create mode */
  task?: Task;
  /** Default column when creating a new task */
  defaultColumn?: ColumnId;
  onClose: () => void;
  onSave: (data: Omit<Task, "id">) => void;
}

/**
 * Dialog form for creating or editing a task.
 * Validates that title is not empty before allowing save.
 */
export default function TaskDialog({
  open,
  task,
  defaultColumn = "backlog",
  onClose,
  onSave,
}: TaskDialogProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [column, setColumn] = useState<ColumnId>(
    task?.column ?? defaultColumn
  );
  const [titleError, setTitleError] = useState(false);

  const isEdit = Boolean(task);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      column,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          letterSpacing: "-0.02em",
          pb: 1,
          pt: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              background: isEdit
                ? "linear-gradient(135deg, #818cf8, #6366f1)"
                : "linear-gradient(135deg, #34d399, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              boxShadow: isEdit
                ? "0 4px 12px rgba(99, 102, 241, 0.3)"
                : "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            {isEdit ? "✎" : "+"}
          </Box>
          {isEdit ? "Edit Task" : "Create Task"}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 2.5 }, mt: 1, px: { xs: 2, sm: 3 } }}>
        <TextField
          autoFocus
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError(false);
          }}
          error={titleError}
          helperText={titleError ? "Title is required" : ""}
          fullWidth
          required
          margin="dense"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="dense"
        />
        <TextField
          select
          label="Column"
          value={column}
          onChange={(e) => setColumn(e.target.value as ColumnId)}
          fullWidth
          margin="dense"
        >
          {COLUMNS.map((col) => (
            <MenuItem
              key={col.id}
              value={col.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1.2,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: col.color,
                  boxShadow: `0 0 6px ${col.color}44`,
                  flexShrink: 0,
                }}
              />
              {col.title}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: 1, gap: 1, flexDirection: { xs: "column", sm: "row" }, "& > button": { width: { xs: "100%", sm: "auto" } } }}>
        <Button
          onClick={onClose}
          sx={{
            color: "text.secondary",
            borderRadius: "10px",
            px: 2.5,
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.04)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            borderRadius: "10px",
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
