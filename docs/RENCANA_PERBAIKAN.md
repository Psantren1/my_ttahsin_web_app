# RENCANA PERBAIKAN BERDASARKAN AUDIT

**Tanggal:** 7 Juli 2026
**Projek:** Baitul Huffaz Tahsin Management System
**Status:** Draft

---

## DAFTAR ISU

| No | Isu | Prioritas | Status |
|----|-----|-----------|--------|
| 1 | API Routes tidak cek role di server-side | 🔴 KRITIS | Belum Diperbaiki |
| 2 | Middleware tidak verifikasi signature JWT | 🔴 KRITIS | Belum Diperbaiki |
| 3 | Musyrif akses semua santri (tidak di-filter per kelas) | 🟡 SEDANG | Belum Diperbaiki |
| 4 | Upsert pattern tidak konsisten (race condition) | 🟡 SEDANG | Belum Diperbaiki |

---

## ISU 1: API ROUTES TIDAK CEK ROLE DI SERVER-SIDE

### Masalah

Banyak API routes hanya mengandalkan middleware untuk cek session valid, tetapi **tidak memverifikasi role** di route handler. Artinya secara teknis santri yang tahu endpoint bisa membuat data sendiri (setoran palsu, presensi sendiri, evaluasi palsu, dll).

### File Yang SUDAH Benar (Sudah Ada Role Check ADMIN)

| File | Method | Keterangan |
|------|--------|------------|
| `app/api/santri/route.ts` | POST | ✅ Cek `session.role !== 'ADMIN'` |
| `app/api/santri/[id]/route.ts` | PUT, DELETE | ✅ Cek `session.role !== 'ADMIN'` |
| `app/api/musyrif/route.ts` | POST | ✅ Cek `session.role !== 'ADMIN'` |
| `app/api/musyrif/[id]/route.ts` | PUT, DELETE | ✅ Cek `session.role !== 'ADMIN'` |
| `app/api/kelas/route.ts` | POST | ✅ Cek `session.role !== 'ADMIN'` |
| `app/api/kelas/[id]/route.ts` | PUT, DELETE | ✅ Cek `session.role !== 'ADMIN'` |
| `app/api/kelas/bulk-reassign/route.ts` | POST | ✅ Cek `session.role === 'ADMIN'` |
| `app/api/auth/register/route.ts` | POST | ✅ Cek `session.role !== 'ADMIN'` |

### File Yang PERLU Ditambah Role Check

#### A. Data Penilaian Akademik (Role: ADMIN atau MUSYRIF)

| File | Method | Role Check |
|------|--------|------------|
| `app/api/setoran/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/setoran/[id]/route.ts` | PUT, DELETE | ADMIN atau MUSYRIF |
| `app/api/absensi/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/absensi/[id]/route.ts` | PUT, DELETE | ADMIN atau MUSYRIF |
| `app/api/evaluasi/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/evaluasi/[id]/route.ts` | PUT, DELETE | ADMIN atau MUSYRIF |
| `app/api/target/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/target/[id]/route.ts` | PUT, DELETE | ADMIN atau MUSYRIF |
| `app/api/btq-pemula/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/btq-pemula/[id]/route.ts` | DELETE | ADMIN atau MUSYRIF |
| `app/api/btq-lanjutan/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/btq-lanjutan/[id]/route.ts` | DELETE | ADMIN atau MUSYRIF |
| `app/api/tahfidz/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/tahfidz/[id]/route.ts` | DELETE | ADMIN atau MUSYRIF |
| `app/api/murojaah/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/murojaah/[id]/route.ts` | DELETE | ADMIN atau MUSYRIF |

#### B. Data Struktural (Role: ADMIN Saja)

| File | Method | Role Check |
|------|--------|------------|
| `app/api/jadwal/route.ts` | POST | ADMIN saja |
| `app/api/jadwal/[id]/route.ts` | PUT, DELETE | ADMIN saja |
| `app/api/informasi/route.ts` | POST | ADMIN saja |
| `app/api/informasi/[id]/route.ts` | PUT, DELETE | ADMIN saja |
| `app/api/sertifikat/route.ts` | POST | ADMIN saja |
| `app/api/sertifikat/[id]/route.ts` | PUT, DELETE | ADMIN saja |

#### C. Data Virtual Class (Role: ADMIN atau MUSYRIF)

| File | Method | Role Check |
|------|--------|------------|
| `app/api/zoom-meetings/route.ts` | POST | ADMIN atau MUSYRIF |
| `app/api/zoom-meetings/[id]/route.ts` | PUT, DELETE | ADMIN atau MUSYRIF |

### Solusi: Buat Helper Function `requireRole()`

**File:** `lib/auth/auth.ts`

Tambahkan function baru:

