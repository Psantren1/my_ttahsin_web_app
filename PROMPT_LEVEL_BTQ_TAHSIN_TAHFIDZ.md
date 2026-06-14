
Sebelum membaca instruksi utama, tolong baca dulu file-file berikut agar kamu
paham struktur project ini (JANGAN menebak struktur, baca langsung):

1. schema.sql
   -> untuk lihat struktur tabel users, kelas, btq_pemula, btq_lanjutan,
      setoran, target_tahsin, tahfidz, murojaah

2. lib/services/user.service.ts
   -> untuk lihat query/insert/update terkait users (tempat kolom level
      akan ditambahkan)

3. lib/services/btq-pemula.service.ts dan lib/services/btq-lanjutan.service.ts
   -> contoh service yang sudah ada, jadikan acuan pola untuk level lain

4. app/api/btq-pemula/route.ts dan app/api/btq-lanjutan/route.ts
   -> contoh endpoint API yang sudah ada

5. components/musyrif/MusyrifSidebar.tsx dan components/santri/SantriSidebar.tsx
   -> sidebar/menu dashboard guru & siswa (tempat ikon BTQ1/BTQ2/dst akan
      ditambahkan/diubah)

6. app/dashboard/musyrif/setoran/page.tsx dan app/dashboard/santri/setoran/page.tsx
   -> halaman ikon "Setoran" saat ini yang akan diganti jadi dinamis

7. app/dashboard/admin/btq-pemula/page.tsx dan app/dashboard/admin/btq-lanjutan/page.tsx
   -> halaman menu "Manajemen BTQ Pemula" dan "Manajemen BTQ Lanjutan" di admin

8. Form pendaftaran/edit di Manajemen Guru dan Manajemen Siswa (admin)
   -> cari sendiri lokasi filenya, biasanya di app/dashboard/admin/musyrif/
      dan app/dashboard/admin/santri/

Setelah membaca semua file di atas, baru lanjutkan ke instruksi utama berikut:


##Implementasi "Level" Penentu Ikon & Routing Data (Guru & Siswa)

## KONTEKS
- Stack: Next.js (App Router) + TypeScript + NeonDB (Postgres)
- Role: ADMIN, MUSYRIF (Guru), SANTRI (Siswa)
- Tabel `kelas` SUDAH punya kolom `level INTEGER CHECK (level BETWEEN 7 AND 12)` — **JANGAN disentuh**, ini untuk keperluan lain (jenjang kelas), beda konteks dengan "Level" yang dimaksud di prompt ini.
- Modul transaksi yang SUDAH ADA (tabel + service + API masing-masing): `btq_pemula`, `btq_lanjutan`, `setoran` (tahsin) / `target_tahsin`, `tahfidz`, `murojaah`.
- Menu admin yang SUDAH ADA: Manajemen BTQ Pemula, Manajemen BTQ Lanjutan, Manajemen Tahsin, Manajemen Tahfidz, Manajemen Murojaah.

---

## TUJUAN

### 1. Kolom baru di tabel `users`
Tambah kolom BARU (VARCHAR + CHECK constraint), khusus untuk role MUSYRIF dan SANTRI (nullable untuk ADMIN).

Nama kolom: `level` ATAU `level_program` (AI harus cek dulu apakah nama `level` bentrok dengan sesuatu di tabel `users`, lalu laporkan nama final yang dipilih beserta alasannya — TUNGGU konfirmasi sebelum migrasi).

Nilai yang valid:
```
'BTQ_PEMULA' | 'BTQ_LANJUTAN' | 'TAHSIN' | 'TAHFIDZ' | 'MUROJAAH'
```

### 2. Form "Manajemen Guru" (admin)
Tambah dropdown **"Level"**: BTQ Pemula / BTQ Lanjutan / Tahsin / Tahfidz / Murojaah → simpan ke kolom level di atas.

### 3. Form "Manajemen Siswa" (admin)
Tambah dropdown **"Level"** yang sama → simpan ke kolom yang sama.

### 4. Dashboard Guru & Siswa — ikon dinamis
Ikon "Setoran" (tunggal, saat ini) diganti menjadi **SATU ikon** sesuai `level` milik user yang login:

| Level (users.level) | Ikon yang muncul |
|---|---|
| BTQ_PEMULA | BTQ1 |
| BTQ_LANJUTAN | BTQ2 |
| TAHSIN | Tahsin |
| TAHFIDZ | Tahfidz |
| MUROJAAH | Murojaah |

Hanya ikon sesuai level user yang ditampilkan — bukan semua ikon untuk semua orang.

### 5. Routing input data Guru (dari ikon levelnya)

