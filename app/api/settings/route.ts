import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { requireRole } from '@/lib/auth/auth';

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const { session, error } = await requireRole(['ADMIN']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const data = await query<AppSetting>('SELECT * FROM app_settings ORDER BY key ASC');
    const settings: Record<string, string> = {};
    for (const row of data) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    return NextResponse.json({ data: settings });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await query(
        `INSERT INTO app_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, stringValue]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan settings' }, { status: 500 });
  }
}
