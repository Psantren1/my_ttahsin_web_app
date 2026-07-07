import { NextRequest, NextResponse } from 'next/server';
import { deleteBtqPemula } from '@/lib/services/btq-pemula.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const deleted = await deleteBtqPemula(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'btq_pemula',
      entityId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data BTQ Pemula' }, { status: 500 });
  }
}
