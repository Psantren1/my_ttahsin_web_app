import { NextRequest, NextResponse } from 'next/server';
import { getAllInformasi, createInformasi } from '@/lib/services/informasi.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetRole = searchParams.get('target_role');

    const data = await getAllInformasi(targetRole || undefined);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data informasi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const informasi = await createInformasi({
      judul: body.judul,
      isi: body.isi,
      target_role: body.target_role,
      created_by: session.userId,
    });

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'informasi',
      entityId: informasi.id,
      newValues: {
        judul: body.judul,
        target_role: body.target_role,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: informasi });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan informasi' }, { status: 500 });
  }
}
