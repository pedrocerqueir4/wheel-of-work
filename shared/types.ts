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
}
export type WheelMode = 'hard-working' | 'time-to-work' | 'normal' | 'advanced';
export interface User {
  id: string;
  username: string;
  tasks: Task[];
}
// Payloads for authentication to avoid passing passwords in the main User model
export interface LoginPayload {
  username: string;
  password: string;
}
export type RegisterPayload = LoginPayload;