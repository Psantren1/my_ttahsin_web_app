import { query, queryOne } from '@/lib/db/client';

export interface BtqLanjutan {
  id: string;
  santuario_id: string;
  musyrif_id: string | null;
  level: string;
  juz_surah: string;
  nilai: number;
  status_bacaan: string;
  predikat: string;
  status_penilaian: string;
  created_at: string;
  updated_at: string;
}

export interface BtqLanjutanWithSantri extends BtqLanjutan {
  santri_name: string;
  nis: string;
  kelas_nama: string;
  kelas_level: number;
}

export async function getAllBtqLanjutan(): Promise<BtqLanjutanWithSantri[]> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_lanjutan b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    ORDER BY k.level, k.nama, u.full_name
  `;
  return query<BtqLanjutanWithSantri>(sql);
}

export async function getBtqLanjutanByKelas(kelasId: string): Promise<BtqLanjutanWithSantri[]> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_lanjutan b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE u.kelas_id = $1
    ORDER BY u.full_name
  `;
  return query<BtqLanjutanWithSantri>(sql, [kelasId]);
}

export async function getBtqLanjutanBySantri(santuarioId: string): Promise<BtqLanjutanWithSantri | null> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_lanjutan b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE b.santuario_id = $1
    LIMIT 1
  `;
  return queryOne<BtqLanjutanWithSantri>(sql, [santuarioId]);
}

export async function getBtqLanjutanByMusyrif(musyrifId: string): Promise<BtqLanjutanWithSantri[]> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_lanjutan b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE b.musyrif_id = $1
    ORDER BY u.full_name
  `;
  return query<BtqLanjutanWithSantri>(sql, [musyrifId]);
}

export async function upsertBtqLanjutan(data: {
  santuario_id: string;
  musyrif_id?: string | null;
  level: string;
  juz_surah: string;
  nilai: number;
  status_bacaan: string;
  predikat: string;
  status_penilaian: string;
}): Promise<BtqLanjutan> {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM btq_lanjutan WHERE santuario_id = $1', [data.santuario_id]
  );
  if (existing) {
    const sql = `
      UPDATE btq_lanjutan SET level = $1, juz_surah = $2, nilai = $3, status_bacaan = $4, predikat = $5, status_penilaian = $6, musyrif_id = $7, updated_at = NOW()
      WHERE santuario_id = $8 RETURNING *
    `;
    return queryOne<BtqLanjutan>(sql, [
      data.level, data.juz_surah, data.nilai, data.status_bacaan, data.predikat, data.status_penilaian, data.musyrif_id ?? null, data.santuario_id
    ]) as Promise<BtqLanjutan>;
  }
  const sql = `
    INSERT INTO btq_lanjutan (santuario_id, level, juz_surah, nilai, status_bacaan, predikat, status_penilaian, musyrif_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `;
  return queryOne<BtqLanjutan>(sql, [
    data.santuario_id, data.level, data.juz_surah, data.nilai, data.status_bacaan, data.predikat, data.status_penilaian, data.musyrif_id ?? null
  ]) as Promise<BtqLanjutan>;
}

export async function deleteBtqLanjutan(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('DELETE FROM btq_lanjutan WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
