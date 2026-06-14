import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { TargetTahsin } from '../route';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(body)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    if (fields.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data diupdate' }, { status: 400 });
    }

    values.push(params.id);
    const sql = `UPDATE target_Tahsin SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const data = await queryOne<TargetTahsin>(sql, values);
    if (!data) {
      return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate target' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await query<{ id: string }>('DELETE FROM target_Tahsin WHERE id = $1 RETURNING id', [params.id]);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus target' }, { status: 500 });
  }
}
