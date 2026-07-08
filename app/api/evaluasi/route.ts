import { NextRequest, NextResponse } from 'next/server';
import { getAllEvaluasi, getEvaluasiBySantri, getEvaluasiByMusyrif, getEvaluasiByPeriode, createEvaluasi } from '@/lib/services/evaluasi.service';
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
    const periode = searchParams.get('periode');

    let data;
    if (session.role === 'SANTRI') {
      data = await getEvaluasiBySantri(session.userId);
    } else if (santuario_id) {
      data = await getEvaluasiBySantri(santuario_id);
    } else if (musyrif_id) {
      data = await getEvaluasiByMusyrif(musyrif_id);
    } else if (periode) {
      data = await getEvaluasiByPeriode(periode);
    } else {
      data = await getAllEvaluasi();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data evaluasi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const evaluasi = await createEvaluasi(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'evaluasi',
      entityId: evaluasi.id,
      newValues: {
        santuario_id: body.santuario_id,
        predikat_adab: body.predikat_adab,
        predikat_kedisiplinan: body.predikat_kedisiplinan,
        catatan: body.catatan,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: evaluasi });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan evaluasi' }, { status: 500 });
  }
}
