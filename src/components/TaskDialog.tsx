import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
            <MenuItem key={col.id} value={col.id}>
              {col.title}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
