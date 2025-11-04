import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { User, Task, TaskCategory, WheelMode } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
const POMODORO_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
type PomodoroState = 'idle' | 'running' | 'paused' | 'break';
type AppState = {
  user: User | null;
  isLoading: boolean;
  isAuthDialogOpen: boolean;
  wheelMode: WheelMode;
  taskQueue: Task[];
  pomodoroState: PomodoroState;
  timer: number;
  currentTaskInSession: Task | null;
};
type AppActions = {
  login: () => Promise<void>;
  logout: () => void;
  addTask: (taskData: { title: string; category: TaskCategory }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
  setWheelMode: (mode: WheelMode) => void;
  spinWheel: () => Task | null;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  completeTask: () => void;
  pullLeisureTask: () => void;
  _tick: () => void;
};
let timerInterval: NodeJS.Timeout | null = null;
export const useAppStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    user: null,
    isLoading: false,
    isAuthDialogOpen: false,
    wheelMode: 'normal',
    taskQueue: [],
    pomodoroState: 'idle',
    timer: POMODORO_DURATION,
    currentTaskInSession: null,
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
      get().pausePomodoro(); // Ensure timer stops on logout
      set({
        user: null,
        taskQueue: [],
        pomodoroState: 'idle',
        timer: POMODORO_DURATION,
        currentTaskInSession: null,
      });
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
    setWheelMode: (mode) => set({ wheelMode: mode }),
    spinWheel: () => {
      const { user, wheelMode, taskQueue } = get();
      if (!user) return null;
      let availableTasks: Task[] = [];
      switch (wheelMode) {
        case 'hard-working':
          availableTasks = user.tasks.filter(t => t.category === 'work');
          break;
        case 'time-to-work':
          availableTasks = user.tasks.filter(t => t.category === 'work' || t.category === 'creative');
          break;
        case 'normal':
        default:
          availableTasks = user.tasks;
          break;
      }
      if (availableTasks.length === 0) {
        toast.error("No tasks available for this mode. Add some tasks first!");
        return null;
      }
      const randomIndex = Math.floor(Math.random() * availableTasks.length);
      const selectedTask = availableTasks[randomIndex];
      set(state => {
        state.taskQueue.push(selectedTask);
      });
      toast.success(`Task selected: ${selectedTask.title}`);
      if (get().pomodoroState === 'idle' && taskQueue.length === 0) {
        setTimeout(() => get().startPomodoro(), 500);
      }
      return selectedTask;
    },
    startPomodoro: () => {
      const { pomodoroState, taskQueue, currentTaskInSession } = get();
      if (pomodoroState === 'running') return;
      if (pomodoroState === 'idle' && taskQueue.length === 0) {
        toast.warning("Add a task to the queue before starting.");
        return;
      }
      if (timerInterval) clearInterval(timerInterval);
      if (pomodoroState === 'idle') {
        set(state => {
            state.currentTaskInSession = state.taskQueue[0];
        });
      }
      set({ pomodoroState: 'running' });
      timerInterval = setInterval(() => get()._tick(), 1000);
    },
    pausePomodoro: () => {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      set({ pomodoroState: 'paused' });
    },
    resetPomodoro: () => {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      set({
        pomodoroState: 'idle',
        timer: POMODORO_DURATION,
        currentTaskInSession: null,
      });
    },
    completeTask: () => {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      const { currentTaskInSession } = get();
      if (!currentTaskInSession) return;
      toast.success(`Completed: ${currentTaskInSession.title}! Time for a break.`);
      set(state => {
        // Update pomodoro count on the original task list
        const taskInUserList = state.user?.tasks.find(t => t.id === currentTaskInSession.id);
        if (taskInUserList) {
          taskInUserList.completedPomodoros += 1;
        }
        // Remove from queue
        state.taskQueue.shift();
        // Start break
        state.pomodoroState = 'break';
        state.timer = SHORT_BREAK_DURATION;
        state.currentTaskInSession = null;
      });
      // After break, go idle or start next task
      setTimeout(() => {
        set(state => {
          state.pomodoroState = 'idle';
          state.timer = POMODORO_DURATION;
        });
        if (get().taskQueue.length > 0) {
          get().startPomodoro();
        }
      }, SHORT_BREAK_DURATION * 1000);
    },
    pullLeisureTask: () => {
      const { user, taskQueue } = get();
      if (!user) return;
      const leisureTasks = user.tasks.filter(t => t.category === 'leisure');
      const queuedTaskIds = new Set(taskQueue.map(t => t.id));
      const availableLeisureTasks = leisureTasks.filter(t => !queuedTaskIds.has(t.id));
      if (availableLeisureTasks.length > 0) {
        const taskToPull = availableLeisureTasks[0];
        set(state => {
          state.taskQueue.unshift(taskToPull);
        });
        toast.success(`Break time! Added "${taskToPull.title}" to the queue.`);
      } else {
        toast.warning("No available leisure tasks to pull!");
      }
    },
    _tick: () => {
      const { timer, completeTask } = get();
      if (timer > 0) {
        set(state => { state.timer -= 1; });
      } else {
        completeTask();
      }
    },
  }))
);