```typescript
import { NextResponse } from 'next/server';

export async function requireRole(
  allowedRoles: string[]
): Promise<{ session: Session | null; error: NextResponse | null }> {
  const session = await getSession();
  if (!session || !allowedRoles.includes(session.role)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Akses ditolak — role tidak memiliki izin' },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}
```

### Contoh Penerapan

**Sebelum (tidak ada role check):**

```typescript
// app/api/setoran/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const setoran = await createSetoran(body);
    return NextResponse.json({ data: setoran });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan setoran' }, { status: 500 });
  }
}
```

**Sesudah (sudah ada role check):**

```typescript
// app/api/setoran/route.ts
import { getSession, requireRole } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF']);
    if (error) return error;

    const body = await request.json();
    const setoran = await createSetoran(body);
    return NextResponse.json({ data: setoran });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan setoran' }, { status: 500 });
  }
}
```

### Total File Yang Perlu Diubah: 24 files

---

## ISU 2: MIDDLEWARE TIDAK VERIFIKASI SIGNATURE JWT

### Masalah

**File:** `middleware.ts:14`

Middleware hanya **decode** base64 JWT payload tanpa **verifikasi HMAC signature**. Artinya middleware bisa dipalsukan jika attacker tahu struktur payloadnya. Verifikasi signature hanya dilakukan di `lib/auth/jwt.ts` yang dipanggil oleh `getSession()` di route handler.

```typescript
// Current code - HANYA DECODE, TIDAK VERIFY SIGNATURE
const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
if (Date.now() > payload.exp) return null;
```

### Solusi

**File:** `middleware.ts`

Ganti `getSession()` function untuk menggunakan `verifyJWT` dari `lib/auth/jwt.ts`:

```typescript
import { verifyJWT } from './lib/auth/jwt';

function getSession(request: NextRequest): { id: string; email: string; fullName: string; role: string } | null {
  try {
    const cookie = request.cookies.get('baitul_session');
    if (!cookie?.value) return null;

    const decoded = verifyJWT(cookie.value);
    if (!decoded) return null;

    return {
      id: decoded.id as string,
      email: decoded.email as string,
      fullName: decoded.fullName as string,
      role: decoded.role as string,
    };
  } catch {
    return null;
  }
}
```

**Penjelasan:**

- `verifyJWT()` di `lib/auth/jwt.ts:23` sudah melakukan:
  1. Verifikasi HMAC signature (`crypto.createHmac('sha256', secret)`)
  2. Verifikasi expiry (`Date.now() > payload.exp`)
- Middleware hanya perlu memanggil `verifyJWT()` daripada decode manual

### Total File Yang Perlu Diubah: 1 file

---

## ISU 3: MUSYRIF AKSES SEMUA SANTRI

### Masalah

Di `app/dashboard/musyrif/setoran/page.tsx`, data santri di-fetch dari `useSantriList()` yang mengambil **semua santri** tanpa filter `kelas_id`. Meskipun setoran di-filter oleh `musyrif_id`, musyrif bisa melihat data semua santri di sistem.

### Solusi

**File:** `app/dashboard/musyrif/setoran/page.tsx`

1. Fetch data musyrif terlebih dahulu untuk mendapatkan `kelas_id` yang di-bina
2. Filter daftar santri berdasarkan `kelas_id` tersebut
3. Implementasi di semua halaman musyrif yang menampilkan daftar santri:
   - `app/dashboard/musyrif/setoran/page.tsx`
   - `app/dashboard/musyrif/nilai/page.tsx`
   - `app/dashboard/musyrif/status/page.tsx`
   - `app/dashboard/musyrif/evaluasi/page.tsx`
   - `app/dashboard/musyrif/presensi/page.tsx`
   - `app/dashboard/musyrif/target/page.tsx`

### Total File Yang Perlu Diubah: 6 files

---

## ISU 4: UPSERT PATTERN TIDAK KONSISTEN

### Masalah

4 service files menggunakan **check-then-insert/update** (2 queries) yang rentan race condition. Bandingkan dengan `absensi.service.ts` yang sudah benar menggunakan `ON CONFLICT` (1 atomic query).

### File Yang PERLU Diperbaiki

| File | Baris | Masalah |
|------|-------|---------|
| `lib/services/tahfidz.service.ts` | 83-103 | check-then-insert/update |
| `lib/services/murojaah.service.ts` | 81-101 | check-then-insert/update |
| `lib/services/btq-pemula.service.ts` | 79-95 | check-then-insert/update |
| `lib/services/btq-lanjutan.service.ts` | 81-99 | check-then-insert/update |

### Solusi: Ganti ke `ON CONFLICT` Atomic Upsert

**Contoh: tahfidz.service.ts**

**Sebelum:**

