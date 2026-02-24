# Kanban Board – ToDo List Application

A Kanban-style ToDo list dashboard built with **React**, **TypeScript**, **Zustand**, **React Query**, **Material UI**, and **dnd-kit** for drag-and-drop.

![Kanban Board](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![MUI](https://img.shields.io/badge/Material_UI-6-purple)

## Features

- **4-column Kanban board**: Backlog → In Progress → Review → Done
- **Create, edit, and delete tasks** via intuitive dialogs
- **Drag-and-drop** tasks between columns (powered by dnd-kit)
- **Search** tasks by title or description with debounced input
- **Infinite scroll / pagination** within each column (configurable page size)
- **Optimistic updates** for instant drag-and-drop feedback
- **React Query caching** for efficient data management
- **Zustand** for lightweight global UI state
- **Material UI** for polished, responsive design
- **Mock REST API** via json-server

## Tech Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Framework      | React 19 + TypeScript          |
| State (UI)     | Zustand                        |
| State (Server) | TanStack React Query           |
| UI Library     | Material UI (MUI)              |
| Drag & Drop    | dnd-kit                        |
| HTTP Client    | Axios                          |
| Mock API       | json-server                    |
| Build Tool     | Vite                           |

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd assestment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the mock API server

In one terminal, start json-server:

```bash
npm run server
```

This runs `json-server --watch db.json --port 4000` and serves the REST API at [http://localhost:4000/tasks](http://localhost:4000/tasks).

### 4. Start the development server

In another terminal, start the Vite dev server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Alternative: Run both simultaneously

If you install `concurrently` (`npm install --save-dev concurrently`), you can run both servers with a single command:

```bash
npm run dev:all
```

## Project Structure

```
├── db.json                    # Mock database for json-server
├── src/
│   ├── api/
│   │   └── taskApi.ts         # Axios API service layer
│   ├── components/
│   │   ├── ConfirmDialog.tsx   # Reusable delete confirmation dialog
│   │   ├── KanbanBoard.tsx     # Main board with drag-and-drop context
│   │   ├── KanbanColumn.tsx    # Single column with infinite scroll
│   │   ├── SearchBar.tsx       # Debounced search input
│   │   ├── TaskCard.tsx        # Draggable task card
│   │   └── TaskDialog.tsx      # Create/edit task form dialog
│   ├── hooks/
│   │   └── useTasks.ts         # React Query hooks for CRUD operations
│   ├── store/
│   │   └── useAppStore.ts      # Zustand store for UI state
│   ├── types/
│   │   └── task.ts             # TypeScript types and constants
│   ├── App.tsx                 # Root component with providers
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Endpoints (json-server)

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | `/tasks`             | List all tasks    |
| GET    | `/tasks?q=keyword`   | Search tasks      |
| GET    | `/tasks/:id`         | Get a single task |
| POST   | `/tasks`             | Create a task     |
| PATCH  | `/tasks/:id`         | Update a task     |
| DELETE | `/tasks/:id`         | Delete a task     |

## Usage

1. **Add a task**: Click the "Add" button in any column header
2. **Edit a task**: Click the pencil icon on a task card
3. **Delete a task**: Click the trash icon and confirm
4. **Move a task**: Drag a task card from one column to another
5. **Search**: Type in the search bar to filter tasks by title or description
6. **Load more**: Scroll down in a column or click "Load more" to see additional tasks

## Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory, ready for deployment.
