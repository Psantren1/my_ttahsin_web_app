import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Cek DATABASE_URL (without credentials)
  const rawUrl = process.env.DATABASE_URL || '(not set)';
  const maskedUrl = rawUrl.replace(/\/\/[^:]+:[^@]+@/, '//user:****@');
  results.database_url = maskedUrl;

  // 2. Cek koneksi DB
  try {
    const client = await pool.connect();
    results.db_connected = true;
    client.release();
  } catch (e: unknown) {
    results.db_connected = false;
    results.db_error = e instanceof Error ? e.message : String(e);
  }

  // 3. Cek tabel users
  try {
    const tables = await query<{ tablename: string }>(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
    );
    results.tables = tables.map(t => t.tablename);
  } catch (e: unknown) {
    results.tables_error = e instanceof Error ? e.message : String(e);
  }

  // 4. Cek admin user
  try {
    const admin = await query<{ id: string; email: string; role: string; password_hash_prefix: string }>(
      "SELECT id, email, role, LEFT(password_hash, 20) AS password_hash_prefix FROM users WHERE email = 'admin@tahsin.com'"
    );
    results.admin_user = admin.length > 0 ? admin[0] : 'NOT FOUND';
  } catch (e: unknown) {
    results.admin_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}
