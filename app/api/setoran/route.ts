import { NextRequest, NextResponse } from 'next/server';
import { getAllSetoran, getSetoranBySantri, getSetoranByMusyrif, createSetoran } from '@/lib/services/hafalan.service';
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

    let data;
    if (session.role === 'SANTRI') {
      data = await getSetoranBySantri(session.userId);
    } else if (santuario_id) {
      data = await getSetoranBySantri(santuario_id);
    } else if (musyrif_id) {
      data = await getSetoranByMusyrif(musyrif_id);
    } else {
      data = await getAllSetoran();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data setoran' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const setoran = await createSetoran(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'setoran',
      entityId: setoran.id,
      newValues: {
        santuario_id: body.santuario_id,
        surah: body.surah,
        tajwid_score: body.tajwid_score,
        makhraj_score: body.makhraj_score,
        kelancaran_score: body.kelancaran_score,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: setoran });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan setoran' }, { status: 500 });
  }
}
