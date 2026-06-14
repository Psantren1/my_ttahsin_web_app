import { query, queryOne } from '@/lib/db/client';

export interface BtqPemula {
  id: string;
  santuario_id: string;
  musyrif_id: string | null;
  jilid: string;
  halaman: number;
  nilai: number;
  predikat: string;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface BtqPemulaWithSantri extends BtqPemula {
  santri_name: string;
  nis: string;
  kelas_nama: string;
  kelas_level: number;
}

export async function getAllBtqPemula(): Promise<BtqPemulaWithSantri[]> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_pemula b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    ORDER BY k.level, k.nama, u.full_name
  `;
  return query<BtqPemulaWithSantri>(sql);
}

export async function getBtqPemulaByKelas(kelasId: string): Promise<BtqPemulaWithSantri[]> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_pemula b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE u.kelas_id = $1
    ORDER BY u.full_name
  `;
  return query<BtqPemulaWithSantri>(sql, [kelasId]);
}

export async function getBtqPemulaBySantri(santuarioId: string): Promise<BtqPemulaWithSantri | null> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_pemula b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE b.santuario_id = $1
    LIMIT 1
  `;
  return queryOne<BtqPemulaWithSantri>(sql, [santuarioId]);
}

export async function getBtqPemulaByMusyrif(musyrifId: string): Promise<BtqPemulaWithSantri[]> {
  const sql = `
    SELECT b.*, u.full_name as santri_name, u.nis, k.nama as kelas_nama, k.level as kelas_level
    FROM btq_pemula b
    JOIN users u ON b.santuario_id = u.id
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE b.musyrif_id = $1
    ORDER BY u.full_name
  `;
  return query<BtqPemulaWithSantri>(sql, [musyrifId]);
}

export async function upsertBtqPemula(data: {
  santuario_id: string;
  musyrif_id?: string | null;
  jilid: string;
  halaman: number;
  nilai: number;
  predikat: string;
  catatan?: string | null;
}): Promise<BtqPemula> {
  const existing = await getBtqPemulaBySantri(data.santuario_id);
  if (existing) {
    const sql = `
      UPDATE btq_pemula SET jilid = $1, halaman = $2, nilai = $3, predikat = $4, catatan = $5, musyrif_id = $6, updated_at = NOW()
      WHERE santuario_id = $7 RETURNING *
    `;
    return queryOne<BtqPemula>(sql, [
      data.jilid, data.halaman, data.nilai, data.predikat, data.catatan ?? null, data.musyrif_id ?? null, data.santuario_id
    ]) as Promise<BtqPemula>;
  }
  const sql = `
    INSERT INTO btq_pemula (santuario_id, jilid, halaman, nilai, predikat, catatan, musyrif_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `;
  return queryOne<BtqPemula>(sql, [
    data.santuario_id, data.jilid, data.halaman, data.nilai, data.predikat, data.catatan ?? null, data.musyrif_id ?? null
  ]) as Promise<BtqPemula>;
}

export async function deleteBtqPemula(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('DELETE FROM btq_pemula WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
