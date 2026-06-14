import { query, queryOne } from '@/lib/db/client';

export interface Murojaah {
  id: string;
  santuario_id: string;
  musyrif_id: string | null;
  juz: number | null;
  surah: string | null;
  ayat: string | null;
  nilai: number | null;
  status_murojaah: string | null;
  predikat: string | null;
  created_at: string;
  updated_at: string;
}

export interface MurojaahWithSantri extends Murojaah {
  santri_name: string;
  nis: string;
  kelas_nama: string;
  kelas_level: number;
}

export async function getAllMurojaah(): Promise<MurojaahWithSantri[]> {
  const sql = `
    SELECT m.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM murojaah m
    JOIN users u ON m.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    ORDER BY k.level, k.nama, u.full_name
  `;
  return query<MurojaahWithSantri>(sql);
}

export async function getMurojaahByKelas(kelasId: string): Promise<MurojaahWithSantri[]> {
  const sql = `
    SELECT m.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM murojaah m
    JOIN users u ON m.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE u.kelas_id = $1
    ORDER BY u.full_name
  `;
  return query<MurojaahWithSantri>(sql, [kelasId]);
}

export async function getMurojaahBySantri(santuarioId: string): Promise<MurojaahWithSantri | null> {
  const sql = `
    SELECT m.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM murojaah m
    JOIN users u ON m.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE m.santuario_id = $1
    LIMIT 1
  `;
  return queryOne<MurojaahWithSantri>(sql, [santuarioId]);
}

export async function getMurojaahByMusyrif(musyrifId: string): Promise<MurojaahWithSantri[]> {
  const sql = `
    SELECT m.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM murojaah m
    JOIN users u ON m.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE m.musyrif_id = $1
    ORDER BY u.full_name
  `;
  return query<MurojaahWithSantri>(sql, [musyrifId]);
}

export async function upsertMurojaah(data: {
  santuario_id: string;
  musyrif_id?: string | null;
  juz?: number | null;
  surah?: string | null;
  ayat?: string | null;
  nilai?: number | null;
  status_murojaah?: string | null;
  predikat?: string | null;
}): Promise<Murojaah> {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM murojaah WHERE santuario_id = $1', [data.santuario_id]
  );
  if (existing) {
    const sql = `
      UPDATE murojaah SET juz = $1, surah = $2, ayat = $3, nilai = $4, status_murojaah = $5, predikat = $6, musyrif_id = $7, updated_at = NOW()
      WHERE santuario_id = $8 RETURNING *
    `;
    return queryOne<Murojaah>(sql, [
      data.juz ?? null, data.surah ?? null, data.ayat ?? null,
      data.nilai ?? null, data.status_murojaah ?? null, data.predikat ?? null, data.musyrif_id ?? null, data.santuario_id
    ]) as Promise<Murojaah>;
  }
  const sql = `
    INSERT INTO murojaah (santuario_id, juz, surah, ayat, nilai, status_murojaah, predikat, musyrif_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `;
  return queryOne<Murojaah>(sql, [
    data.santuario_id, data.juz ?? null, data.surah ?? null, data.ayat ?? null,
    data.nilai ?? null, data.status_murojaah ?? null, data.predikat ?? null, data.musyrif_id ?? null
  ]) as Promise<Murojaah>;
}

export async function deleteMurojaah(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('DELETE FROM murojaah WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
