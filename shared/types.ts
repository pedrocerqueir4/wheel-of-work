export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type TaskCategory = 'work' | 'leisure' | 'creative';
export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  completedPomodoros: number;
  duration?: number; // Optional custom duration in minutes
}
export interface CompletedTask extends Task {
  completedAt: number; // Timestamp of completion
}
export type WheelMode = 'hard-working' | 'time-to-work' | 'normal' | 'advanced';
export interface User {
  id: string;
  username: string;
  tasks: Task[];
  completedTasks: CompletedTask[];
}
// Payloads for authentication to avoid passing passwords in the main User model
export interface LoginPayload {
  username: string;
  password: string;
}
export type RegisterPayload = LoginPayload;