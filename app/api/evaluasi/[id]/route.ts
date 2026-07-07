import { NextRequest, NextResponse } from 'next/server';
import { updateEvaluasi, deleteEvaluasi } from '@/lib/services/evaluasi.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const evaluasi = await updateEvaluasi(params.id, body);
    if (!evaluasi) {
      return NextResponse.json({ error: 'Evaluasi tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'evaluasi',
      entityId: params.id,
      newValues: body,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: evaluasi });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate evaluasi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    await deleteEvaluasi(params.id);

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'evaluasi',
      entityId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus evaluasi' }, { status: 500 });
  }
}
