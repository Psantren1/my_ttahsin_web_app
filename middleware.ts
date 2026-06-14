import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/forgot-password'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

function getSession(request: NextRequest): { id: string; email: string; fullName: string; role: string } | null {
  try {
    const cookie = request.cookies.get('baitul_session');
    if (!cookie?.value) return null;

    const parts = cookie.value.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return null;

    return { id: payload.id, email: payload.email, fullName: payload.fullName, role: payload.role };
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
