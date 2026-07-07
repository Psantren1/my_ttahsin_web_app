import { NextRequest, NextResponse } from 'next/server';
import { updateAbsensi, deleteAbsensi } from '@/lib/services/absensi.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const absensi = await updateAbsensi(params.id, body);
    if (!absensi) {
      return NextResponse.json({ error: 'Absensi tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'absensi',
      entityId: params.id,
      newValues: body,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: absensi });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate absensi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    await deleteAbsensi(params.id);

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'absensi',
      entityId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus absensi' }, { status: 500 });
  }
}
