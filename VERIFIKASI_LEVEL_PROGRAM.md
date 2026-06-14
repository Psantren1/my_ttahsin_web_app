# Verifikasi Sinkronisasi Level Program (Guru ↔ Admin ↔ Siswa)

## KONTEKS
Audit awal menemukan bahwa fitur "Level Program" (BTQ_PEMULA, BTQ_LANJUTAN,
TAHSIN, TAHFIDZ, MUROJAAH) **sudah diimplementasikan** di:
- `components/musyrif/MusyrifSidebar.tsx` & `components/santri/SantriSidebar.tsx`
  (ikon dinamis: BTQ1/BTQ2/Tahsin/Tahfidz/Murojaah sesuai `user.levelProgram`)
- `app/dashboard/musyrif/setoran/page.tsx` & `app/dashboard/santri/setoran/page.tsx`
  (form/tabel dinamis per level, masing-masing punya konfigurasi sendiri)
- `app/dashboard/musyrif/nilai/page.tsx` & `app/dashboard/santri/nilai/page.tsx`
  (kolom & sumber data dinamis per level)
- `app/dashboard/admin/nilai/page.tsx` (tab per level: BTQ Pemula, BTQ Lanjutan,
  Tahsin, Tahfidz, Murojaah)

INI BUKAN PROMPT UNTUK MEMBUAT FITUR BARU — fiturnya sudah ada. Tujuan prompt
ini adalah VERIFIKASI bahwa implementasi yang sudah ada benar-benar BEKERJA
dan SINKRON end-to-end, dan memperbaiki HANYA jika ditemukan bug/ketidaksesuaian.

---

## YANG HARUS DIVERIFIKASI

### 1. Mapping Endpoint per Level — Setoran
Untuk setiap level, pastikan:
- Guru input di halaman setoran level X → memanggil endpoint POST yang BENAR
- Siswa melihat hasil di halaman setoran level X → memanggil endpoint GET yang BENAR
- Admin (jika ada menu terkait setoran per level) → endpoint GET yang BENAR

Verifikasi mapping ini (isi tabel dengan endpoint AKTUAL dari kode, bukan asumsi):

| Level | Endpoint POST (Guru) | Endpoint GET (Siswa) | Tabel DB |
|---|---|---|---|
| BTQ_PEMULA | ? | ? | btq_pemula |
| BTQ_LANJUTAN | ? | ? | btq_lanjutan |
| TAHSIN | ? | ? | setoran |
| TAHFIDZ | ? | ? | tahfidz |
| MUROJAAH | ? | ? | murojaah |

### 2. Mapping Endpoint per Level — Nilai
Sama seperti poin 1, tapi untuk halaman "Nilai" (musyrif & santri):

| Level | Endpoint GET Guru (Input Nilai - lihat data) | Endpoint GET Siswa | Tabel DB |
|---|---|---|---|
| BTQ_PEMULA | ? | ? | btq_pemula |
| BTQ_LANJUTAN | ? | ? | btq_lanjutan |
| TAHSIN | ? | ? | setoran |
| TAHFIDZ | ? | ? | tahfidz |
| MUROJAAH | ? | ? | murojaah |

### 3. Tab Admin "Manajemen Nilai" per Level
Untuk masing-masing tab (BTQ Pemula, BTQ Lanjutan, Tahsin, Tahfidz, Murojaah)
di `app/dashboard/admin/nilai/page.tsx`:
- Apakah tab tersebut menampilkan DATA AKTUAL dari tabel terkait, atau hanya
  REDIRECT ke halaman lain (`href: '/dashboard/admin/btq-pemula'` dst)?
- Jika redirect: apakah halaman tujuan (`/dashboard/admin/btq-pemula`, dll)
  ADA dan berfungsi? (cek `app/dashboard/admin/btq-pemula/page.tsx`,
  `btq-lanjutan`, `hafalan`, `tahfidz`, `murojaah`)
- Apakah ada DUPLIKASI fungsi antara tab di "Manajemen Nilai" vs menu sidebar
  admin terpisah ("Manajemen BTQ Pemula" dll jika ada di sidebar admin)?

### 4. Tabel `btq_pemula` dan `btq_lanjutan` di Database
Dari audit sebelumnya, tabel `btq_pemula` dan `btq_lanjutan` TIDAK DITEMUKAN
di `schema.sql`. Karena halaman setoran/nilai untuk level ini SUDAH
diimplementasikan dan memanggil endpoint terkait — verifikasi:
- Apakah `lib/services/btq-pemula.service.ts` dan `btq-lanjutan.service.ts`
  ADA dan lengkap (query SQL ke tabel `btq_pemula`/`btq_lanjutan`)?
- Apakah endpoint `app/api/btq-pemula/route.ts` dan `app/api/btq-lanjutan/route.ts`
  ADA?
- Apakah definisi tabel `btq_pemula` dan `btq_lanjutan` ada di TEMPAT LAIN
  (migration file terpisah, atau hanya ada di database NeonDB tapi tidak di
  schema.sql lokal)? **JANGAN buat tabel baru** jika belum pasti — laporkan
  temuan dulu.

### 5. Konsistensi Sidebar — Href Level Menu
Cek `LEVEL_MENU` (musyrif) dan `LEVEL_MENU_SANTRI` (santri) di kedua sidebar:
- Apakah href untuk BTQ_PEMULA/BTQ_LANJUTAN/TAHFIDZ/MUROJAAH semuanya mengarah
  ke `/dashboard/{role}/setoran` (satu route untuk semua level), dan halaman
  `setoran/page.tsx` benar-benar merender form/tabel YANG BERBEDA berdasarkan
  `levelProgram` (bukan form yang sama untuk semua)? Konfirmasi dengan melihat
  isi file, bukan asumsi dari nama variabel.

---

## OUTPUT YANG DIHARAPKAN

1. Isi LENGKAP tabel di poin 1 dan 2 (mapping endpoint per level), berdasarkan
   kode AKTUAL (kutip baris/nama fungsi yang relevan).
2. Jawaban poin 3, 4, 5 dengan kutipan kode pendukung.
3. DAFTAR TEMUAN: bagi menjadi
   - ✅ SUDAH BENAR — tidak perlu diubah
   - 🐛 BUG/TIDAK SINKRON — jelaskan apa yang salah dan dampaknya
   - ⚠️ PERLU KEPUTUSAN — ambigu, butuh keputusan user (misal: duplikasi
     menu, tabel belum di schema.sql, dll)

## ATURAN
- TAHAP INI HANYA AUDIT/BACA KODE — JANGAN ubah file apa pun.
- Jika ditemukan 🐛 BUG, JANGAN langsung perbaiki — cukup laporkan di
  bagian "DAFTAR TEMUAN". Saya akan tentukan mana yang diperbaiki dan
  urutannya setelah melihat laporan lengkap.
- Untuk poin ⚠️ PERLU KEPUTUSAN, berikan opsi solusi (seperti pola prompt
  sebelumnya: tunjukkan opsi, jangan langsung pilih sendiri).
