import { IndexedEntity } from "./core-utils";
import type { User, Task } from "@shared/types";
// A mock user to ensure the app has data on first load without real auth
const MOCK_USER: User = {
  id: "mock-user-id",
  name: "Default User",
  tasks: [
    { id: "task-1", title: "Build the UI", category: "work", completedPomodoros: 1 },
    { id: "task-2", title: "Read a book", category: "leisure", completedPomodoros: 0 },
    { id: "task-3", title: "Sketch an idea", category: "creative", completedPomodoros: 2 },
  ],
};
export class WowUserEntity extends IndexedEntity<User> {
  static readonly entityName = "wow-user";
  static readonly indexName = "wow-users";
  static readonly initialState: User = { id: "", name: "", tasks: [] };
  static seedData = [MOCK_USER];
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