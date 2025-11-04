import { Hono } from "hono";
import type { Env } from './core-utils';
import { WowUserEntity, UserWithPassword } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Task, TaskCategory, User, RegisterPayload, LoginPayload } from "@shared/types";
// --- Web Crypto API Helpers for Password Hashing ---
// Use PBKDF2 for key derivation, a standard for password hashing.
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const HASH_ALGORITHM = 'SHA-256';
/**
 * Hashes a password with a new salt.
 * @returns The salt and hash, concatenated and hex-encoded.
 */
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGORITHM }, keyMaterial, 256);
  const hash = new Uint8Array(derivedBits);
  const saltAndHash = new Uint8Array(salt.length + hash.length);
  saltAndHash.set(salt, 0);
  saltAndHash.set(hash, salt.length);
  // Convert to hex string for storage
  return Array.from(saltAndHash).map(b => b.toString(16).padStart(2, '0')).join('');
}
/**
 * Verifies a password against a stored salt and hash.
 */
async function verifyPassword(password: string, storedSaltAndHashHex: string): Promise<boolean> {
  const saltAndHash = new Uint8Array(storedSaltAndHashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const salt = saltAndHash.slice(0, SALT_LENGTH);
  const hash = saltAndHash.slice(SALT_LENGTH);
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGORITHM }, keyMaterial, 256);
  const derivedHash = new Uint8Array(derivedBits);
  return crypto.subtle.timingSafeEqual(hash, derivedHash);
}
// Helper to get user ID from a request context
function getUserId(c: any): string | null {
  const userId = c.req.header('X-User-Id');
  return userId || null;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- Authentication Routes ---
  app.post('/api/auth/register', async (c) => {
    const { username, password } = await c.req.json<RegisterPayload>();
    if (!isStr(username) || username.length < 3) return bad(c, 'Username must be at least 3 characters long');
    if (!isStr(password) || password.length < 6) return bad(c, 'Password must be at least 6 characters long');
    const userId = username.toLowerCase();
    const userEntity = new WowUserEntity(c.env, userId);
    if (await userEntity.exists()) return bad(c, 'Username is already taken');
    const passwordHash = await hashPassword(password);
    const newUser: UserWithPassword = {
      id: userId,
      username,
      tasks: [],
      passwordHash,
    };
    await WowUserEntity.create(c.env, newUser);
    const userForClient: User = { id: newUser.id, username: newUser.username, tasks: newUser.tasks };
    return ok(c, userForClient);
  });
  app.post('/api/auth/login', async (c) => {
    const { username, password } = await c.req.json<LoginPayload>();
    if (!isStr(username) || !isStr(password)) return bad(c, 'Username and password are required');
    const userId = username.toLowerCase();
    const userEntity = new WowUserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, 'Invalid username or password');
    const storedUser = await userEntity.getState();
    const isPasswordValid = await verifyPassword(password, storedUser.passwordHash);
    if (!isPasswordValid) return notFound(c, 'Invalid username or password');
    const userForClient: User = { id: storedUser.id, username: storedUser.username, tasks: storedUser.tasks };
    return ok(c, userForClient);
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