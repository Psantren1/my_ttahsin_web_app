'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  Home, 
  BookOpen, 
  Star, 
  CheckSquare, 
  User, 
  Activity,
  Sparkles,
  BookMarked,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  is_active: boolean;
}

interface TargetRecord {
  id: string;
  santriId: string;
  nis: string;           // ← BARU: untuk sinkron NIS ke sertifikat
  santriName: string;
  kelasNama: string;
  juzTarget: string;
  namaSurat: string;     // ← BARU: nama surat yang sedang dihafal
  progres: number;
  statusLulus: 'Proses' | 'Lulus' | 'Belum Lulus'; // ← BARU
  catatan?: string;      // ← BARU: catatan opsional musyrif
  updatedAt: string;
}

// ─── Default Seed Data (sudah mengandung field baru) ──────────────────────────

const defaultTargetRecords: TargetRecord[] = [];

// ─── Status Config ─────────────────────────────────────────────────────────────

const statusConfig = {
  'Lulus': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
  'Proses': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    dot: 'bg-amber-400',
  },
  'Belum Lulus': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
    dot: 'bg-rose-500',
  },
};

// ─── Komponen Utama ────────────────────────────────────────────────────────────

export default function TargetPage() {
  const { settings } = useSettings();
  const { user } = useAuth();

  // Data states
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [records, setRecords]       = useState<TargetRecord[]>([]);

  // Form input states
  const [targetSantriId,  setTargetSantriId]  = useState('1');
  const [newTargetJuz,    setNewTargetJuz]     = useState('1');
  const [newNamaSurat,    setNewNamaSurat]     = useState('');
  const [newProgres,      setNewProgres]       = useState('60');
  const [newStatusLulus,  setNewStatusLulus]   = useState<'Proses' | 'Lulus' | 'Belum Lulus'>('Proses');
  const [newCatatan,      setNewCatatan]       = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  // ── Load from API ─────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const [santriRes, targetRes] = await Promise.all([
        fetch('/api/santri'),
        fetch('/api/target')
      ]);
      if (santriRes.ok) {
        const santriData = await santriRes.json();
        setSantriList((santriData.data || []).map((s: any) => ({
          id: s.id,
          nis: s.nis || '',
          nisn: s.nisn || '',
          nama_lengkap: s.full_name || '',
          kelas_id: s.kelas_id || '',
          kelas_nama: s.kelas_nama || '',
          is_active: s.is_active,
        })));
      }
      if (targetRes.ok) {
        const targetData = await targetRes.json();
        const mapped = (targetData.data || []).map((r: any) => ({
          id: r.id,
          santriId: r.santuario_id,
          nis: r.nis || '',
          santriName: r.santri_nama || '',
          kelasNama: r.kelas_nama || '',
          juzTarget: String(r.juz || ''),
          namaSurat: r.surah || '',
          progres: r.progres || 0,
          statusLulus: r.status === 'SELESAI' ? 'Lulus' : r.status === 'TERLAMBAT' ? 'Belum Lulus' : 'Proses',
          catatan: r.catatan || '',
          updatedAt: r.target_date ? new Date(r.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
        }));
        setRecords(mapped);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pre-fill form saat pilih santri berubah ────────────────────────────────
  useEffect(() => {
    const existing = records.find(r => r.santriId === targetSantriId);
    if (existing) {
      setNewTargetJuz(existing.juzTarget);
      setNewNamaSurat(existing.namaSurat || '');
      setNewProgres(String(existing.progres));
      setNewStatusLulus(existing.statusLulus || 'Proses');
      setNewCatatan(existing.catatan || '');
    } else {
      setNewTargetJuz('1');
      setNewNamaSurat('');
      setNewProgres('0');
      setNewStatusLulus('Proses');
      setNewCatatan('');
    }
  }, [targetSantriId, records]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Simpan / Update Target ─────────────────────────────────────────────────
  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSantri = santriList.find(s => s.id === targetSantriId);
    if (!selectedSantri) return;

    const prog = parseInt(newProgres) || 0;
    if (prog < 0 || prog > 100) {
      alert('Persentase progres harus antara 0 – 100%!');
      return;
    }
    if (!newNamaSurat.trim()) {
      alert('Nama Surat wajib diisi!');
      return;
    }

    try {
      const existing = records.find(r => r.santriId === targetSantriId);
      const apiStatus = newStatusLulus === 'Lulus' ? 'SELESAI' : newStatusLulus === 'Belum Lulus' ? 'TERLAMBAT' : 'BELUM';

      if (existing && existing.id) {
        const res = await fetch(`/api/target/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            santuario_id: selectedSantri.id,
            surah: newNamaSurat.trim(),
            juz: parseInt(newTargetJuz) || 1,
            progres: prog,
            status: apiStatus,
            catatan: newCatatan.trim(),
            target_date: new Date().toISOString().split('T')[0]
          })
        });
        if (!res.ok) throw new Error('Failed to update target');
      } else {
        const res = await fetch('/api/target', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            santuario_id: selectedSantri.id,
            surah: newNamaSurat.trim(),
            juz: parseInt(newTargetJuz) || 1,
            progres: prog,
            status: apiStatus,
            catatan: newCatatan.trim(),
            target_date: new Date().toISOString().split('T')[0]
          })
        });
        if (!res.ok) throw new Error('Failed to create target');
      }

      await loadData();

      showNotification(
        `Target ${selectedSantri.nama_lengkap} → Juz ${newTargetJuz} (${newNamaSurat}) berhasil disimpan!`
      );
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan target');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/musyrif"
              className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Target Hafalan</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">
                  {settings.appName} • TA {settings.tahunAjaran}
                </span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center font-bold text-sm">
            UM
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Notifikasi Toast ── */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 max-w-sm text-center">
            <CheckCircle2 className="text-teal-400 shrink-0" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* ── Form Update Target ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Kelola Target Hafalan Santri</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Data ini akan digunakan untuk menerbitkan sertifikat</p>
            </div>
          </div>

          <form onSubmit={handleUpdateTarget} className="space-y-4">

            {/* Pilih Santri */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Pilih Santri
              </label>
              <select
                value={targetSantriId}
                onChange={(e) => setTargetSantriId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
              >
                {santriList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama_lengkap} — {s.kelas_nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Baris: Juz Target + Nama Surat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Target Juz (1 – 30)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={newTargetJuz}
                  onChange={(e) => setNewTargetJuz(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Nama Surat yang Dihafal
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Baqarah, An-Naba'"
                  value={newNamaSurat}
                  onChange={(e) => setNewNamaSurat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
            </div>

            {/* Baris: Progres + Status Kelulusan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Progres Hafalan (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={newProgres}
                  onChange={(e) => setNewProgres(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Status Kelulusan
                </label>
                <select
                  value={newStatusLulus}
                  onChange={(e) => setNewStatusLulus(e.target.value as 'Proses' | 'Lulus' | 'Belum Lulus')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
                >
                  <option value="Proses">🔄 Proses</option>
                  <option value="Lulus">✅ Lulus</option>
                  <option value="Belum Lulus">❌ Belum Lulus</option>
                </select>
              </div>
            </div>

            {/* Catatan (opsional) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Catatan Musyrif <span className="normal-case font-normal text-slate-400">(opsional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Hafalan lancar dan tartil, siap untuk munaqasyah..."
                value={newCatatan}
                onChange={(e) => setNewCatatan(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-[.98] text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-fuchsia-100 transition-all flex items-center justify-center gap-2"
            >
              <Target size={16} />
              Simpan Target & Progres
            </button>
          </form>
        </div>

        {/* ── Tabel Pemantauan Target ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50/10 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={18} />
            <h3 className="text-sm font-black text-slate-800">Pemantauan Target & Progres Halaqah</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-4 px-5">Nama Santri</th>
                  <th className="py-4 px-5">Kelas</th>
                  <th className="py-4 px-5 text-center">Target Juz</th>
                  <th className="py-4 px-5">Nama Surat</th>
                  <th className="py-4 px-5">Progres</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-center">Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {santriList.map(s => {
                  const rec    = records.find(r => r.santriId === s.id);
                  const hasRec = rec !== undefined;
                  const status = hasRec ? rec.statusLulus : 'Proses';
                  const cfg    = statusConfig[status];
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/40 transition-all group">

                      {/* Nama */}
                      <td className="py-4 px-5">
                        <p className="font-black text-slate-900 text-sm">{s.nama_lengkap}</p>
                        <p className="text-[10px] text-slate-400 font-bold">NIS: {s.nis}</p>
                      </td>

                      {/* Kelas */}
                      <td className="py-4 px-5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 font-extrabold text-[9px] uppercase">
                          {s.kelas_nama}
                        </span>
                      </td>

                      {/* Target Juz */}
                      <td className="py-4 px-5 text-center">
                        <span className="px-3 py-1 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 rounded-lg text-xs font-black">
                          Juz {hasRec ? rec.juzTarget : '—'}
                        </span>
                      </td>

                      {/* Nama Surat */}
                      <td className="py-4 px-5">
                        {hasRec && rec.namaSurat ? (
                          <div className="flex items-center gap-1.5">
                            <BookMarked className="text-tosca-400 shrink-0" size={13} />
                            <span className="text-xs font-bold text-slate-700">{rec.namaSurat}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold">—</span>
                        )}
                      </td>

                      {/* Progres bar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5 min-w-[120px]">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-px">
                            <div
                              className="h-full bg-fuchsia-500 rounded-full transition-all duration-500"
                              style={{ width: `${hasRec ? rec.progres : 0}%` }}
                            />
                          </div>
                          <span className="font-black text-slate-700 shrink-0 text-[11px] w-8 text-right">
                            {hasRec ? rec.progres : 0}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wide ${cfg.badge}`}>
                          <StatusIcon size={10} />
                          {status}
                        </span>
                      </td>

                      {/* Tanggal update */}
                      <td className="py-4 px-5 text-center text-[10px] font-bold text-slate-400">
                        {hasRec ? rec.updatedAt : <span className="text-slate-200">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Info catatan di bawah tabel */}
          {records.some(r => r.catatan) && (
            <div className="p-5 border-t border-slate-50 bg-slate-50/20 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} /> Catatan Musyrif
              </p>
              {santriList.map(s => {
                const rec = records.find(r => r.santriId === s.id);
                if (!rec || !rec.catatan) return null;
                return (
                  <div key={s.id} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="font-black text-fuchsia-600 shrink-0">{s.nama_lengkap}:</span>
                    <span className="font-semibold italic">"{rec.catatan}"</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 sm:px-6 py-2.5 flex items-center justify-around shadow-2xl lg:hidden">
        <Link href="/dashboard/musyrif" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Utama</span>
        </Link>
        <Link href="/dashboard/musyrif/setoran" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <BookOpen size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Setoran</span>
        </Link>
        <Link href="/dashboard/musyrif/nilai" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <Star size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/musyrif/presensi" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <CheckSquare size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Presensi</span>
        </Link>
        <Link href="/dashboard/musyrif/profil" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <User size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}