import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { ZoomMeeting } from '../route';
import { requireRole } from '@/lib/auth/auth';
import { createAuditLog } from '@/lib/services/audit.service';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

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
    const sql = `UPDATE zoom_meetings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const data = await queryOne<ZoomMeeting>(sql, values);
    if (!data) {
      return NextResponse.json({ error: 'Meeting tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'zoom_meetings',
      entityId: params.id,
      newValues: body,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate meeting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const result = await query<{ id: string }>('DELETE FROM zoom_meetings WHERE id = $1 RETURNING id', [params.id]);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Meeting tidak ditemukan' }, { status: 404 });
    }

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      entityType: 'zoom_meetings',
      entityId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus meeting' }, { status: 500 });
  }
}
