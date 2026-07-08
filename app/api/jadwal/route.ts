import { NextRequest, NextResponse } from 'next/server';
import { getAllJadwal, getJadwalByHari, getJadwalByKelas, getJadwalByMusyrif, createJadwal } from '@/lib/services/jadwal.service';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF', 'SANTRI']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const hari = searchParams.get('hari');
    const kelas_id = searchParams.get('kelas_id');
    const musyrif_id = searchParams.get('musyrif_id');

    let data;
    if (hari) {
      data = await getJadwalByHari(hari as any);
    } else if (kelas_id) {
      data = await getJadwalByKelas(kelas_id);
    } else if (musyrif_id) {
      data = await getJadwalByMusyrif(musyrif_id);
    } else {
      data = await getAllJadwal();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data jadwal' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    const jadwal = await createJadwal(body);

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'jadwal',
      entityId: jadwal.id,
      newValues: {
        sesi: body.sesi,
        hari: body.hari,
        jam_mulai: body.jam_mulai,
        jam_selesai: body.jam_selesai,
        kelas_id: body.kelas_id,
        musyrif_id: body.musyrif_id,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data: jadwal });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan jadwal' }, { status: 500 });
  }
}
