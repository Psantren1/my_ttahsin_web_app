# Database Migration Changelog

## 001_schema.sql — Initial Schema ✅ (SUDAH DIAPPLY)
Tabel: users, kelas, setoran, jadwal, absensi, evaluasi, target_hafalan, sertifikat, zoom_meetings, app_settings
Sudah termasuk kolom `level` di tabel kelas.

## 002_sertifikat_fields.sql — ⏳ BELUM DIAPPLY
ALTER TABLE sertifikat ADD COLUMNS untuk menyimpan data SertifikatRecord:
- `nomor_sertifikat`, `nama_surat`, `status_kelulusan`
- `paragraf_teks`, `nama_sekolah`, `alamat_sekolah`, `akreditasi`
- `nilai_tajwid`, `nilai_makhraj`, `nilai_kelancaran`, `nilai_rata`
- `kota_penandatangan`, `nama_penanggung_jawab`, `jabatan`

## 003_informasi.sql — ⏳ BELUM DIAPPLY
CREATE TABLE informasi untuk fitur Admin → Musyrif/Santri announcements:
- `id`, `judul`, `isi`, `target_role` (MUSYRIF/SANTRI/ALL)
- `created_by`, `is_active`, `created_at`, `updated_at`

## 004_users_add_columns.sql — ✅ SUDAH DIAPPLY
ALTER TABLE users ADD COLUMNS untuk field yang hilang:
- `username`, `no_wa`, `nisn`
- `nama_ayah`, `nama_ibu`, `pekerjaan_ayah`, `pekerjaan_ibu`

## Cara Apply

### Opsi 1: Manual di Neon SQL Editor
Buka Neon Dashboard → SQL Editor → copy-paste isi file 002 lalu 003.

### Opsi 2: Via script (wajib set DATABASE_URL)
```powershell
$env:DATABASE_URL="postgresql://..." 
node database/run-migrations.mjs
```
