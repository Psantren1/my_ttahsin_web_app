import { query, queryOne } from '@/lib/db/client';

export interface Tahfidz {
  id: string;
  santuario_id: string;
  musyrif_id: string | null;
  juz: number | null;
  surat: string | null;
  ayat: string | null;
  hafalan_baru: string | null;
  nilai: number | null;
  status_setoran: string | null;
  predikat: string | null;
  created_at: string;
  updated_at: string;
}

export interface TahfidzWithSantri extends Tahfidz {
  santri_name: string;
  nis: string;
  kelas_nama: string;
  kelas_level: number;
}

export async function getAllTahfidz(): Promise<TahfidzWithSantri[]> {
  const sql = `
    SELECT t.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM tahfidz t
    JOIN users u ON t.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    ORDER BY k.level, k.nama, u.full_name
  `;
  return query<TahfidzWithSantri>(sql);
}

export async function getTahfidzByKelas(kelasId: string): Promise<TahfidzWithSantri[]> {
  const sql = `
    SELECT t.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM tahfidz t
    JOIN users u ON t.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE u.kelas_id = $1
    ORDER BY u.full_name
  `;
  return query<TahfidzWithSantri>(sql, [kelasId]);
}

export async function getTahfidzBySantri(santuarioId: string): Promise<TahfidzWithSantri | null> {
  const sql = `
    SELECT t.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM tahfidz t
    JOIN users u ON t.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE t.santuario_id = $1
    LIMIT 1
  `;
  return queryOne<TahfidzWithSantri>(sql, [santuarioId]);
}

export async function getTahfidzByMusyrif(musyrifId: string): Promise<TahfidzWithSantri[]> {
  const sql = `
    SELECT t.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM tahfidz t
    JOIN users u ON t.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE t.musyrif_id = $1
    ORDER BY u.full_name
  `;
  return query<TahfidzWithSantri>(sql, [musyrifId]);
}

export async function upsertTahfidz(data: {
  santuario_id: string;
  musyrif_id?: string | null;
  juz?: number | null;
  surat?: string | null;
  ayat?: string | null;
  hafalan_baru?: string | null;
  nilai?: number | null;
  status_setoran?: string | null;
  predikat?: string | null;
}): Promise<Tahfidz> {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM tahfidz WHERE santuario_id = $1', [data.santuario_id]
  );
  if (existing) {
    const sql = `
      UPDATE tahfidz SET juz = $1, surat = $2, ayat = $3, hafalan_baru = $4, nilai = $5, status_setoran = $6, predikat = $7, musyrif_id = $8, updated_at = NOW()
      WHERE santuario_id = $9 RETURNING *
    `;
    return queryOne<Tahfidz>(sql, [
      data.juz ?? null, data.surat ?? null, data.ayat ?? null, data.hafalan_baru ?? null,
      data.nilai ?? null, data.status_setoran ?? null, data.predikat ?? null, data.musyrif_id ?? null, data.santuario_id
    ]) as Promise<Tahfidz>;
  }
  const sql = `
    INSERT INTO tahfidz (santuario_id, juz, surat, ayat, hafalan_baru, nilai, status_setoran, predikat, musyrif_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
  `;
  return queryOne<Tahfidz>(sql, [
    data.santuario_id, data.juz ?? null, data.surat ?? null, data.ayat ?? null,
    data.hafalan_baru ?? null, data.nilai ?? null, data.status_setoran ?? null, data.predikat ?? null, data.musyrif_id ?? null
  ]) as Promise<Tahfidz>;
}

export async function deleteTahfidz(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('DELETE FROM tahfidz WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
