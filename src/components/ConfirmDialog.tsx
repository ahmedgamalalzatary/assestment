import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog for destructive actions like deleting a task.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
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
          fontSize: { xs: "1.05rem", sm: "1.15rem" },
          letterSpacing: "-0.02em",
          pt: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          pb: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f87171, #ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            ⚠
          </Box>
          {title}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <DialogContentText
          sx={{
            color: "text.secondary",
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: 1, gap: 1, flexDirection: { xs: "column", sm: "row" }, "& > button": { width: { xs: "100%", sm: "auto" } } }}>
        <Button
          onClick={onCancel}
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
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: "10px",
            px: 3,
            py: 1,
            fontWeight: 600,
            background: "linear-gradient(135deg, #f87171, #ef4444)",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
