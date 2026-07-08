import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername, verifyPassword, hashPassword } from '@/lib/services/user.service';
import { query } from '@/lib/db/client';
import { signJWT } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email atau username
    let user = await getUserByEmail(email);
    if (!user) {
      user = await getUserByUsername(email);
    }

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Email/username atau password salah' },
        { status: 401 }
      );
    }

    // Auto-upgrade legacy SHA-256 hash to bcrypt
    if (!user.password_hash.startsWith('$2')) {
      const bcryptHash = hashPassword(password);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [bcryptHash, user.id]);
      user.password_hash = bcryptHash;
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Akun telah dinonaktifkan' },
        { status: 403 }
      );
    }

    const sessionToken = signJWT({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });

    response.cookies.set('baitul_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('baitul_session');
  return response;
}
