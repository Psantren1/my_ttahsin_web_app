import { NextRequest, NextResponse } from 'next/server';
import { getAllTahfidz, getTahfidzByKelas, getTahfidzBySantri, getTahfidzByMusyrif, upsertTahfidz } from '@/lib/services/tahfidz.service';
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
      const record = await getTahfidzBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getTahfidzByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getTahfidzByKelas(kelas_id);
    } else {
      data = await getAllTahfidz();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data Tahfidz' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const data = await upsertTahfidz(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'tahfidz',
      entityId: data.id,
      newValues: {
        santuario_id: body.santuario_id,
        juz: body.juz,
        surat: body.surat,
        nilai: body.nilai,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data Tahfidz' }, { status: 500 });
  }
}
