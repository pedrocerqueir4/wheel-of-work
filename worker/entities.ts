import { IndexedEntity } from "./core-utils";
import type { User, Task } from "@shared/types";
export class WowUserEntity extends IndexedEntity<User> {
  static readonly entityName = "wow-user";
  static readonly indexName = "wow-users";
  static readonly initialState: User = { id: "", name: "", tasks: [] };
  // Override keyOf to use name as the unique ID for login purposes
  static override keyOf(state: User): string {
    return state.name.toLowerCase();
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