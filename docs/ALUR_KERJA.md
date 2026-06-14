# Alur Kerja Manajemen Al-Quran

## Arsitektur Data

```
Admin ──→ CRUD semua data ──→ PostgreSQL (NeonDB)
                                 ↑
Musyrif ──→ Input Setoran & Evaluasi ──→ Data
                                 ↑
Santri  ──→ Read-only (kecuali profil sendiri)
```

- **Admin** memiliki akses penuh (CRUD) terhadap semua entitas
- **Musyrif** mengelola setoran, evaluasi, dan melihat data binaannya
- **Santri** view-only: melihat nilai, presensi, sertifikat, jadwal, target, informasi

---

## 1. Peran Admin

### Halaman & Fitur

| Halaman | Fungsi | Alur Data |
|---------|--------|-----------|
| Dashboard | Ringkasan statistik, jadwal hari ini, aktivitas terbaru, quick add | Stat dari agregat API; Jadwal dari `/api/jadwal`; Aktivitas dari data terbaru |
| Santri | Tambah/edit/hapus santri | CRUD via `/api/santri`; data dipakai Musyrif & Santri |
| Musyrif | Tambah/edit/hapus musyrif + akun login | CRUD via `/api/musyrif`; tiap musyrif terkait dengan kelas |
| Kelas | Tambah/edit/hapus kelas | CRUD via `/api/kelas`; kelas jadi referensi santri & jadwal |
| Nilai | Lihat nilai semua santri per kelas | Read dari `/api/nilai` (aggregasi setoran + absensi) |
| Tahsin | Rekap setoran Tahsin | Read dari `/api/setoran` |
| Kehadiran | Rekap absensi | Read dari `/api/absensi` |
| Jadwal | Atur jadwal kelas | CRUD via `/api/jadwal`; jadwal tampil di dashboard & role lain |
| Sertifikat | Kelola sertifikat, publish/unpublish | CRUD via `/api/sertifikat`; trigger `syncSertifikatRecords` untuk bulk upsert |
| Informasi | Buat/edit/hapus pengumuman | CRUD via `/api/informasi`; bisa target ke MUSYRIF, SANTRI, atau ALL |
| Settings | Konfigurasi aplikasi | CRUD via `/api/settings` |

### Alur Bisnis Admin

1. **Setup Awal**: Admin membuat Kelas → Santri → Musyrif
2. **Operasional Harian**: Admin bisa memantau nilai, setoran, absensi via dashboard
3. **Sertifikat**: Admin mengelola penerbitan sertifikat, bisa publish agar terlihat santri/musyrif
4. **Informasi**: Admin membuat pengumuman yang ditargetkan ke role tertentu

### Diagram Alur Data

```
Admin buat Kelas ──→ Musyrif ditugaskan ke kelas
                  ──→ Santri ditempatkan di kelas
                  ──→ Jadwal dibuat per kelas
                      
Admin input Sertifikat ──→ Musyrif & Santri bisa lihat (jika published)
Admin buat Informasi   ──→ Tampil di dashboard role target
```

---

## 2. Peran Musyrif

### Halaman & Fitur

| Halaman | Fungsi | Alur Data |
|---------|--------|-----------|
| Dashboard | Ringkasan kelas binaan, jadwal, aktivitas | Fetch profil via `/api/musyrif/{id}` untuk dapat `kelas_id`; filter data berdasarkan kelas |
| Jadwal | Lihat jadwal mengajar | Read `/api/jadwal` |
| Setoran | Input setoran Tahsin santri | Create & Read via `/api/setoran`; data masuk ke riwayat Tahsin |
| Input Nilai | Input nilai santri | Read setoran + write evaluasi via `/api/evaluasi` |
| Presensi | Absensi santri | Create & Read via `/api/absensi` |
| Status | Status Tahsin santri | Read aggregasi data setoran |
| Evaluasi | Catatan evaluasi santri | CRUD via `/api/evaluasi` |
| Target | Lihat & update target Tahsin | Read/write via `/api/target` |
| Sertifikat | Lihat sertifikat santri binaan | Read `/api/sertifikat` filter by `kelas_id`; hanya yang `isPublished` |
| Informasi | Lihat pengumuman | Read `/api/informasi` filter `target_role = MUSYRIF` atau `ALL` |
| Kelas Virtual | Link Zoom/meeting | Read dari `/api/zoom-meetings` |
| Profil | Lihat data diri | Read dari `/api/musyrif/{id}` |

### Alur Bisnis Musyrif

