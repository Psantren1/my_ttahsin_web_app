# Fase Perbaikan — Bug Console

**Dibuat:** 20 Juni 2026
**Sprint:** Bug Fix Sprint
**Status Keseluruhan:** Fase 1 ✅ | Fase 2 ✅ | Fase 3 ⏳
**Total file diubah:** 4 file (6 fix crash + 1 wrapper + 2 update hooks)

---

## Fase 1: Perbaiki Crash `rata_rata` (Prioritas: 🔴 Tinggi) ✅ SELESAI

**Lokasi crash & latent bug:** 
1. `app/dashboard/admin/page.tsx:110` — crash
2. `app/dashboard/admin/hafalan/page.tsx:97` & `:303` — crash
3. `app/dashboard/santri/setoran/page.tsx:39` — latent
4. `app/dashboard/santri/page.tsx:78` — latent
5. `app/dashboard/santri/nilai/page.tsx:35` — latent
6. `app/dashboard/musyrif/setoran/page.tsx:81` — latent

**Masalah:** `(r.rata_rata || 0)` — operator `||` hanya menangani falsy (`null`, `undefined`, `0`). Jika `rata_rata` truthy non-number (string), nilai tetap string → `.toFixed()` crash atau `+` concatenate.

**Perbaikan — semua `r.rata_rata || 0` diganti `Number(r.rata_rata) || 0` di 6 titik.**

**Verifikasi:**
- [x] Semua 6 titik diperbaiki
- [x] Tidak ada lagi `rata_rata || 0` di codebase
- [ ] Build/typecheck lulus (butuh `npm install` dulu)
- [ ] Test manual halaman admin, admin/hafalan, santri, musyrif

---

## Fase 2: Perbaiki 401 — Redirect Saat Session Expired (Prioritas: 🟡 Sedang) ✅ SELESAI

**Masalah:** JWT expired (7 hari) → middleware blokir `/api/*` dengan 401. Klien tidak tahu harus redirect ke `/login`.

**Perbaikan:**

### 2a. Fetch Wrapper — `lib/api/client.ts` (BARU)
Fungsi `apiFetch()` yang intercept response 401 → hapus localStorage → redirect ke `/login`.

### 2b. Update `lib/hooks/useApi.ts`
Semua fungsi `fetcher`, `poster`, `putter`, `deleter` sekarang pakai `apiFetch()` — otomatis redirect saat 401.

### 2c. Update `lib/hooks/useAuth.ts`
Fungsi CRUD (`getSantriList`, `getMusyrifList`, `addSantri`, `addMusyrif`, `deleteSantri`, `deleteMusyrif`) pakai `apiFetch()`.

> **Catatan:** `AuthProvider` (initial `/api/auth/me`) dan fungsi `login`/`logout` tetap pakai raw fetch untuk mencegah redirect loop di halaman publik.

### File yang diubah/dibuat:
| File | Perubahan |
|---|---|
| `lib/api/client.ts` | **Baru** — `apiFetch()` wrapper |
| `lib/hooks/useApi.ts` | Ganti `fetch` → `apiFetch` di 4 fungsi |
| `lib/hooks/useAuth.ts` | Ganti `fetch` → `apiFetch` di 6 fungsi CRUD |

---

## Fase 3: Testing & Validasi (Prioritas: 🟢 Rendah) ⏳ BELUM DIKERJAKAN

### 3a — Test Crash `rata_rata` (validasi Fase 1)

| Skenario | Langkah | Hasil Harapan |
|---|---|---|
| Nilai normal angka | Input nilai tajwid/makhraj/kelancaran (0-100) | Rata-rata tampil dengan 1 desimal, tidak error |
| Nilai 0 | Set semua nilai = 0 | Tampil `0.0` |
| Nilai string dari API | Simulasi API return `rata_rata: "85.5"` (string) | Tetap tampil `85.5` (Number() konversi otomatis) |
| Nilai null dari API | Simulasi API return `rata_rata: null` | Tampil `0.0` |
| Nilai undefined | `rata_rata` tidak ada di response | Tampil `0.0` |
| NaN | Simulasi `rata_rata: NaN` | Tampil `0.0` (Number(NaN) = NaN → `\|\| 0` = 0) |
| Nilai objek/array | Simulasi `rata_rata: {}` | Tampil `0.0` (tidak crash) |

