# Pending Migrations

Jalankan SQL berikut di NeonDB (dalam urutan) sebelum aplikasi berfungsi penuh.

## 002 — Tambah kolom rich field ke tabel sertifikat

Jalankan: `database/migrations/002_sertifikat_fields.sql`

Menambahkan 14 kolom ke tabel `sertifikat` untuk menyimpan data SertifikatRecord dari Admin:
- `nomor_sertifikat`, `nama_surat`, `status_kelulusan`, `paragraf_teks`
- `nama_sekolah`, `alamat_sekolah`, `akreditasi`
- `nilai_tajwid`, `nilai_makhraj`, `nilai_kelancaran`, `nilai_rata`
- `kota_penandatangan`, `nama_penanggung_jawab`, `jabatan`

## 003 — Buat tabel informasi

Jalankan: `database/migrations/003_informasi.sql`

Membuat tabel `informasi` untuk fitur Admin mengirim pengumuman ke Musyrif/Santri.

## 004 — Tambah kolom ke users

Jalankan: `database/migrations/004_users_add_columns.sql`

Menambahkan kolom ke tabel `users`: `username`, `no_wa`, `nisn`, `nama_ayah`, `nama_ibu`, `pekerjaan_ayah`, `pekerjaan_ibu`
