import { Box, AppBar, Toolbar, Typography, Container, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchBar from "./components/SearchBar.tsx";
import KanbanBoard from "./components/KanbanBoard.tsx";

// Create a React Query client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Dark Luxe Glassmorphism theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8" },
    secondary: { main: "#a78bfa" },
    error: { main: "#f87171" },
    warning: { main: "#f59e0b" },
    success: { main: "#34d399" },
    background: {
      default: "#0a0e1a",
      paper: "rgba(255, 255, 255, 0.04)",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h4: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 800,
    },
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    subtitle1: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
    },
    subtitle2: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
    button: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      textTransform: "none" as const,
    },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none" as const,
          fontWeight: 600,
        },
        contained: {
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
          },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.12)",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.24)",
            background: "rgba(255, 255, 255, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(145deg, rgba(17, 24, 39, 0.97), rgba(15, 20, 35, 0.99))",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.08)",
          borderRadius: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.1)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#818cf8",
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.12)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.06)",
            transform: "scale(1.08)",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "rgba(17, 24, 39, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 8,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
  },
});

/**
 * Root application component.
 * Sets up MUI theming, React Query provider, app bar with search, and the Kanban board.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Top navigation bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(10, 14, 26, 0.8)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            zIndex: 10,
          }}
        >
          <Toolbar
            sx={{
              gap: { xs: 1.5, sm: 2.5 },
              px: { xs: 1.5, sm: 2, md: 4 },
              py: 0.5,
              minHeight: { xs: 56, sm: 64 },
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            {/* Logo mark */}
            <Box
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.35)",
                flexShrink: 0,
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: { xs: 17, sm: 20 }, height: { xs: 17, sm: 20 }, fill: "white" }}
              >
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" opacity={0.9} />
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: { xs: "1.05rem", sm: "1.25rem" },
                flexShrink: 0,
                background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                display: { xs: "none", sm: "block" },
              }}
            >
              Kanban Board
            </Typography>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: { xs: "flex-start", sm: "center" },
                order: { xs: 1, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                pb: { xs: 0.5, sm: 0 },
              }}
            >
              <SearchBar />
            </Box>
            {/* Subtle time/status indicator */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#34d399",
                  boxShadow: "0 0 8px rgba(52, 211, 153, 0.5)",
                  animation: "pulseGlow 2s ease-in-out infinite",
                }}
              />
              Online
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Container maxWidth={false} disableGutters sx={{ position: "relative", zIndex: 1 }}>
          <KanbanBoard />
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
