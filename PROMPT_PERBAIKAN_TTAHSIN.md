# PROMPT PERBAIKAN — my_ttahsin_web_app (localStorage → Database/Server)

## KONTEKS PROYEK
- Stack: Next.js (App Router) + TypeScript + NeonDB (Postgres)
- Auth: JWT via cookie `baitul_session` (httpOnly, divalidasi di `middleware.ts` dan `lib/auth/auth.ts`)
- Role: ADMIN, MUSYRIF (Guru), SANTRI (Siswa)
- Masalah: beberapa komponen masih menyimpan data penting di `localStorage` browser, padahal seharusnya bersumber dari database/session server. Ini menyebabkan data tidak konsisten antar device/browser.

## ATURAN WAJIB (SURGICAL FIX — JANGAN LANGGAR)
1. **DILARANG** mengubah struktur folder, routing, nama komponen, layout/desain UI, atau workflow yang sudah berjalan.
2. **DILARANG** menghapus fitur yang sudah ada — hanya ganti SUMBER DATA dari `localStorage` ke API/DB yang sudah tersedia.
3. Output **HARUS dalam format diff/patch per file** (unified diff atau before/after blok kode), bukan menulis ulang seluruh file.
4. Setiap perubahan harus disertai **penjelasan singkat**: file, baris, alasan perubahan.
5. Jika suatu fungsi `localStorage` memang valid (misalnya cache UI sementara yang tidak kritikal, contoh: preferensi tema/sidebar collapsed), **TANDAI sebagai "AMAN, TIDAK PERLU DIUBAH"** — jangan diubah paksa.
6. Jangan membuat tabel/endpoint API baru kecuali benar-benar tidak ada endpoint yang sesuai — jika perlu endpoint baru, sebutkan secara eksplisit dan minta konfirmasi dulu sebelum implementasi.
7. Setelah perbaikan, pastikan build tidak error (`npm run build` / `tsc --noEmit` jika memungkinkan).

## DAFTAR FILE & TITIK YANG HARUS DIPERBAIKI (HASIL AUDIT)

### 1. `lib/hooks/useAuth.ts`
- **Masalah**: data user (`baitul_user`) disimpan & dibaca dari `localStorage` (baris ~36, 41, 67, 79). Ini berisiko data user stale/tidak sinkron dengan session server.
- **Perbaikan**: 
  - Sumber kebenaran user = session dari cookie `baitul_session` (lewat endpoint `/api/auth/me` atau endpoint sejenis — cek dulu apakah sudah ada; jika belum ada, buat endpoint GET session minimal yang mengembalikan data session dari `getSession()`).
  - `localStorage` boleh tetap dipakai sebagai **cache tampilan sementara** (opsional), TAPI tidak boleh jadi satu-satunya sumber data — selalu fetch ulang/validasi ke server saat mount.
  - Pastikan logout (`localStorage.removeItem('baitul_user')`) tetap memanggil endpoint logout server agar cookie session juga dihapus.

### 2. `components/ui/sidebar.tsx`
- **Masalah**: baris ~58-59, saat logout hanya `localStorage.removeItem('baitul_user')` dan `localStorage.removeItem('baitul_session')`.
- **Perbaikan**:
  - `baitul_session` adalah **httpOnly cookie** (kemungkinan tidak bisa dihapus dari JS via `localStorage` — cek apakah ini benar-benar cookie atau juga disimpan duplikat di localStorage).
  - Logout HARUS memanggil endpoint server (misal `POST /api/auth/logout`) yang menghapus cookie session. Hapus `localStorage` boleh tetap ada sebagai pembersihan tambahan, tapi tidak boleh jadi mekanisme logout utama.
  - Jika endpoint logout belum ada, **buat endpoint baru** `app/api/auth/logout/route.ts` yang menghapus cookie `baitul_session` (set expired/maxAge 0).

### 3. `lib/hooks/useSettings.ts`
- **Masalah**: baris ~37, 39 — settings disimpan/diambil dari `localStorage.getItem/setItem('baitul_settings')`. Ada endpoint `/api/settings` yang sudah tersedia tapi tidak dipakai.
- **Perbaikan**:
  - Ganti read: ambil settings dari `GET /api/settings` saat mount.
  - Ganti write: kirim perubahan ke `POST/PUT /api/settings`, lalu update state lokal (boleh tetap simpan ke `localStorage` sebagai cache, tapi `/api/settings` adalah source of truth).

### 4. `app/dashboard/admin/page.tsx`
- **Masalah**: baris ~96, 102, 154 — statistik dashboard admin (`admin_dashboard_stats`: totalSantri, totalMusyrif, totalKelas, avgRata) dihitung lalu disimpan/dibaca dari `localStorage`. Ini menyebabkan statistik beda antar device dan bisa basi (stale).
- **Perbaikan**:
  - Hitung statistik langsung dari API yang sudah ada (`/api/santri`, `/api/musyrif`, `/api/kelas`, data nilai) setiap kali halaman dimuat — tidak perlu cache di localStorage untuk data agregat ini.
  - Jika tujuan `localStorage` di sini adalah **mengurangi loading flicker** (tampilkan data lama sambil fetch baru), boleh dipertahankan HANYA sebagai placeholder sementara (skeleton/optimistic), dengan catatan: nilai dari `localStorage` TIDAK PERNAH dianggap final — selalu di-overwrite oleh hasil fetch API.

### 5. `app/register/page.tsx` & `app/login/page.tsx`
- **Perlu dicek manual**: tunjukkan baris penggunaan `localStorage` di kedua file ini, lalu tentukan apakah menyimpan data sesi/user (HARUS dipindah ke server) atau hanya UI state sementara (AMAN).

## FORMAT OUTPUT YANG DIHARAPKAN
Untuk setiap file di atas, berikan:
```
### File: <path>
**Status**: [PERLU DIPERBAIKI / AMAN]
**Diff**:
- (baris lama)
+ (baris baru)
**Alasan**: ...
**Endpoint API yang digunakan**: ...
```

## VALIDASI AKHIR
1. Pastikan tidak ada lagi penyimpanan data kritikal (user, session, settings, statistik) yang HANYA berada di `localStorage`.
2. Pastikan logout benar-benar menghapus session di server (cookie httpOnly), bukan hanya localStorage.
3. Tampilan/UI/UX tidak berubah sama sekali — hanya sumber data yang berubah.
4. Jalankan `npm run build` untuk memastikan tidak ada error TypeScript baru.
