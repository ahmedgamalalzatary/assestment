import axios from "axios";
import type { Task, ColumnId } from "../types/task.ts";

const API_URL = "http://localhost:4000/tasks";

/**
 * Fetch all tasks from the API.
 * Supports optional search query filtering on title and description.
 */
export async function fetchTasks(search?: string): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (search) {
    params.q = search;
  }
  const response = await axios.get<Task[]>(API_URL, { params });
  return response.data;
}

/**
 * Create a new task via the API.
 */
export async function createTask(
  task: Omit<Task, "id">
): Promise<Task> {
  const response = await axios.post<Task>(API_URL, task);
  return response.data;
}

/**
 * Update an existing task by ID.
 */
export async function updateTask(
  id: number,
  updates: Partial<Omit<Task, "id">>
): Promise<Task> {
  const response = await axios.patch<Task>(`${API_URL}/${id}`, updates);
  return response.data;
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}

/**
 * Move a task to a different column.
 */
export async function moveTask(
  id: number,
  column: ColumnId
): Promise<Task> {
  return updateTask(id, { column });
}
