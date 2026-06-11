'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  Star, 
  Home, 
  Video, 
  Award, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface HafalanRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasId: string;
  kelasNama: string;
  nis: string;
  surah: string;
  ayat: string;
  tajwid: number;
  makhraj: number;
  kelancaran: number;
  rata: number;
  status: 'Lanjut' | 'Ulang';
  createdAt: string;
}

const defaultHafalanRecords: HafalanRecord[] = [];

export default function NilaiSantriPage() {
  const { user } = useAuth();
  const [riwayat, setRiwayat] = useState<HafalanRecord[]>([]);

  const loadRiwayat = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/setoran?santuario_id=${user.id}`);
      const data = await res.json();
      const mapped: HafalanRecord[] = (data.data || []).map((r: any) => ({
        id: r.id,
        santriId: r.santuario_id,
        santriName: r.santri_name || '',
        kelasId: '',
        kelasNama: '',
        nis: r.nis || '',
        surah: r.surah || '',
        ayat: r.ayat_start ? (r.ayat_end ? `${r.ayat_start}-${r.ayat_end}` : String(r.ayat_start)) : '',
        tajwid: r.tajwid_score || 0,
        makhraj: r.makhraj_score || 0,
        kelancaran: r.kelancaran_score || 0,
        rata: r.rata_rata || 0,
        status: r.status === 'LANJUT' ? 'Lanjut' as const : 'Ulang' as const,
        createdAt: r.created_at || ''
      }));
      setRiwayat(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRiwayat();

    const interval = setInterval(loadRiwayat, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-tosca-50/30 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/santri" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-900 block">Laporan Nilai</span>
              <span className="text-[10px] text-tosca-500 font-medium">Riwayat setoran hafalan Anda</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">
            {user ? user.fullName.split(' ').map(n => n.charAt(0)).slice(0, 2).join('') : 'AF'}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Info */}
        <div className="bg-tosca-50 border border-tosca-100 rounded-2xl p-4 flex items-center gap-3">
          <Star className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-tosca-700 font-bold leading-relaxed">
            Berikut adalah detail rekaman nilai dan ulasan status kelulusan bimbingan setoran hafalan Anda secara real-time.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-tosca-50 bg-tosca-50/10 flex items-center justify-between">
            <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2">
              <Star className="text-amber-500" size={18} /> Detail Nilai Hafalan Harian
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-tosca-50/40 border-b border-tosca-100 text-[9px] font-black text-tosca-400 uppercase tracking-widest">
                  <th className="py-4 px-4 text-center">Tanggal</th>
                  <th className="py-4 px-4">Surah</th>
                  <th className="py-4 px-4 text-center">Rentang Ayat</th>
                  <th className="py-4 px-4 text-center">Tajwid</th>
                  <th className="py-4 px-4 text-center">Makhraj</th>
                  <th className="py-4 px-4 text-center">Kelancaran</th>
                  <th className="py-4 px-4 text-center">Rata-Rata</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tosca-50 text-xs text-tosca-800">
                {riwayat.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle size={32} className="text-tosca-300 stroke-[1.5]" />
                        <p className="text-sm">Belum ada riwayat setoran hafalan yang diunggah oleh Musyrif.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  riwayat.map(r => (
                    <tr key={r.id} className="hover:bg-tosca-50/20 transition-all">
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-500">{r.createdAt}</td>
                      <td className="py-3.5 px-4 font-black text-slate-800">Surah {r.surah}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">Ayat {r.ayat}</td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-700">{r.tajwid}</td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-700">{r.makhraj}</td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-700">{r.kelancaran}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-tosca-900 text-white rounded text-[10px] font-black tracking-tight">
                          {r.rata.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm inline-block ${
                          r.status === 'Lanjut' 
                            ? 'bg-green-500 text-white border border-green-400' 
                            : 'bg-red-500 text-white border border-red-400'
                        }`}>
                          {r.status === 'Lanjut' ? 'Lanjut' : 'Ulang'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-tosca-100 px-3 sm:px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/santri" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Beranda</span>
        </Link>
        <Link href="/dashboard/santri/nilai" className="flex flex-col items-center gap-1 flex-1 text-tosca-600">
          <Star size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/santri/virtual-class" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Video size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Kelas Virtual</span>
        </Link>
        <Link href="/dashboard/santri/sertifikat" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Award size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Sertifikat</span>
        </Link>
        <Link href="/dashboard/santri/profil" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <User size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}