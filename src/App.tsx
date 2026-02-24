import { Box, AppBar, Toolbar, Typography, Container, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
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

// Light theme with custom primary color
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: { borderRadius: 8 },
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
        <AppBar position="sticky" elevation={1} color="default" sx={{ bgcolor: "white" }}>
          <Toolbar sx={{ gap: 2 }}>
            <ViewKanbanIcon color="primary" />
            <Typography variant="h6" fontWeight={700} sx={{ flexShrink: 0 }}>
              Kanban Board
            </Typography>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <SearchBar />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Container maxWidth={false} disableGutters>
          <KanbanBoard />
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
