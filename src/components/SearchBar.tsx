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
      placeholder="Search tasks by title or description…"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      sx={{ maxWidth: 500 }}
    />
  );
}
