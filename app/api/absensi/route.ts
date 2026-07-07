import { NextRequest, NextResponse } from 'next/server';
import { getAllAbsensi, getAbsensiBySantri, getAbsensiByDate, getAbsensiByKelas, createAbsensi, upsertAbsensi } from '@/lib/services/absensi.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const tanggal = searchParams.get('tanggal');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (santuario_id) {
      data = await getAbsensiBySantri(santuario_id);
    } else if (tanggal) {
      data = await getAbsensiByDate(tanggal);
    } else if (kelas_id) {
      data = await getAbsensiByKelas(kelas_id);
    } else {
      data = await getAllAbsensi();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data absensi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    let absensi;

    if (body.upsert) {
      absensi = await upsertAbsensi(body);
    } else {
      absensi = await createAbsensi(body);
    }

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'absensi',
      entityId: absensi.id,
      newValues: {
        santuario_id: body.santuario_id,
        tanggal: body.tanggal,
        status: body.status,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: absensi });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan absensi' }, { status: 500 });
  }
}
