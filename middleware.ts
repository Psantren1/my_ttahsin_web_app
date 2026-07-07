import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/auth/jwt';

const publicRoutes = ['/login', '/register', '/forgot-password'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/debug'];

function getSession(request: NextRequest): { id: string; email: string; fullName: string; role: string } | null {
  try {
    const cookie = request.cookies.get('baitul_session');
    if (!cookie?.value) return null;

    const decoded = verifyJWT(cookie.value);
    if (!decoded) return null;

    return {
      id: decoded.id as string,
      email: decoded.email as string,
      fullName: decoded.fullName as string,
      role: decoded.role as string,
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static files and public pages
  if (publicRoutes.some(route => pathname === route) || pathname === '/') {
    return NextResponse.next();
  }

  // Allow public API endpoints (login, register)
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = getSession(request);

  // API routes — require valid session
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized — silakan login terlebih dahulu' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Dashboard routes — require valid session, redirect to login if not
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