```typescript
export async function upsertTahfidz(data: {...}): Promise<Tahfidz> {
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM tahfidz WHERE santuario_id = $1', [data.santuario_id]
  );
  if (existing) {
    // UPDATE...
    return queryOne<Tahfidz>(sql, [...]) as Promise<Tahfidz>;
  }
  // INSERT...
  return queryOne<Tahfidz>(sql, [...]) as Promise<Tahfidz>;
}
```

**Sesudah:**

```typescript
export async function upsertTahfidz(data: {
  santuario_id: string;
  musyrif_id?: string | null;
  juz?: number | null;
  surat?: string | null;
  ayat?: string | null;
  hafalan_baru?: string | null;
  nilai?: number | null;
  status_setoran?: string | null;
  predikat?: string | null;
}): Promise<Tahfidz> {
  const sql = `
    INSERT INTO tahfidz (santuario_id, juz, surat, ayat, hafalan_baru, nilai, status_setoran, predikat, musyrif_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (santuario_id) DO UPDATE SET
      juz = EXCLUDED.juz,
      surat = EXCLUDED.surat,
      ayat = EXCLUDED.ayat,
      hafalan_baru = EXCLUDED.hafalan_baru,
      nilai = EXCLUDED.nilai,
      status_setoran = EXCLUDED.status_setoran,
      predikat = EXCLUDED.predikat,
      musyrif_id = EXCLUDED.musyrif_id,
      updated_at = NOW()
    RETURNING *
  `;
  return queryOne<Tahfidz>(sql, [
    data.santuario_id,
    data.juz ?? null,
    data.surat ?? null,
    data.ayat ?? null,
    data.hafalan_baru ?? null,
    data.nilai ?? null,
    data.status_setoran ?? null,
    data.predikat ?? null,
    data.musyrif_id ?? null,
  ]) as Promise<Tahfidz>;
}
```

**Contoh Penerapan Lainnya:**

| Service | Tabel | Conflict Column | Kolom Yang Diupdate |
|---------|-------|-----------------|---------------------|
| tahfidz | `tahfidz` | `santuario_id` | juz, surat, ayat, hafalan_baru, nilai, status_setoran, predikat, musyrif_id |
| murojaah | `murojaah` | `santuario_id` | juz, surah, ayat, nilai, status_murojaah, predikat, musyrif_id |
| btq_pemula | `btq_pemula` | `santuario_id` | jilid, halaman, nilai, predikat, catatan, musyrif_id |
| btq_lanjutan | `btq_lanjutan` | `santuario_id` | level, juz_surah, nilai, status_bacaan, predikat, status_penilaian, musyrif_id |

### Total File Yang Perlu Diubah: 4 files

---

## RINGKASAN EKSEKUSI

| No | Prioritas | Deskripsi | Jumlah File | Estimasi Waktu |
|----|-----------|-----------|-------------|----------------|
| 1 | 🔴 Urgent | Tambah `requireRole()` helper | 1 | 10 menit |
| 2 | 🔴 Urgent | Tambah role check di API routes | 24 | 60 menit |
| 3 | 🔴 Urgent | Fix JWT verification di middleware | 1 | 10 menit |
| 4 | 🡡 Important | Fix upsert pattern (4 service files) | 4 | 30 menit |
| 5 | 🟡 Important | Filter santri di musyrif dashboard | 6 | 30 menit |
| | | **TOTAL** | **36 files** | **~2.5 jam** |

### Urutan Pengerjaan

1. **Fase 1 - Keamanan Kritis** (Isu 1 & 2)
   - Buat `requireRole()` helper di `lib/auth/auth.ts`
   - Fix JWT verification di `middleware.ts`
   - Tambah role check di semua 24 API route files

2. **Fase 2 - Konsistensi Data** (Isu 4)
   - Fix upsert pattern di 4 service files

3. **Fase 3 - Akses Kontrol** (Isu 3)
   - Filter data santri di halaman musyrif

---

## CATATAN TAMBAHAN

### Delete Behavior (SUDAH BENAR)

Setelah dicek ulang, `deleteUser()` di `lib/services/user.service.ts:212` sudah melakukan **soft delete** (`UPDATE users SET is_active = false`). Tidak ada konflik dengan API route handlers yang memanggil `deleteUser()`.

### API Routes Yang TIDAK Perlu Role Check

- `GET` endpoints di semua routes — boleh diakses semua role yang sudah login (data di-filter di sisi client atau query)
- `/api/auth/login` — public endpoint
- `/api/auth/me` — mengembalikan data session user sendiri
- `/api/debug` — hanya untuk development
- `/api/settings` — GET boleh semua role, PUT hanya ADMIN (sudah benar)

---

* Dokumen ini dibuat berdasarkan audit kode projek Baitul Huffaz Tahsin Management System
* Terakhir diperbarui: 7 Juli 2026
