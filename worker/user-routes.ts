import { Hono } from "hono";
import type { Env } from './core-utils';
import { WowUserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Task, TaskCategory, User } from "@shared/types";
// Helper to get user ID from a request context (to be replaced by real auth)
function getUserId(c: any): string | null {
  // In a real app, this would come from a JWT or session middleware
  const userId = c.req.header('X-User-Id');
  return userId || null;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- Authentication Routes ---
  app.post('/api/auth/register', async (c) => {
    const { name } = await c.req.json<{ name?: string }>();
    if (!isStr(name) || name.length < 3) {
      return bad(c, 'Username must be at least 3 characters long');
    }
    const userId = name.toLowerCase();
    const userEntity = new WowUserEntity(c.env, userId);
    if (await userEntity.exists()) {
      return bad(c, 'Username is already taken');
    }
    const newUser: User = {
      id: userId,
      name: name,
      tasks: [],
    };
    await WowUserEntity.create(c.env, newUser);
    return ok(c, newUser);
  });
  app.post('/api/auth/login', async (c) => {
    const { name } = await c.req.json<{ name?: string }>();
    if (!isStr(name)) {
      return bad(c, 'Username is required');
    }
    const userId = name.toLowerCase();
    const user = new WowUserEntity(c.env, userId);
    if (!await user.exists()) {
      return notFound(c, 'User not found. Have you registered?');
    }
    return ok(c, await user.getState());
  });
  // --- Task Management Routes (now require user context) ---
  app.get('/api/tasks', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Authentication required');
    const user = new WowUserEntity(c.env, userId);
    if (!await user.exists()) return notFound(c, 'User not found');
    return ok(c, await user.getTasks());
  });
  app.post('/api/tasks', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Authentication required');
    const { title, category } = (await c.req.json()) as { title?: string; category?: TaskCategory };
    if (!isStr(title) || !['work', 'leisure', 'creative'].includes(category as string)) {
      return bad(c, 'Valid title and category are required');
    }
    const user = new WowUserEntity(c.env, userId);
    if (!await user.exists()) return notFound(c, 'User not found');
    const newTask = await user.addTask({ title, category: category! });
    return ok(c, newTask);
  });
  app.delete('/api/tasks/:taskId', async (c) => {
    const userId = getUserId(c);
    if (!userId) return bad(c, 'Authentication required');
    const { taskId } = c.req.param();
    if (!isStr(taskId)) return bad(c, 'Task ID is required');
    const user = new WowUserEntity(c.env, userId);
    if (!await user.exists()) return notFound(c, 'User not found');
    const deleted = await user.deleteTask(taskId);
    if (!deleted) return notFound(c, 'Task not found');
    return ok(c, { id: taskId, deleted });
  });
}