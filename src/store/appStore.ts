import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { User, Task, TaskCategory } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
type AppState = {
  user: User | null;
  isLoading: boolean;
  isAuthDialogOpen: boolean;
};
type AppActions = {
  login: () => Promise<void>;
  logout: () => void;
  addTask: (taskData: { title: string; category: TaskCategory }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
};
export const useAppStore = create<AppState & AppActions>()(
  immer((set) => ({
    user: null,
    isLoading: false,
    isAuthDialogOpen: false,
    login: async () => {
      set({ isLoading: true });
      try {
        const user = await api<User>('/api/auth/login', { method: 'POST' });
        set({ user, isLoading: false, isAuthDialogOpen: false });
        toast.success(`Welcome, ${user.name}!`);
      } catch (error) {
        console.error("Login failed:", error);
        toast.error("Login failed. Please try again.");
        set({ isLoading: false });
      }
    },
    logout: () => {
      set({ user: null });
      toast.info("You have been logged out.");
    },
    addTask: async (taskData) => {
      try {
        const newTask = await api<Task>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(taskData),
        });
        set((state) => {
          if (state.user) {
            state.user.tasks.push(newTask);
          }
        });
        toast.success("Task added!");
      } catch (error) {
        console.error("Failed to add task:", error);
        toast.error("Failed to add task. Please try again.");
      }
    },
    deleteTask: async (taskId) => {
      try {
        await api<{ id: string; deleted: boolean }>(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        set((state) => {
          if (state.user) {
            state.user.tasks = state.user.tasks.filter((t) => t.id !== taskId);
          }
        });
        toast.success("Task removed.");
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast.error("Failed to delete task. Please try again.");
      }
    },
    openAuthDialog: () => set({ isAuthDialogOpen: true }),
    closeAuthDialog: () => set({ isAuthDialogOpen: false }),
  }))
);