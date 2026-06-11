'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  ClipboardList, 
  CheckCircle2, 
  Home, 
  BookOpen, 
  Star, 
  CheckSquare, 
  User, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';

// Interfaces
interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  is_active: boolean;
}

interface EvaluasiRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasNama: string;
  adab: string; // e.g. "Sangat Baik", "Baik", "Cukup"
  keterangan: string; // Catatan tertulis
  updatedAt: string;
}

const defaultEvaluasiRecords: EvaluasiRecord[] = [];

export default function EvaluasiPage() {
  const { settings } = useSettings();
  const { user } = useAuth();
  
  // Data list states
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [records, setRecords] = useState<EvaluasiRecord[]>([]);

  // Form input states
  const [evalSantriId, setEvalSantriId] = useState('1');
  const [evalAdab, setEvalAdab] = useState('Baik');
  const [evalKeterangan, setEvalKeterangan] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [santriRes, evaluasiRes] = await Promise.all([
        fetch('/api/santri'),
        fetch('/api/evaluasi')
      ]);
      if (santriRes.ok) {
        const santriData = await santriRes.json();
        const parsed = (santriData.data || []).map((s: any) => ({
          id: s.id,
          nis: s.nis || '',
          nisn: s.nisn || '',
          nama_lengkap: s.full_name || '',
          kelas_id: s.kelas_id || '',
          kelas_nama: s.kelas_nama || '',
          is_active: s.is_active,
        }));
        setSantriList(parsed);
        if (parsed.length > 0 && !evalSantriId) {
          setEvalSantriId(parsed[0].id);
        }
      } else {
        setSantriList([]);
        setEvalSantriId('');
      }
      if (evaluasiRes.ok) {
        const evaluasiData = await evaluasiRes.json();
        const mapped = (evaluasiData.data || []).map((r: any) => ({
          id: r.id,
          santriId: r.santuario_id,
          santriName: r.santri_nama || '',
          kelasNama: r.kelas_nama || '',
          adab: r.predikat_adab || 'Baik',
          keterangan: r.catatan || '',
          updatedAt: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
        }));
        setRecords(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateEvaluasi = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSantriObj = santriList.find(s => s.id === evalSantriId);
    if (!selectedSantriObj) return;

    try {
      const res = await fetch('/api/evaluasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santuario_id: selectedSantriObj.id,
          musyrif_id: user?.id || '',
          predikat_adab: evalAdab,
          catatan: evalKeterangan.trim()
        })
      });
      if (!res.ok) throw new Error('Failed to save');

      await loadData();

      showNotification(`Evaluasi untuk ${selectedSantriObj.nama_lengkap} berhasil disimpan!`);
      setEvalKeterangan(''); // Clear text area
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan evaluasi');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-tosca-100/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/musyrif" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Evaluasi Sikap</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">{settings.appName} • TA {settings.tahunAjaran}</span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">UM</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="text-teal-400" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* Form Evaluasi */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-violet-500" size={20} /> Input Evaluasi Santri Baru
            </h3>
          </div>

          <form onSubmit={handleUpdateEvaluasi} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Pilih Santri</label>
                <select
                  value={evalSantriId}
                  onChange={(e) => setEvalSantriId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-tosca-500"
                >
                  {santriList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.kelas_nama})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Predikat Adab</label>
                <select
                  value={evalAdab}
                  onChange={(e) => setEvalAdab(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-tosca-500"
                >
                  <option>Sangat Baik</option>
                  <option>Baik</option>
                  <option>Cukup</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tulis Keterangan / Catatan</label>
              <textarea
                value={evalKeterangan}
                onChange={(e) => setEvalKeterangan(e.target.value)}
                placeholder="Tulis ulasan deskriptif perkembangan karakter, akhlak, adab, atau hal-hal penting lainnya..."
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-tosca-500 text-sm leading-relaxed"
              ></textarea>
            </div>

            <button type="submit" className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-98">
              Simpan Catatan Evaluasi
            </button>
          </form>
        </div>

        {/* Daftar Sikap */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50/10">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} /> Ulasan Adab Santri Aktif
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-4 px-5">Nama Santri</th>
                  <th className="py-4 px-5">Kelas</th>
                  <th className="py-4 px-5 text-center">Predikat Adab</th>
                  <th className="py-4 px-5">Catatan Sikap Terkini</th>
                  <th className="py-4 px-5 text-center">Tanggal Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {santriList.map(s => {
                  // Find this santri's record
                  const rec = records.find(r => r.santriId === s.id);
                  const hasRec = rec !== undefined;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/20 transition-all">
                      <td className="py-4 px-5 font-black text-slate-900">{s.nama_lengkap}</td>
                      <td className="py-4 px-5 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 font-extrabold text-[9px] uppercase">{s.kelas_nama}</span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm inline-block ${
                          (hasRec ? rec.adab : 'Baik') === 'Sangat Baik' ? 'bg-green-500 text-white' :
                          (hasRec ? rec.adab : 'Baik') === 'Baik' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
                        }`}>
                          {hasRec ? rec.adab : 'Baik'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-600 font-semibold max-w-xs truncate" title={hasRec ? rec.keterangan : '-'}>
                        {hasRec ? rec.keterangan : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-4 px-5 text-xs text-center font-bold text-slate-400">
                        {hasRec ? rec.updatedAt : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
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