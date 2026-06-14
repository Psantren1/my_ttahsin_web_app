# Menu "Nilai" Dinamis Per Level 

Lampiran ini MENAMBAHKAN ruang lingkup pada `PROMPT_LEVEL_BTQ_TAHSIN_TAHFIDZ.md` —
dikerjakan SETELAH kolom `level_program` (migration + schema) selesai dan
dikonfirmasi berjalan.

---

## KONTEKS TAMBAHAN

Setiap level memiliki STRUKTUR KOLOM NILAI YANG BERBEDA (hasil audit kode):

| Level | Tabel | Kolom Nilai/Field Utama |
|---|---|---|
| BTQ_PEMULA | `btq_pemula` | `jilid`, `halaman`, `nilai`, `predikat`, `catatan` |
| BTQ_LANJUTAN | `btq_lanjutan` | `level` (varchar internal tabel ini), `juz_surah`, `nilai`, `status_bacaan`, `predikat`, `status_penilaian` |
| TAHSIN | `setoran` | `surah`, `ayat_start`, `ayat_end`, `juz`, `tajwid_score`, `makhraj_score`, `kelancaran_score`, `rata_rata` |
| TAHFIDZ | `tahfidz` | `juz`, `surat`, `ayat`, `hafalan_baru`, `nilai`, `status_setoran` |
| MUROJAAH | `murojaah` | `juz`, `surah`, `ayat`, `nilai`, `status_murojaah`, `predikat` |

⚠️ **TEMUAN**: tabel `btq_pemula` dan `btq_lanjutan` **TIDAK ADA** di `schema.sql`
(hanya ditemukan di `lib/services/*.ts`). Sebelum mengubah apa pun, 
verifikasi: apakah tabel ini sudah ada di database NeonDB (cek via query
`information_schema.tables`), atau memang belum pernah dibuat. Laporkan
temuan ini SEBELUM lanjut — jika tabel belum ada di DB, ini bug terpisah yang
harus diperbaiki dulu (tambahkan ke schema.sql + migration), di luar scope
level_program.

---

## TUJUAN TAMBAHAN

### 1. Halaman "Nilai" Guru (`app/dashboard/musyrif/nilai/page.tsx`)
Render FORM dan TABEL berbeda berdasarkan `user.level_program`:

- **BTQ_PEMULA** → form input: jilid, halaman, nilai, predikat, catatan
  → kirim ke `POST /api/btq-pemula`
- **BTQ_LANJUTAN** → form input: juz_surah, nilai, status_bacaan, predikat,
  status_penilaian → kirim ke `POST /api/btq-lanjutan`
- **TAHSIN** → form SAMA SEPERTI SEKARANG (tajwid/makhraj/kelancaran) →
  `POST /api/setoran` (TIDAK BERUBAH — ini behavior existing)
- **TAHFIDZ** → form input: juz, surat, ayat, hafalan_baru, nilai,
  status_setoran → `POST /api/tahfidz`
- **MUROJAAH** → form input: juz, surah, ayat, nilai, status_murojaah,
  predikat → `POST /api/murojaah`

### 2. Halaman "Nilai" Siswa (`app/dashboard/santri/nilai/page.tsx`)
Render TABEL hasil (read-only) sesuai `user.level_program`, kolom mengikuti
struktur tabel yang sama seperti poin 1, sumber data:
`GET /api/<endpoint-sesuai-level>?santuario_id=<id_siswa>`

### 3. Halaman "Manajemen Nilai" Admin (`app/dashboard/admin/nilai/page.tsx`)
Saat ini hanya membaca `setoran` (cocok untuk TAHSIN saja). Ubah jadi
AGREGATOR dengan TAB/FILTER per level:

- Tab "Tahsin" → data dari `setoran` (PERILAKU SAAT INI, jangan diubah)
- Tab "BTQ Pemula" → data dari `btq_pemula`
- Tab "BTQ Lanjutan" → data dari `btq_lanjutan`
- Tab "Tahfidz" → data dari `tahfidz`
- Tab "Murojaah" → data dari `murojaah`

Setiap tab menampilkan kolom sesuai struktur tabelnya masing-masing
(tidak dipaksa seragam tajwid/makhraj/kelancaran).

> Catatan: Tab ini BUKAN duplikasi menu "Manajemen BTQ Pemula" dst yang sudah
> ada — melainkan VIEW GABUNGAN khusus nilai, sementara menu "Manajemen BTQ
> Pemula" dst tetap untuk kebutuhan lain (jika ada perbedaan fungsi). Jika
> ternyata isi/fungsinya 100% identik dengan menu yang sudah ada, AI HARUS
> melaporkan duplikasi ini dan menyarankan opsi: (a) cukup arahkan/redirect
> tab ke menu existing, atau (b) hapus salah satu — TUNGGU keputusan saya,
> jangan dihapus sepihak.

---

## ATURAN TAMBAHAN (mengikuti aturan utama)

- JANGAN ubah form/tampilan untuk level TAHSIN — perilaku existing untuk
  TAHSIN harus 100% sama seperti sekarang.
- Setiap level punya KOMPONEN FORM TERPISAH (misalnya
  `components/musyrif/nilai/FormBtqPemula.tsx`,
  `FormBtqLanjutan.tsx`, `FormTahfidz.tsx`, `FormMurojaah.tsx`,
  dan form Tahsin existing tetap di tempatnya) — JANGAN buat satu form raksasa
  dengan banyak `if/else` yang sulit dirawat.
- Output WAJIB diff per file + penjelasan.

---

## SEBELUM CODING 

1. Hasil verifikasi: apakah tabel `btq_pemula` dan `btq_lanjutan` ada di
   database NeonDB (via `information_schema.tables`)? Jika tidak ada,
   STOP dan laporkan — jangan lanjut sampai ini diklarifikasi.
2. Daftar komponen form baru yang akan dibuat (1 per level non-Tahsin).
3. Struktur tab/filter untuk "Manajemen Nilai" admin (mockup/diagram).
4. Analisis duplikasi: apakah "Manajemen Nilai" tab BTQ Pemula akan identik
   dengan "Manajemen BTQ Pemula" yang sudah ada? Jika ya, usulkan solusi
   (redirect/gabung) — TUNGGU keputusan saya.
   
   
  

## Contoh
  Guru level BTQ_PEMULA → halaman "Nilai" → form khusus BTQ Pemula
                              │
                        POST /api/btq-pemula → INSERT ke tabel btq_pemula
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                             │
Admin → "Manajemen Nilai" → Tab "BTQ Pemula"   Santri level BTQ_PEMULA →
        → SELECT * FROM btq_pemula              ikon "Nilai" → tabel khusus
                                                 BTQ Pemula
                                                 → GET /api/btq-pemula?santuario_id=X

