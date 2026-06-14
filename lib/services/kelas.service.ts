import { query, queryOne } from '@/lib/db/client';

export interface KelasRow {
  id: string;
  nama: string;
  level: number;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
}

export interface KelasWithRelations extends KelasRow {
  musyrif: { id: string; full_name: string; nip: string | null }[];
  jmlSantri: number;
}

export async function getAllKelas(): Promise<KelasWithRelations[]> {
  const sql = `
    SELECT k.*,
      COALESCE(
        json_agg(
          json_build_object('id', u.id, 'full_name', u.full_name, 'nip', u.nip)
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'::json
      ) as musyrif,
      (SELECT COUNT(*) FROM users WHERE kelas_id = k.id AND role = 'SANTRI' AND is_active = true) as jml_santri
    FROM kelas k
    LEFT JOIN kelas_musyrif km ON km.kelas_id = k.id
    LEFT JOIN users u ON u.id = km.musyrif_id AND u.role = 'MUSYRIF' AND u.is_active = true
    GROUP BY k.id
    ORDER BY k.nama ASC
  `;
  const rows = await query<any>(sql);
  return rows.map(r => ({
    ...r,
    musyrif: r.musyrif || [],
    jmlSantri: Number(r.jml_santri),
  }));
}

export async function getKelasById(id: string): Promise<KelasWithRelations | null> {
  const sql = `
    SELECT k.*,
      COALESCE(
        json_agg(
          json_build_object('id', u.id, 'full_name', u.full_name, 'nip', u.nip)
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'::json
      ) as musyrif,
      (SELECT COUNT(*) FROM users WHERE kelas_id = k.id AND role = 'SANTRI' AND is_active = true) as jml_santri
    FROM kelas k
    LEFT JOIN kelas_musyrif km ON km.kelas_id = k.id
    LEFT JOIN users u ON u.id = km.musyrif_id AND u.role = 'MUSYRIF' AND u.is_active = true
    WHERE k.id = $1
    GROUP BY k.id
  `;
  const row = await queryOne<any>(sql, [id]);
  if (!row) return null;
  return { ...row, musyrif: row.musyrif || [], jmlSantri: Number(row.jml_santri) };
}

export async function createKelas(data: {
  nama: string;
  level: number;
  deskripsi?: string | null;
  musyrif_ids?: string[];
}): Promise<KelasRow> {
  const kelas = await queryOne<KelasRow>(
    'INSERT INTO kelas (nama, level, deskripsi) VALUES ($1, $2, $3) RETURNING *',
    [data.nama, data.level ?? 7, data.deskripsi ?? null]
  );

  if (data.musyrif_ids?.length && kelas) {
    const values = data.musyrif_ids.map((_, i) => `($1, $${i + 2})`).join(', ');
    await query(
      `INSERT INTO kelas_musyrif (kelas_id, musyrif_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [kelas.id, ...data.musyrif_ids]
    );
  }

  return kelas as KelasRow;
}

export async function updateKelas(
  id: string,
  data: {
    nama?: string;
    level?: number;
    deskripsi?: string | null;
    musyrif_ids?: string[];
  }
): Promise<KelasRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.nama !== undefined) { fields.push(`nama = $${paramIndex++}`); values.push(data.nama); }
  if (data.level !== undefined) { fields.push(`level = $${paramIndex++}`); values.push(data.level); }
  if (data.deskripsi !== undefined) { fields.push(`deskripsi = $${paramIndex++}`); values.push(data.deskripsi); }

  if (fields.length > 0) {
    values.push(id);
    await queryOne<KelasRow>(
      `UPDATE kelas SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  }

  if (data.musyrif_ids !== undefined) {
    await query('DELETE FROM kelas_musyrif WHERE kelas_id = $1', [id]);
    if (data.musyrif_ids.length > 0) {
      const insertValues = data.musyrif_ids.map((_, i) => `($1, $${i + 2})`).join(', ');
      await query(
        `INSERT INTO kelas_musyrif (kelas_id, musyrif_id) VALUES ${insertValues} ON CONFLICT DO NOTHING`,
        [id, ...data.musyrif_ids]
      );
    }
  }

  const updated = await getKelasById(id);
  return updated ?? null;
}

export async function deleteKelas(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('DELETE FROM kelas WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
