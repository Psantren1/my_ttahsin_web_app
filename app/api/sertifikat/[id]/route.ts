import { NextRequest, NextResponse } from 'next/server';
import { updateSertifikat, deleteSertifikat } from '@/lib/services/sertifikat.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const sertifikat = await updateSertifikat(params.id, body);
    if (!sertifikat) {
      return NextResponse.json({ error: 'Sertifikat tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'sertifikat',
      entityId: params.id,
      newValues: body,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: sertifikat });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate sertifikat' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    await deleteSertifikat(params.id);

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'sertifikat',
      entityId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus sertifikat' }, { status: 500 });
  }
}
