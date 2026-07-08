import { NextRequest, NextResponse } from 'next/server';
import { getAllBtqPemula, getBtqPemulaByKelas, getBtqPemulaBySantri, getBtqPemulaByMusyrif, upsertBtqPemula } from '@/lib/services/btq-pemula.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF', 'SANTRI']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const musyrif_id = searchParams.get('musyrif_id');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (session.role === 'SANTRI') {
      const record = await getBtqPemulaBySantri(session.userId);
      data = record ? [record] : [];
    } else if (santuario_id) {
      const record = await getBtqPemulaBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getBtqPemulaByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getBtqPemulaByKelas(kelas_id);
    } else {
      data = await getAllBtqPemula();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data BTQ Pemula' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const data = await upsertBtqPemula(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'btq_pemula',
      entityId: data.id,
      newValues: {
        santuario_id: body.santuario_id,
        jilid: body.jilid,
        halaman: body.halaman,
        nilai: body.nilai,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data BTQ Pemula' }, { status: 500 });
  }
}
