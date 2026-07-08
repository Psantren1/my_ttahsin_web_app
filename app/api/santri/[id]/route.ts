import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/services/user.service';
import { getSession, requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF', 'SANTRI']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    if (session.role === 'SANTRI' && session.userId !== params.id) {
      return NextResponse.json({ error: 'Akses ditolak — Anda hanya dapat melihat data sendiri' }, { status: 403 });
    }

    const user = await getUserById(params.id);
    if (!user || user.role !== 'SANTRI') {
      return NextResponse.json({ error: 'Santri tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data santri' }, { status: 500 });
  }
}

const DUPLICATE_MESSAGES: Record<string, string> = {
  DUPLICATE_EMAIL: 'Email sudah digunakan oleh akun lain',
  DUPLICATE_USERNAME: 'Username sudah digunakan oleh akun lain',
  DUPLICATE_NIS: 'NIS sudah digunakan oleh siswa lain',
  DUPLICATE_NIP: 'NIP sudah digunakan oleh guru lain',
};

function requireAdmin(session: any): NextResponse | null {
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Hanya admin yang dapat melakukan operasi ini' }, { status: 403 });
  }
  return null;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const denied = requireAdmin(session);
    if (denied) return denied;

    const body = await request.json();
    const oldUser = await getUserById(params.id);
    const user = await updateUser(params.id, body);
    if (!user) {
      return NextResponse.json({ error: 'Santri tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session!.userId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: params.id,
      oldValues: oldUser ? { full_name: oldUser.full_name, email: oldUser.email, nis: oldUser.nis, kelas_id: oldUser.kelas_id, is_active: oldUser.is_active } : null,
      newValues: { full_name: body.full_name, email: body.email, nis: body.nis, kelas_id: body.kelas_id, is_active: body.is_active },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: user });
  } catch (error: any) {
    const msg = DUPLICATE_MESSAGES[error.message];
    if (msg) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal mengupdate santri' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const denied = requireAdmin(session);
    if (denied) return denied;

    const oldUser = await getUserById(params.id);
    await deleteUser(params.id);
    await createAuditLog({
      userId: session!.userId,
      action: 'DELETE',
      entityType: 'user',
      entityId: params.id,
      oldValues: oldUser ? { full_name: oldUser.full_name, email: oldUser.email, role: oldUser.role } : null,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus santri' }, { status: 500 });
  }
}
