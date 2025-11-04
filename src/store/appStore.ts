import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Task, TaskCategory, WheelMode, LoginPayload, RegisterPayload } from '@shared/types';
import { api, setApiAuthHeader } from '@/lib/api-client';
import { toast } from 'sonner';
import { triggerConfetti } from '@/lib/confetti';
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
  advancedModeCategories: Record<TaskCategory, boolean>;
};
type AppActions = {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  addTask: (taskData: { title: string; category: TaskCategory }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
  setWheelMode: (mode: WheelMode) => void;
  toggleAdvancedCategory: (category: TaskCategory) => void;
  spinWheel: () => Task | null;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  completeTask: () => void;
  pullLeisureTask: () => void;
  _tick: () => void;
};
let timerInterval: NodeJS.Timeout | null = null;
const getApiOptions = (user: User | null) => {
  if (!user) return {};
  // Header is now set globally via setApiAuthHeader, but we keep this for potential future use
  // or if a specific call needs to override it. For now, it's redundant but harmless.
  return { headers: { 'X-User-Id': user.id } };
};
export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set, get) => ({
      user: null,
      isLoading: false,
      isAuthDialogOpen: false,
      wheelMode: 'normal',
      taskQueue: [],
      pomodoroState: 'idle',
      timer: POMODORO_DURATION,
      currentTaskInSession: null,
      advancedModeCategories: {
        work: true,
        leisure: true,
        creative: true,
      },
      login: async (payload) => {
        set({ isLoading: true });
        try {
          const user = await api<User>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          set({ user, isLoading: false, isAuthDialogOpen: false });
          toast.success(`Welcome back, ${user.username}!`);
        } catch (error) {
          console.error("Login failed:", error);
          toast.error((error as Error).message || "Login failed. Please try again.");
          set({ isLoading: false });
        }
      },
      register: async (payload) => {
        set({ isLoading: true });
        try {
          const user = await api<User>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          set({ user, isLoading: false, isAuthDialogOpen: false });
          toast.success(`Welcome, ${user.username}! Your account is created.`);
        } catch (error) {
          console.error("Registration failed:", error);
          toast.error((error as Error).message || "Registration failed. Please try again.");
          set({ isLoading: false });
        }
      },
      logout: () => {
        get().pausePomodoro();
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
        const { user } = get();
        if (!user) return;
        try {
          const newTask = await api<Task>('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
            ...getApiOptions(user),
          });
          set((state) => {
            state.user?.tasks.push(newTask);
          });
          toast.success("Task added!");
        } catch (error) {
          console.error("Failed to add task:", error);
          toast.error("Failed to add task. Please try again.");
        }
      },
      deleteTask: async (taskId) => {
        const { user } = get();
        if (!user) return;
        try {
          await api(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            ...getApiOptions(user),
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
      toggleAdvancedCategory: (category) => {
        set(state => {
          state.advancedModeCategories[category] = !state.advancedModeCategories[category];
        });
      },
      spinWheel: () => {
        const { user, wheelMode, taskQueue, advancedModeCategories } = get();
        if (!user) return null;
        let availableTasks: Task[] = [];
        switch (wheelMode) {
          case 'hard-working':
            availableTasks = user.tasks.filter(t => t.category === 'work');
            break;
          case 'time-to-work':
            availableTasks = user.tasks.filter(t => t.category === 'work' || t.category === 'creative');
            break;
          case 'advanced':
            const enabledCategories = Object.entries(advancedModeCategories)
              .filter(([, isEnabled]) => isEnabled)
              .map(([cat]) => cat as TaskCategory);
            if (enabledCategories.length === 0) {
              toast.error("No categories selected in Advanced mode.");
              return null;
            }
            availableTasks = user.tasks.filter(t => enabledCategories.includes(t.category));
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
        const { pomodoroState, taskQueue } = get();
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
        triggerConfetti();
        toast.success(`Completed: ${currentTaskInSession.title}! Time for a break.`);
        set(state => {
          const taskInUserList = state.user?.tasks.find(t => t.id === currentTaskInSession.id);
          if (taskInUserList) {
            taskInUserList.completedPomodoros += 1;
          }
          state.taskQueue.shift();
          state.pomodoroState = 'break';
          state.timer = SHORT_BREAK_DURATION;
          state.currentTaskInSession = null;
        });
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
        const leisureTaskIndexInQueue = taskQueue.findIndex((task, index) => task.category === 'leisure' && index > 0);
        if (leisureTaskIndexInQueue !== -1) {
          const taskToPromote = taskQueue[leisureTaskIndexInQueue];
          set(state => {
            state.taskQueue.splice(leisureTaskIndexInQueue, 1);
            state.taskQueue.unshift(taskToPromote);
          });
          toast.success(`Break time! Moved "${taskToPromote.title}" to the front.`);
          return;
        }
        const queuedTaskIds = new Set(taskQueue.map(t => t.id));
        const availableLeisureTasks = user.tasks.filter(t => t.category === 'leisure' && !queuedTaskIds.has(t.id));
        if (availableLeisureTasks.length > 0) {
          const taskToPull = availableLeisureTasks[Math.floor(Math.random() * availableLeisureTasks.length)];
          set(state => {
            state.taskQueue.unshift(taskToPull);
          });
          toast.success(`Break time! Added "${taskToPull.title}" to the queue.`);
        } else {
          toast.warning("No available leisure tasks to pull!");
        }
      },
      _tick: () => {
        set(state => {
          if (state.timer > 0) {
            state.timer -= 1;
          } else {
            get().completeTask();
          }
        });
      },
    })),
    {
      name: 'wow-user-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          setApiAuthHeader(state.user.id);
        }
      },
      // This listener ensures that when the user logs in/out, the API header is updated.
      // It triggers on any state change, but we only act if the user object's reference changes.
      onStateChange: (state, oldState) => {
        if (state.user !== oldState.user) {
          setApiAuthHeader(state.user?.id ?? null);
        }
      },
    }
  )
);
// Initialize the auth header on initial load
const initialUser = useAppStore.getState().user;
if (initialUser) {
  setApiAuthHeader(initialUser.id);
}