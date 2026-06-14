export type Role = 'ADMIN' | 'MUSYRIF' | 'SANTRI';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Santri extends User {
  nis: string;
  kelas: string;
  target_Tahsin: number; // in juz or pages
}

export interface Musyrif extends User {
  nip: string;
  kelompok_binaan: string[];
}
