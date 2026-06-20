'use client';

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
import { useSantriList, useTargetList, useCreateTarget } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { apiKeys } from '@/lib/hooks/useApi';

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
  nis: string;
  santriName: string;
  kelasNama: string;
  juzTarget: string;
  namaSurat: string;
  progres: number;
  statusLulus: 'Proses' | 'Lulus' | 'Belum Lulus';
  catatan?: string;
  updatedAt: string;
}

// ─── Default Seed Data ────────────────────────────────────────────────────────

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

  const { data: santriData } = useSantriList();
  const { data: targetData } = useTargetList();
  const createTarget = useCreateTarget();
  const queryClient = useQueryClient();

  // Form input states
  const [targetSantriId,  setTargetSantriId]  = useState('');
  const [newTargetJuz,    setNewTargetJuz]     = useState('1');
  const [newNamaSurat,    setNewNamaSurat]     = useState('');
  const [newProgres,      setNewProgres]       = useState('60');
  const [newStatusLulus,  setNewStatusLulus]   = useState<'Proses' | 'Lulus' | 'Belum Lulus'>('Proses');
  const [newCatatan,      setNewCatatan]       = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const santriList: Santri[] = (santriData?.data || []).map((s: any) => ({
    id: s.id,
    nis: s.nis || '',
    nisn: s.nisn || '',
    nama_lengkap: s.full_name || '',
    kelas_id: s.kelas_id || '',
    kelas_nama: s.kelas_nama || '',
    is_active: s.is_active,
  }));

  const records: TargetRecord[] = (targetData?.data || []).map((r: any) => ({
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

  // ── Set default santri + pre-fill form ─────────────────────────────────────
  useEffect(() => {
    if (santriList.length > 0 && !targetSantriId) {
      setTargetSantriId(santriList[0].id);
    }
  }, [santriList, targetSantriId]);

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
        queryClient.invalidateQueries({ queryKey: apiKeys.target.all });
      } else {
        await createTarget.mutateAsync({
          santuario_id: selectedSantri.id,
          surah: newNamaSurat.trim(),
          juz: parseInt(newTargetJuz) || 1,
          progres: prog,
          status: apiStatus,
          catatan: newCatatan.trim(),
          target_date: new Date().toISOString().split('T')[0]
        });
      }

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
    <>

        {/* ── Notifikasi Toast ── */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 max-w-sm text-center">
            <CheckCircle2 className="text-tosca-400 shrink-0" size={18} />
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
              <h3 className="text-sm font-black text-slate-800">Kelola Target Tahsin Siswa</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Data ini akan digunakan untuk menerbitkan sertifikat</p>
            </div>
          </div>

          <form onSubmit={handleUpdateTarget} className="space-y-4">

            {/* Pilih Santri */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Pilih Siswa
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
                  Progres Tahsin (%)
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
                Catatan Guru <span className="normal-case font-normal text-slate-400">(opsional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Tahsin lancar dan tartil, siap untuk munaqasyah..."
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
                  <th className="py-4 px-5">Nama Siswa</th>
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
                <Activity size={12} /> Catatan Guru
              </p>
              {santriList.map(s => {
                const rec = records.find(r => r.santriId === s.id);
                if (!rec || !rec.catatan) return null;
                return (
                  <div key={s.id} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="font-black text-fuchsia-600 shrink-0">{s.nama_lengkap}:</span>
                    <span className="font-semibold italic">&ldquo;{rec.catatan}&rdquo;</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

    </>
  );
}
