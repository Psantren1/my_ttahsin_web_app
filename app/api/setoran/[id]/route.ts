import { NextRequest, NextResponse } from 'next/server';
import { getSetoranById, updateSetoran, deleteSetoran } from '@/lib/services/hafalan.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const setoran = await getSetoranById(params.id);
    if (!setoran) {
      return NextResponse.json({ error: 'Setoran tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: setoran });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data setoran' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const setoran = await updateSetoran(params.id, body);
    if (!setoran) {
      return NextResponse.json({ error: 'Setoran tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'setoran',
      entityId: params.id,
      newValues: body,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: setoran });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate setoran' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    await deleteSetoran(params.id);

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'setoran',
      entityId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus setoran' }, { status: 500 });
  }
}
