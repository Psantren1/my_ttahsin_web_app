import { NextRequest, NextResponse } from 'next/server';
import { getAllMurojaah, getMurojaahByKelas, getMurojaahBySantri, getMurojaahByMusyrif, upsertMurojaah } from '@/lib/services/murojaah.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const musyrif_id = searchParams.get('musyrif_id');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (santuario_id) {
      const record = await getMurojaahBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getMurojaahByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getMurojaahByKelas(kelas_id);
    } else {
      data = await getAllMurojaah();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data Murojaah' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const data = await upsertMurojaah(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'murojaah',
      entityId: data.id,
      newValues: {
        santuario_id: body.santuario_id,
        juz: body.juz,
        surah: body.surah,
        nilai: body.nilai,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data Murojaah' }, { status: 500 });
  }
}
