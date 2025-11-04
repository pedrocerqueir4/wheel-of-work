import { ApiResponse } from "../../shared/types";
const apiHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};
/**
 * Sets the authorization header for all subsequent API requests.
 * @param userId The user's ID to include in the 'X-User-Id' header. Pass null to clear.
 */
export function setApiAuthHeader(userId: string | null) {
  if (userId) {
    apiHeaders['X-User-Id'] = userId;
  } else {
    delete apiHeaders['X-User-Id'];
  }
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { ...apiHeaders, ...init?.headers } });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}