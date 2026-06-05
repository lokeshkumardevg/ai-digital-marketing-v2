// ============================================================
// auth.ts  —  Simple localStorage-based auth helper
// Used by Register.tsx (write) and Campaigns.tsx (read)
// ============================================================

const AUTH_USER_KEY = 'auth_user';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

/** Save logged-in user to localStorage */
export const saveAuthUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {}
};

/** Read logged-in user from localStorage (null if not logged in) */
export const getAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate shape — must have _id at minimum
    if (!parsed?._id) return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
};

/** Clear user on logout */
export const clearAuthUser = (): void => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('access_token');
  } catch {}
};