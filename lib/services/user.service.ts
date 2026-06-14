import { query, queryOne } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 10;

function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  nis: string | null;
  nip: string | null;
  role: 'SANTRI' | 'MUSYRIF' | 'ADMIN';
  kelas_id: string | null;
  kelas_nama: string | null;
  kelas_level: number | null;
  avatar_url: string | null;
  is_active: boolean;
  target_Tahsin: number;
  created_at: string;
  updated_at: string;
  username: string | null;
  no_wa: string | null;
  nisn: string | null;
  nama_ayah: string | null;
  nama_ibu: string | null;
  pekerjaan_ayah: string | null;
  pekerjaan_ibu: string | null;
  level_program: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    if (isBcryptHash(hash) && bcrypt.compareSync(password, hash)) return true;
  } catch {}

  // Legacy SHA-256 fallback for existing users
  if (/^[a-f0-9]{64}$/i.test(hash)) {
    return crypto.createHash('sha256').update(password).digest('hex') === hash;
  }

  return false;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE username = $1', [username]);
}

export async function getUserById(id: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
}

export async function checkDuplicateUser(data: {
  email: string;
  nis?: string | null;
  nip?: string | null;
  username?: string | null;
  excludeId?: string;
}): Promise<string | null> {
  const checks: { value: string | null | undefined; field: string; query: string }[] = [
    { value: data.email, field: 'Email', query: 'SELECT id FROM users WHERE email = $1' },
    { value: data.username, field: 'Username', query: 'SELECT id FROM users WHERE username = $1' },
    { value: data.nis, field: 'NIS', query: 'SELECT id FROM users WHERE nis = $1' },
    { value: data.nip, field: 'NIP', query: 'SELECT id FROM users WHERE nip = $1' },
  ];

  for (const check of checks) {
    if (!check.value) continue;
    let sql = check.query;
    const params: unknown[] = [check.value];
    if (data.excludeId) {
      sql += ' AND id != $2';
      params.push(data.excludeId);
    }
    const existing = await queryOne<{ id: string }>(sql, params);
    if (existing) return check.field;
  }
  return null;
}

export async function createUser(data: {
  email: string;
  password: string;
  full_name: string;
  role: 'SANTRI' | 'MUSYRIF' | 'ADMIN';
  nis?: string | null;
  nip?: string | null;
  kelas_id?: string | null;
  target_Tahsin?: number;
  username?: string | null;
  no_wa?: string | null;
  nisn?: string | null;
  nama_ayah?: string | null;
  nama_ibu?: string | null;
  pekerjaan_ayah?: string | null;
  pekerjaan_ibu?: string | null;
  level_program?: string | null;
}): Promise<UserRow> {
  const duplicate = await checkDuplicateUser({
    email: data.email,
    nis: data.nis,
    nip: data.nip,
    username: data.username,
  });
  if (duplicate) throw new Error(`DUPLICATE_${duplicate.toUpperCase()}`);

  const password_hash = hashPassword(data.password);
  const sql = `
    INSERT INTO users (email, password_hash, full_name, role, nis, nip, kelas_id, target_Tahsin, username, no_wa, nisn, nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, level_program)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `;
  return queryOne<UserRow>(sql, [
    data.email, password_hash, data.full_name, data.role,
    data.nis ?? null, data.nip ?? null,
    data.kelas_id ?? null, data.target_Tahsin ?? 30,
    data.username ?? null, data.no_wa ?? null,
    data.nisn ?? null, data.nama_ayah ?? null,
    data.nama_ibu ?? null, data.pekerjaan_ayah ?? null,
    data.pekerjaan_ibu ?? null,
    data.level_program ?? null
  ]) as Promise<UserRow>;
}

export async function getAllUsersByRole(role: string): Promise<UserRow[]> {
  const sql = `
    SELECT u.*, k.nama as kelas_nama, k.level as kelas_level
    FROM users u
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE u.role = $1 AND u.is_active = true
    ORDER BY u.full_name ASC
  `;
  return query<UserRow>(sql, [role]);
}

export async function getUsersByKelas(kelasId: string): Promise<UserRow[]> {
  const sql = `
    SELECT u.*, k.nama as kelas_nama, k.level as kelas_level
    FROM users u
    LEFT JOIN kelas k ON u.kelas_id = k.id
    WHERE u.kelas_id = $1 AND u.role = 'SANTRI' AND u.is_active = true
    ORDER BY u.full_name ASC
  `;
  return query<UserRow>(sql, [kelasId]);
}

export async function updateUser(id: string, data: {
  full_name?: string;
  email?: string;
  nis?: string | null;
  nip?: string | null;
  kelas_id?: string | null;
  is_active?: boolean;
  target_Tahsin?: number;
  password?: string;
  username?: string | null;
  no_wa?: string | null;
  nisn?: string | null;
  nama_ayah?: string | null;
  nama_ibu?: string | null;
  pekerjaan_ayah?: string | null;
  pekerjaan_ibu?: string | null;
  level_program?: string | null;
}): Promise<UserRow | null> {
  if (data.email || data.username || data.nis || data.nip) {
    const duplicate = await checkDuplicateUser({
      email: data.email || '',
      username: data.username,
      nis: data.nis,
      nip: data.nip,
      excludeId: id,
    });
    if (duplicate) throw new Error(`DUPLICATE_${duplicate.toUpperCase()}`);
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    if (key === 'password') {
      fields.push(`password_hash = $${paramIndex}`);
      values.push(hashPassword(value as string));
      paramIndex++;
    } else if (key !== 'id') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
  return queryOne<UserRow>(sql, values);
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await query<{ id: string }>('UPDATE users SET is_active = false WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
