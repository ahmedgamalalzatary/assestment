import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from "../api/taskApi.ts";
import type { Task, ColumnId } from "../types/task.ts";

const TASKS_KEY = ["tasks"] as const;

/**
 * Custom hook providing React Query integration for task CRUD operations.
 * Includes optimistic updates for drag-and-drop moves.
 */
export function useTasks(search?: string) {
  const queryClient = useQueryClient();

  // Fetch all tasks, optionally filtered by search term
  const tasksQuery = useQuery<Task[]>({
    queryKey: [...TASKS_KEY, search ?? ""],
    queryFn: () => fetchTasks(search),
    staleTime: 30_000, // Cache for 30 seconds
  });

  // Create a new task
  const createMutation = useMutation({
    mutationFn: (task: Omit<Task, "id">) => createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  // Update an existing task
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Omit<Task, "id">>;
    }) => updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  // Delete a task
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  // Move a task between columns with optimistic update
  const moveMutation = useMutation({
    mutationFn: ({ id, column }: { id: number; column: ColumnId }) =>
      moveTask(id, column),
    onMutate: async ({ id, column }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueriesData<Task[]>({
        queryKey: TASKS_KEY,
      });

      // Optimistically update all matching query caches
      queryClient.setQueriesData<Task[]>(
        { queryKey: TASKS_KEY },
        (old) =>
          old?.map((task) =>
            task.id === id ? { ...task, column } : task
          )
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        for (const [queryKey, data] of context.previousTasks) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    moveTask: moveMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
