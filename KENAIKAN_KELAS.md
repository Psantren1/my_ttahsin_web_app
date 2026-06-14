# Kenaikan Kelas (Notifikasi & Konsistensi level_program)

## KONTEKS
- Stack: Next.js (App Router) + TypeScript + NeonDB (Postgres)
- Modul "Kenaikan Kelas" admin: `app/dashboard/admin/naik-kelas/page.tsx`
- Hook: `useBulkReassign()` (`lib/hooks/useApi.ts`) → `POST /api/kelas/bulk-reassign`
- Endpoint existing: `app/api/kelas/bulk-reassign/route.ts`
  - Hanya ADMIN (cek `session.role !== 'ADMIN'`)
  - UPDATE `users.kelas_id` untuk semua `santri_ids` terpilih
  - Tercatat ke `audit_log` (action: `BULK_REASSIGN`)

## TEMUAN AUDIT (yang harus diperbaiki)

### Temuan 1 — Tidak ada notifikasi ke siswa saat naik kelas
Setelah `bulk-reassign`, siswa hanya akan melihat `kelas_nama` berubah saat
dashboard di-reload — tanpa pemberitahuan apa pun. Guru kelas lama/baru juga
tidak diberi tahu.

### Temuan 2 — Hubungan `kelas_id` vs `level_program` belum jelas
Saat siswa naik kelas (`kelas_id` berubah), kolom `users.level_program`
(BTQ_PEMULA/BTQ_LANJUTAN/TAHSIN/TAHFIDZ/MUROJAAH — lihat
`PROMPT_LEVEL_BTQ_TAHSIN_TAHFIDZ.md`) TIDAK ikut berubah secara otomatis.
Perlu diputuskan: apakah kenaikan kelas SELALU berarti kenaikan level_program
juga, atau keduanya independen (siswa bisa naik kelas tapi tetap di level
program yang sama)?

---

## TUJUAN PERBAIKAN

### A. Notifikasi Otomatis via Tabel `informasi`
Saat `bulk-reassign` berhasil, sistem secara otomatis membuat 1 baris baru di
tabel `informasi` (yang sudah ada dan dipakai modul "Informasi & Pengumuman"):

```
judul: "Kenaikan Kelas"
isi: "Anda telah dipindahkan ke kelas <nama_kelas_tujuan>" (atau pesan serupa)
target_role: 'SANTRI'
created_by: <session.userId> (admin yang melakukan aksi)
```

Dengan ini, siswa yang terdampak akan melihat notifikasi di menu
"Informasi" mereka — TANPA perlu membuat tabel notifikasi baru, cukup
manfaatkan tabel `informasi` yang sudah ada.

> CATATAN: tabel `informasi` saat ini bersifat broadcast (target_role: ALL/
> MUSYRIF/SANTRI), bukan per-individu. Jika ingin notifikasi SPESIFIK hanya
> untuk siswa yang naik kelas (bukan broadcast ke semua santri), AI HARUS
> melaporkan ini sebagai keterbatasan dan mengusulkan opsi:
> - Opsi 1: buat satu entri informasi per siswa yang dipindah (isi pesan
>   menyebut nama siswa, tapi tetap tampil ke SEMUA santri karena target_role
>   tidak mendukung per-user)
> - Opsi 2: buat kolom/tabel baru untuk notifikasi per-user (di luar scope
>   minimal, perlu migrasi baru — TUNGGU keputusan saya)
> - Opsi 3: cukup catat di audit_log saja (status quo), tidak ada notifikasi
>   tampil ke siswa
> TUNGGU keputusan saya untuk opsi mana yang dipakai SEBELUM implementasi.

### B. Klarifikasi & Penanganan `level_program` saat Naik Kelas
1. AI HARUS menampilkan dulu: apakah ada relasi logis antara `kelas.level`
   (7-12, jenjang kelas) dan `users.level_program` (BTQ/Tahsin/dst, program
   pembelajaran) di database/kode existing — ATAU memang dua hal yang
   sepenuhnya independen?
2. Berdasarkan jawaban poin 1, AI mengusulkan SALAH SATU:
   - **Independen** (default, JIKA TIDAK ADA bukti relasi): `bulk-reassign`
     TIDAK mengubah `level_program` — perubahan level program tetap manual
     via form "Manajemen Guru/Siswa" terpisah. CUKUP tambahkan baris di UI
     "Naik Kelas" berupa info/disclaimer: "Kenaikan kelas tidak mengubah
     Level Program siswa. Untuk mengubah Level Program, gunakan menu
     Manajemen Siswa."
   - **Terhubung**: jika admin ingin kenaikan kelas JUGA mengubah
     level_program (misal pindah ke kelas level BTQ_LANJUTAN otomatis
     mengubah level_program siswa jadi BTQ_LANJUTAN), maka perlu field
     tambahan di form "Naik Kelas" untuk memilih level_program tujuan
     (opsional, default: tidak berubah).
3. TUNGGU keputusan saya untuk poin 2 sebelum implementasi.

---

## ATURAN KETAT (SURGICAL FIX)

- JANGAN ubah logika `UPDATE users SET kelas_id = ...` yang sudah berjalan —
  hanya TAMBAHKAN langkah setelahnya (insert ke `informasi`, dan/atau update
  `level_program` jika opsi B-2 dipilih).
- JANGAN ubah struktur/layout halaman "Naik Kelas" kecuali menambahkan
  disclaimer/info singkat (poin B) atau field tambahan jika opsi B-2 dipilih
  — keduanya bersifat ADDITIVE, bukan mengganti UI yang ada.
- JANGAN ubah tabel `informasi` / `audit_log` yang sudah ada — hanya INSERT
  data baru sesuai struktur existing.
- Output WAJIB diff per file + penjelasan singkat.

---

## SEBELUM CODING 

1. Hasil cek relasi `kelas.level` vs `users.level_program` (Temuan 2, poin 1).
2. Opsi yang diusulkan untuk Temuan 1 (A) — opsi 1/2/3 — dengan
   pertimbangan plus-minus masing-masing.
3. Opsi yang diusulkan untuk Temuan 2 (B) — independen vs terhubung — dengan
   pertimbangan.
4. Daftar file yang akan disentuh (endpoint `bulk-reassign`, halaman
   "Naik Kelas", dan file lain jika ada).


