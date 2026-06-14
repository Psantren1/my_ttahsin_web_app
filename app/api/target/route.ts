import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/client';

export interface TargetTahsin {
  id: string;
  santuario_id: string;
  surah: string;
  ayat_start: number | null;
  ayat_end: number | null;
  juz: number | null;
  progres: number;
  target_date: string;
  status: 'BELUM' | 'SELESAI' | 'TERLAMBAT';
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT t.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama
      FROM target_Tahsin t
      JOIN users u ON t.santuario_id = u.id
      LEFT JOIN kelas k ON u.kelas_id = k.id
    `;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (santuario_id) {
      conditions.push(`t.santuario_id = $${params.length + 1}`);
      params.push(santuario_id);
    }
    if (status) {
      conditions.push(`t.status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY t.target_date DESC';

    const data = await query(sql, params);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data target' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sql = `
      INSERT INTO target_Tahsin (santuario_id, surah, ayat_start, ayat_end, juz, progres, target_date, status, catatan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const data = await queryOne<TargetTahsin>(sql, [
      body.santuario_id, body.surah, body.ayat_start ?? null, body.ayat_end ?? null,
      body.juz ?? null, body.progres ?? 0, body.target_date, body.status ?? 'BELUM', body.catatan ?? null
    ]);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan target' }, { status: 500 });
  }
}
