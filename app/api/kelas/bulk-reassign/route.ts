import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { getSession } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';
import { createInformasi } from '@/lib/services/informasi.service';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat memindahkan siswa' }, { status: 403 });
    }

    const { santri_ids, to_kelas_id } = await request.json();

    if (!santri_ids?.length || !to_kelas_id) {
      return NextResponse.json(
        { error: 'Pilih siswa dan kelas tujuan terlebih dahulu' },
        { status: 400 }
      );
    }

    const placeholders = santri_ids.map((_: any, i: number) => `$${i + 2}`).join(', ');
    const result = await query(
      `UPDATE users SET kelas_id = $1, updated_at = NOW() WHERE id IN (${placeholders}) AND role = 'SANTRI' RETURNING id, full_name`,
      [to_kelas_id, ...santri_ids]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'BULK_REASSIGN',
      entityType: 'user',
      newValues: { santri_ids, to_kelas_id, count: result.length },
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    if (result.length > 0) {
      const kelasRow = await queryOne<{ nama: string }>('SELECT nama FROM kelas WHERE id = $1', [to_kelas_id]);
      const kelasNama = kelasRow?.nama || 'Kelas Baru';

      await Promise.all(
        result.map((santri: any) =>
          createInformasi({
            judul: 'Kenaikan Kelas',
            isi: `Anda telah dipindahkan ke kelas ${kelasNama}`,
            target_role: 'SANTRI',
            created_by: session.userId,
          })
        )
      );
    }

    return NextResponse.json({ success: true, count: result.length });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memindahkan siswa' }, { status: 500 });
  }
}
