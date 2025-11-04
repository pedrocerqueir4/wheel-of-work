import { Hono } from "hono";
import type { Env } from './core-utils';
import { WowUserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Task, TaskCategory } from "@shared/types";
// For this phase, we'll use a hardcoded mock user ID.
const MOCK_USER_ID = "mock-user-id";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Mock Authentication
  app.post('/api/auth/login', async (c) => {
    await WowUserEntity.ensureSeed(c.env);
    const user = new WowUserEntity(c.env, MOCK_USER_ID);
    if (!await user.exists()) {
        return notFound(c, 'User not found');
    }
    return ok(c, await user.getState());
  });
  // Task Management
  app.get('/api/tasks', async (c) => {
    const user = new WowUserEntity(c.env, MOCK_USER_ID);
    if (!await user.exists()) return notFound(c, 'User not found');
    return ok(c, await user.getTasks());
  });
  app.post('/api/tasks', async (c) => {
    const { title, category } = (await c.req.json()) as { title?: string; category?: TaskCategory };
    if (!isStr(title) || !['work', 'leisure', 'creative'].includes(category as string)) {
      return bad(c, 'Valid title and category are required');
    }
    const user = new WowUserEntity(c.env, MOCK_USER_ID);
    if (!await user.exists()) return notFound(c, 'User not found');
    const newTask = await user.addTask({ title, category: category! });
    return ok(c, newTask);
  });
  app.delete('/api/tasks/:taskId', async (c) => {
    const { taskId } = c.req.param();
    if (!isStr(taskId)) return bad(c, 'Task ID is required');
    const user = new WowUserEntity(c.env, MOCK_USER_ID);
    if (!await user.exists()) return notFound(c, 'User not found');
    const deleted = await user.deleteTask(taskId);
    if (!deleted) return notFound(c, 'Task not found');
    return ok(c, { id: taskId, deleted });
  });
}