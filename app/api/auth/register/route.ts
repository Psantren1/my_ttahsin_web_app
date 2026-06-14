import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/services/user.service';
import { getSession } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Only admin can create users via this endpoint
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat mendaftarkan akun baru' },
        { status: 403 }
      );
    }

    const { email, password, full_name, role, nis, nip, kelas_id } = await request.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Email, password, nama, dan role wajib diisi' },
        { status: 400 }
      );
    }

    if (role === 'SANTRI' && !nis) {
      return NextResponse.json(
        { error: 'NIS wajib diisi untuk santri' },
        { status: 400 }
      );
    }

    if (role === 'MUSYRIF' && !nip) {
      return NextResponse.json(
        { error: 'NIP wajib diisi untuk musyrif' },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const user = await createUser({ email, password, full_name, role, nis, nip, kelas_id });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
