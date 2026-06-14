import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersByRole, createUser } from '@/lib/services/user.service';
import { getSession } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

const DUPLICATE_MESSAGES: Record<string, string> = {
  DUPLICATE_EMAIL: 'Email sudah digunakan oleh akun lain',
  DUPLICATE_USERNAME: 'Username sudah digunakan oleh akun lain',
  DUPLICATE_NIS: 'NIS sudah digunakan oleh siswa lain',
  DUPLICATE_NIP: 'NIP sudah digunakan oleh guru lain',
};

export async function GET() {
  try {
    const musyrif = await getAllUsersByRole('MUSYRIF');
    return NextResponse.json({ data: musyrif });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data musyrif' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat menambahkan musyrif' }, { status: 403 });
    }

    const body = await request.json();
    const user = await createUser({
      email: body.email,
      password: body.password || 'musyrif123',
      full_name: body.full_name,
      role: 'MUSYRIF',
      nip: body.nip,
      username: body.username,
      no_wa: body.no_wa,
      level_program: body.level_program || 'TAHSIN',
    });

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'user',
      entityId: user.id,
      newValues: { email: body.email, full_name: body.full_name, role: 'MUSYRIF', nip: body.nip },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: user });
  } catch (error: any) {
    const msg = DUPLICATE_MESSAGES[error.message];
    if (msg) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Gagal menambahkan musyrif' },
      { status: 500 }
    );
  }
}
