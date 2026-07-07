import { NextRequest, NextResponse } from 'next/server';
import { getAllBtqLanjutan, getBtqLanjutanByKelas, getBtqLanjutanBySantri, getBtqLanjutanByMusyrif, upsertBtqLanjutan } from '@/lib/services/btq-lanjutan.service';
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
      const record = await getBtqLanjutanBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getBtqLanjutanByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getBtqLanjutanByKelas(kelas_id);
    } else {
      data = await getAllBtqLanjutan();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data BTQ Lanjutan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const data = await upsertBtqLanjutan(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'btq_lanjutan',
      entityId: data.id,
      newValues: {
        santuario_id: body.santuario_id,
        level: body.level,
        juz_surah: body.juz_surah,
        nilai: body.nilai,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data BTQ Lanjutan' }, { status: 500 });
  }
}
