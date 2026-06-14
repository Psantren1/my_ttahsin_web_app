import { cookies } from 'next/headers';
import { verifyJWT, signJWT } from './jwt';

const SESSION_COOKIE_NAME = 'baitul_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MUSYRIF' | 'SANTRI';
  exp: number;
}

export async function createSession(user: {
  id: string;
  email: string;
  full_name: string;
  role: string;
}): Promise<string> {
  const session: Session = {
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role as 'ADMIN' | 'MUSYRIF' | 'SANTRI',
    exp: Date.now() + SESSION_DURATION,
  };

  return signJWT(session as unknown as Record<string, unknown>);
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) return null;

    const decoded = verifyJWT(sessionCookie.value);
    if (!decoded) return null;

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      fullName: decoded.fullName as string,
      role: decoded.role as 'ADMIN' | 'MUSYRIF' | 'SANTRI',
      exp: decoded.exp as number,
    };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function canAccess(role: string, path: string): boolean {
  const permissions: Record<string, string[]> = {
    ADMIN: ['/dashboard/admin', '/dashboard/musyrif', '/dashboard/santri', '/api'],
    MUSYRIF: ['/dashboard/musyrif'],
    SANTRI: ['/dashboard/santri'],
  };

  const allowedPaths = permissions[role] || [];
  return allowedPaths.some(pathPattern => path.startsWith(pathPattern));
}
