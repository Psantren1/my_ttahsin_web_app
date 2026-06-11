import { query, queryOne } from '@/lib/db/client';
import { Jadwal } from '@/types/jadwal';

export async function getAllJadwal(): Promise<Jadwal[]> {
  const sql = `
    SELECT j.*, u.full_name as musyrif_name, k.nama as kelas_nama, k.level as kelas_level
    FROM jadwal j
    LEFT JOIN users u ON j.musyrif_id = u.id
    LEFT JOIN kelas k ON j.kelas_id = k.id
    ORDER BY j.hari, j.jam_mulai
  `;
  return query<Jadwal>(sql);
}

export async function getJadwalByHari(hari: Jadwal['hari']): Promise<Jadwal[]> {
  const sql = `
    SELECT j.*, u.full_name as musyrif_name, k.nama as kelas_nama, k.level as kelas_level
    FROM jadwal j
    LEFT JOIN users u ON j.musyrif_id = u.id
    LEFT JOIN kelas k ON j.kelas_id = k.id
    WHERE j.hari = $1
    ORDER BY j.jam_mulai
  `;
  return query<Jadwal>(sql, [hari]);
}

export async function getJadwalByKelas(kelasId: string): Promise<Jadwal[]> {
  const sql = `
    SELECT j.*, u.full_name as musyrif_name, k.nama as kelas_nama, k.level as kelas_level
    FROM jadwal j
    LEFT JOIN users u ON j.musyrif_id = u.id
    LEFT JOIN kelas k ON j.kelas_id = k.id
    WHERE j.kelas_id = $1
    ORDER BY j.hari, j.jam_mulai
  `;
  return query<Jadwal>(sql, [kelasId]);
}

export async function getJadwalByMusyrif(musyrifId: string): Promise<Jadwal[]> {
  const sql = `
    SELECT j.*, u.full_name as musyrif_name, k.nama as kelas_nama, k.level as kelas_level
    FROM jadwal j
    LEFT JOIN users u ON j.musyrif_id = u.id
    LEFT JOIN kelas k ON j.kelas_id = k.id
    WHERE j.musyrif_id = $1
    ORDER BY j.hari, j.jam_mulai
  `;
  return query<Jadwal>(sql, [musyrifId]);
}

export async function createJadwal(data: {
  sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi?: string | null;
  hari: Jadwal['hari'];
  kelas_id?: string | null;
  musyrif_id?: string | null;
  is_active?: boolean;
}): Promise<Jadwal> {
  const sql = `
    INSERT INTO jadwal (sesi, jam_mulai, jam_selesai, lokasi, hari, kelas_id, musyrif_id, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  return queryOne<Jadwal>(sql, [
    data.sesi, data.jam_mulai, data.jam_selesai, data.lokasi ?? null,
    data.hari, data.kelas_id ?? null, data.musyrif_id ?? null,
    data.is_active ?? true
  ]) as Promise<Jadwal>;
}

export async function updateJadwal(id: string, data: Partial<Jadwal>): Promise<Jadwal | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const sql = `UPDATE jadwal SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
  return queryOne<Jadwal>(sql, values);
}

export async function deleteJadwal(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('DELETE FROM jadwal WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