| Ikon | Level | Tabel/Endpoint Tujuan |
|---|---|---|
| BTQ1 | BTQ_PEMULA | `btq_pemula` |
| BTQ2 | BTQ_LANJUTAN | `btq_lanjutan` |
| Tahsin | TAHSIN | `setoran` / `target_tahsin` |
| Tahfidz | TAHFIDZ | `tahfidz` |
| Murojaah | MUROJAAH | `murojaah` |

**WAJIB**: AI harus menunjukkan endpoint API persis yang dipanggil oleh tiap ikon — sebelum dan sesudah perubahan — untuk verifikasi bahwa tidak salah target tabel. Salah pasang endpoint = data masuk ke tabel salah = tidak muncul di menu admin yang sesuai.

### 6. Tampilan data Siswa
Siswa dengan `level=X` hanya melihat satu ikon sesuai levelnya, menampilkan data miliknya sendiri:

```
SELECT * FROM <tabel_sesuai_level> WHERE santuario_id = <id_siswa_login>
```

### 7. Konsistensi dengan Menu Admin
Menu admin (Manajemen BTQ Pemula, BTQ Lanjutan, Tahsin, Tahfidz, Murojaah) **TIDAK DIUBAH STRUKTURNYA**. Karena tabel sumber datanya sama dengan yang dipakai ikon guru/siswa, data otomatis konsisten — **selama endpoint terpasang benar (lihat poin 5)**.

```
Guru level BTQ_PEMULA → ikon "BTQ1" → INSERT ke btq_pemula
                                              │
Admin → "Manajemen BTQ Pemula" → SELECT * FROM btq_pemula   (sumber sama)
                                              │
Santri level BTQ_PEMULA → ikon "BTQ1" → SELECT * FROM btq_pemula WHERE santuario_id = X
```

---

## ⚠️ CATATAN PENTING: Sinkronisasi Level Guru ↔ Siswa

Sistem ini **TIDAK memvalidasi/memaksa** kecocokan level antara guru dan siswa. Implikasinya:

- Jika siswa `level=BTQ_PEMULA` tapi tidak ada guru ber-`level=BTQ_PEMULA` yang menginput data untuknya → ikon **BTQ1 siswa akan kosong** (bukan error — memang belum ada baris dengan `santuario_id` tersebut di tabel `btq_pemula`).
- Jika guru salah ditempatkan di level yang tidak sesuai dengan siswa binaannya → data guru tersimpan, tapi tidak akan terlihat oleh siswa yang levelnya berbeda.
- **Penempatan level guru & siswa harus konsisten secara organisasi** — ini keputusan operasional ADMIN saat pendaftaran, di luar tanggung jawab sistem/kode.

AI tidak perlu membuat validasi otomatis untuk ini di tahap awal — cukup dicatat sebagai catatan operasional untuk admin (boleh ditambahkan sebagai tooltip/keterangan kecil di form pendaftaran jika memungkinkan, TANPA mengubah layout).

---

## ATURAN KETAT (SURGICAL FIX)

- JANGAN ubah/hapus kolom `kelas.level` (7-12) — beda konteks, biarkan apa adanya.
- JANGAN ubah desain/layout/komponen UI lain di luar yang disebutkan.
- Migrasi DB: buat 1 file migration BARU (misal `migrations/00X_add_level_to_users.sql`) untuk `ALTER TABLE users ADD COLUMN <nama_kolom> ...` — JANGAN ubah `schema.sql` existing secara destruktif.
- Output WAJIB **diff per file** + penjelasan singkat, BUKAN tulis ulang file penuh.
- Satu guru/siswa = **SATU level** (tidak multi-level). Jika nanti perlu multi-level per user, itu di luar scope ini — cukup dicatat sebagai pengembangan lanjutan.

---

## SEBELUM CODING — AI HARUS TAMPILKAN DULU

1. Nama kolom final yang dipilih (`level` vs `level_program`) + alasan.
2. Daftar semua file yang akan disentuh:
   - Form admin: Manajemen Guru
   - Form admin: Manajemen Siswa
   - Sidebar/menu dashboard Guru
   - Sidebar/menu dashboard Siswa
   - API/endpoint terkait tiap ikon (BTQ1, BTQ2, Tahsin, Tahfidz, Murojaah)
   - File migration baru
3. Tabel mapping lengkap: **level → ikon → tabel transaksi → endpoint API → menu admin**.
4. Endpoint API persis yang dipanggil tiap ikon (sebelum & sesudah perubahan).
5. Pertanyaan: user (guru/siswa) lama yang belum punya `level` — ikon disembunyikan dulu sampai admin update, atau diberi default tertentu?

**TUNGGU konfirmasi saya untuk poin 1, 3, 4, dan 5 sebelum menulis/mengubah kode apa pun.**
