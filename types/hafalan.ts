export interface Setoran {
  id: string;
  santuario_id: string;
  musyrif_id: string;
  surah: string;
  ayat_start: number | null;
  ayat_end: number | null;
  juz: number | null;
  halaman_start: number | null;
  halaman_end: number | null;
  tajwid_score: number;
  makhraj_score: number;
  kelancaran_score: number;
  rata_rata: number;
  status: 'LANJUT' | 'ULANGI';
  jenis: 'SABAQ' | 'SABQI' | 'MANZIL';
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface TahsinRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasId: string;
  kelasNama: string;
  nis: string;
  surah: string;
  ayat: string;
  tajwid: number;
  makhraj: number;
  kelancaran: number;
  rata: number;
  status: 'Lanjut' | 'Ulang';
  createdAt: string;
}
