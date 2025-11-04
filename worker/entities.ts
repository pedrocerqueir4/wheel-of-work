import { IndexedEntity } from "./core-utils";
import type { User, Task } from "@shared/types";
// This is the shape of the data stored in the Durable Object, including the password hash.
export interface UserWithPassword extends User {
  passwordHash: string;
}
export class WowUserEntity extends IndexedEntity<UserWithPassword> {
  static readonly entityName = "wow-user";
  static readonly indexName = "wow-users";
  static readonly initialState: UserWithPassword = { id: "", username: "", tasks: [], passwordHash: "" };
  // Correct the signature to be compatible with the base class generic constraint.
  // The user's ID is the key, which is derived from the username.
  static override keyOf(state: { id: string }): string {
    return state.id;
  }
  async getTasks(): Promise<Task[]> {
    const { tasks } = await this.getState();
    return tasks;
  }
  async addTask(task: Omit<Task, 'id' | 'completedPomodoros'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completedPomodoros: 0
    };
    await this.mutate(s => ({ ...s, tasks: [...s.tasks, newTask] }));
    return newTask;
  }
  async deleteTask(taskId: string): Promise<boolean> {
    const user = await this.getState();
    const initialLength = user.tasks.length;
    const updatedTasks = user.tasks.filter(t => t.id !== taskId);
    if (initialLength === updatedTasks.length) {
      return false;
    }
    await this.save({ ...user, tasks: updatedTasks });
    return true;
  }
}