### 3b — Test 401 Redirect (validasi Fase 2)

| Skenario | Langkah | Hasil Harapan |
|---|---|---|
| Session expired saat di dashboard | Tunggu 7 hari / hapus cookie `baitul_session` manual | Semua react-query data reload otomatis redirect ke `/login?redirect=...` |
| Session expired saat klik tombol simpan | Hapus cookie → klik "Simpan" di form setoran | Redirect ke `/login`, data tidak hilang |
| Halaman publik (login) | Buka `/login` tanpa cookie | Tidak redirect loop, halaman tampil normal |
| Register | Buka `/register` | Tidak kena 401 redirect |
| Logout manual | Klik tombol logout | Redirect ke `/login` tanpa error |

### 3c — Smoke Test Halaman

| Halaman | Cek List |
|---|---|
| `/dashboard/admin` | Statistik, daftar aktivitas, quick add | ✅ / ❌ |
| `/dashboard/admin/hafalan` | Tabel setoran, filter kelas, rata-rata tampil | ✅ / ❌ |
| `/dashboard/santri` | Profil, nilai rata-rata, target | ✅ / ❌ |
| `/dashboard/santri/setoran` | Riwayat setoran, filter | ✅ / ❌ |
| `/dashboard/santri/nilai` | Tabel nilai, rata-rata per baris | ✅ / ❌ |
| `/dashboard/musyrif/setoran` | Form input nilai, simpan setoran | ✅ / ❌ |
| `/dashboard/musyrif` | Dashboard musyrif, statistik | ✅ / ❌ |

### 3d — Regression Test Endpoints 401

| Endpoint | Method | Tanpa Cookie → Harapan |
|---|---|---|
| `/api/santri` | GET | 401 → redirect login |
| `/api/setoran` | GET | 401 → redirect login |
| `/api/settings` | GET | 401 → redirect login |
| `/api/auth/me` | GET | 401 (raw fetch, **tidak** redirect — sengaja) |
| `/api/auth/login` | POST | Tetap jalan (public route) |

---

## Risiko & Known Issues (Tidak Diperbaiki di Sprint Ini)

### 1. 37 Raw `fetch` di Page Components — ⚠️ Risiko Sedang

Ada **37 pemanggilan `fetch('/api/...')` langsung** di page components yang **tidak** menggunakan `apiFetch()` wrapper.

**Dampak:** Jika session expired saat user sedang berinteraksi di halaman tersebut, raw fetch tetap dapat 401 tapi **tidak redirect** ke login. User hanya melihat data kosong/error.

**Contoh lokasi:**
- `app/dashboard/admin/santri/page.tsx:109-110`
- `app/dashboard/admin/sertifikat/page.tsx:132-134`
- `app/dashboard/admin/kehadiran/page.tsx:52-54`
- `app/dashboard/admin/informasi/page.tsx:85`
- `app/dashboard/santri/page.tsx:56,72,91`
- `app/dashboard/musyrif/presensi/page.tsx:167`
- dan 25 lainnya

**Rekomendasi:**
- **Opsi A (direkomendasikan):** Override global `fetch` di `lib/api/client.ts` agar semua `fetch` otomatis intercept 401 (1 perubahan, cover semua)
- **Opsi B:** Migrasi bertahap — ganti satu per satu `fetch` → `apiFetch`

### 2. Belum `npm install` — Build/Typecheck belum diverifikasi

Dependencies belum terinstall, sehingga `npm run lint` dan `npm run build` belum bisa dijalankan untuk memvalidasi tidak ada type error.

### 3. Belum ada fallback UI untuk error API

Saat API gagal (termasuk 401 redirect), tidak ada toast/notifikasi ke user sebelum redirect. User langsung dibawa ke `/login` tanpa penjelasan.
