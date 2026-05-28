// Simple session token for single-admin internal tool.
// Token is derived from env vars; rotating ADMIN_SESSION_SECRET invalidates all sessions.

export function getAdminSessionToken(): string {
  const email = process.env.ADMIN_EMAIL ?? '';
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  // btoa is available in Node.js 16+ and Edge Runtime
  return btoa(`${email}:${secret}`).replace(/=/g, '');
}

export function verifyAdminSession(token: string): boolean {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  return token === getAdminSessionToken();
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
