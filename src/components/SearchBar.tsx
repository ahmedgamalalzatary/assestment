import { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAppStore } from "../store/useAppStore.ts";

/**
 * Search bar component that filters tasks by title or description.
 * Uses debouncing to avoid excessive API calls while typing.
 */
export default function SearchBar() {
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const [localValue, setLocalValue] = useState("");

  // Debounce: update global search query 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localValue.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [localValue, setSearchQuery]);

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search tasks…"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        maxWidth: { xs: "100%", sm: 420 },
        width: "100%",
        "& .MuiOutlinedInput-root": {
          bgcolor: "rgba(255, 255, 255, 0.04)",
          borderRadius: "12px",
          fontSize: "0.875rem",
          transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.06)",
          },
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.06)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.12)",
            },
          },
          "&.Mui-focused": {
            bgcolor: "rgba(255, 255, 255, 0.06)",
            boxShadow: "0 0 0 3px rgba(129, 140, 248, 0.12)",
            "& fieldset": {
              borderColor: "#818cf8 !important",
              borderWidth: "1.5px !important",
            },
          },
        },
        "& .MuiOutlinedInput-input": {
          "&::placeholder": {
            color: "#64748b",
            opacity: 1,
          },
        },
      }}
    />
  );
}