1. **Masuk**: Login → Dashboard menampilkan data sesuai kelas binaan
2. **Setoran**: Setiap pertemuan, Musyrif mencatat setoran Tahsin (tajwid, makhraj, kelancaran score, status LANJUT/ULANGI)
3. **Presensi**: Mencatat kehadiran santri setiap pertemuan
4. **Nilai**: Memberikan evaluasi nilai berdasarkan setoran & absensi
5. **Target**: Memantau & memperbarui target Tahsin santri

### Diagram Alur Data

```
Login ──→ Fetch profil (dapat kelas_id)
         │
         ├──→ Input Setoran ──→ Data setoran (santri_id, scores, status)
         ├──→ Input Presensi ──→ Data absensi (santri_id, status, tanggal)
         ├──→ Input Evaluasi ──→ Data evaluasi (santri_id, catatan)
         │
         └──→ View data ──→ Filter by kelas_id → Nilai, Sertifikat, Target, Informasi
```

---

## 3. Peran Santri

### Halaman & Fitur

| Halaman | Fungsi | Alur Data |
|---------|--------|-----------|
| Dashboard | Ringkasan nilai, jadwal, aktivitas terbaru | Read dari berbagai endpoint; data difilter berdasarkan santri yang login |
| Jadwal | Lihat jadwal pelajaran | Read `/api/jadwal` |
| Presensi | Riwayat kehadiran | Read `/api/absensi` filter by `santri_id` |
| Nilai | Lihat nilai & raport | Read `/api/nilai` filter by `santri_id` (aggregasi setoran & absensi) |
| Sertifikat | Lihat sertifikat yang sudah publish | Read `/api/sertifikat` filter by `santri_id` + `isPublished` |
| Evaluasi | Lihat evaluasi dari musyrif | Read `/api/evaluasi` filter by `santri_id` |
| Target | Lihat target Tahsin | Read `/api/target` filter by `santri_id` |
| Informasi | Lihat pengumuman | Read `/api/informasi` filter `target_role = SANTRI` atau `ALL` |
| Kelas Virtual | Link Zoom/meeting | Read `/api/zoom-meetings` |
| Profil | Lihat & edit profil | Read/write `/api/santri/{id}` |
| Zoom | Daftar meeting Zoom | Read `/api/zoom-meetings` |

### Alur Bisnis Santri

1. **Masuk**: Login → Dashboard menampilkan ringkasan data pribadi
2. **Monitoring**: Santri memantau nilai, presensi, sertifikat, target secara real-time
3. **Informasi**: Mendapat pengumuman dari Admin

### Diagram Alur Data

```
Login ──→ Dashboard (ringkasan pribadi)
         │
         ├──→ Lihat Nilai ──→ Data dari setoran + evaluasi (read-only)
         ├──→ Lihat Presensi ──→ Riwayat absensi (read-only)
         ├──→ Lihat Sertifikat ──→ Sertifikat published (read-only)
         ├──→ Lihat Jadwal ──→ Jadwal kelas (read-only)
         └──→ Lihat Informasi ──→ Pengumuman dari Admin (read-only)
```

---

## Relasi Antar Role

```
                      ADMIN
                    /   |    \
                   /    |     \
                  /     |      \
            MUSYRIF ────┼─── SANTRI
               │         │        │
               │  CRUD   │  Input │  View-only
               │  setoran│  nilai │
               │  evaluasi        │
               └──────────────────┘
                 View sertifikat,
                 informasi, target
```

- **Admin** → segala CRUD
- **Musyrif** → input operasional (setoran, presensi, evaluasi) + view data kelas binaan
- **Santri** → view data pribadi, tidak bisa mengubah data utama

---

## Alur Autentikasi

```
Login Form
    │
    ├── POST /api/auth/login { email, password }
    │
    ├── Validasi: email ditemukan? password (SHA256) cocok?
    │
    ├── Success → Set cookie `session` → Redirect ke dashboard sesuai role
    │
    └── Gagal → Tampilkan error
```

- Login menggunakan **email** (bukan username)
- Password di-hash dengan **SHA256** di client sebelum dikirim
- Session disimpan di cookie HTTP-only via middleware
- Middleware (`middleware.ts`) mengecek session & role setiap kali akses halaman dashboard

---

## Catatan Teknis

- Semua API endpoint mengembalikan format `{ data: {...} }` atau `{ data: [...] }`
- Frontend menggunakan **Next.js 14 (App Router)** dengan `'use client'` + React hooks
- Database **PostgreSQL** di **NeonDB**; migrations ada di `database/migrations/`
- Role-based access: Middleware memblokir akses halaman yang tidak sesuai role user
