import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername, hashPassword } from '@/lib/services/user.service';

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

    if (!user || user.password_hash !== hashPassword(password)) {
      return NextResponse.json(
        { error: 'Email/username atau password salah' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Akun telah dinonaktifkan' },
        { status: 403 }
      );
    }

    const sessionToken = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })).toString('base64');

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
