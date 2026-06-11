'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Star, Home, BookOpen, CheckSquare, Calendar, Target, Award } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function NilaiPage() {
  const { user } = useAuth();
  const [santriList, setSantriList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/santri')
      .then(res => res.json())
      .then(santriData => {
        if (!santriData.data) return;
        return fetch(`/api/setoran?musyrif_id=${user.id}`)
          .then(res => res.json())
          .then(setoranData => {
            const hafalanRecords = setoranData.data || [];
            const mapped = santriData.data.map((s: any) => {
              const myRecs = hafalanRecords.filter((r: any) => r.santuario_id === s.id);
              const latest = myRecs[0] || { tajwid_score: 0, makhraj_score: 0, kelancaran_score: 0 };
              return {
                id: s.id,
                nama: s.full_name || '',
                tajwid: latest.tajwid_score ?? 0,
                makhraj: latest.makhraj_score ?? 0,
                kelancaran: latest.kelancaran_score ?? 0
              };
            });
            setSantriList(mapped);
          });
      })
      .catch(e => console.error('Gagal fetch nilai musyrif:', e));
  }, [user]);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-tosca-100/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/musyrif" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Input Nilai</span>
              <span className="text-[10px] text-tosca-500 font-medium">Detail aspek nilai</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">UM</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <div className="bg-tosca-50 rounded-2xl border border-tosca-100 p-4 flex items-center gap-3">
          <Star className="text-amber-500" size={20} />
          <p className="text-sm text-tosca-700 font-medium">Klik nilai untuk mengedit. Rata-rata dihitung otomatis.</p>
        </div>

        {/* Nilai Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Star className="text-amber-500" size={18} /> Daftar Nilai Santri
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                  <th className="py-4 px-5">Nama Santri</th>
                  <th className="py-4 px-5 text-center">Tajwid</th>
                  <th className="py-4 px-5 text-center">Makhraj</th>
                  <th className="py-4 px-5 text-center">Kelancaran</th>
                  <th className="py-4 px-5 text-center">Skor Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {santriList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                      Belum ada data santri.
                    </td>
                  </tr>
                ) : santriList.map(s => {
                  const avg = Math.round((s.tajwid + s.makhraj + s.kelancaran) / 3);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-all cursor-pointer">
                      <td className="py-4 px-5 font-black text-slate-900">{s.nama}</td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700">{s.tajwid}</td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700">{s.makhraj}</td>
                      <td className="py-4 px-5 text-center font-bold text-slate-700">{s.kelancaran}</td>
                      <td className="py-4 px-5 text-center">
                        <span className="px-3 py-1.5 bg-tosca-600 text-white rounded-lg text-sm font-black">{avg}</span>
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
        <Link href="/dashboard/musyrif/nilai" className="flex flex-col items-center justify-center gap-1 flex-1 text-tosca-600">
          <Star size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/musyrif/presensi" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <CheckSquare size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Presensi</span>
        </Link>
        <Link href="/dashboard/musyrif/profil" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <span className="text-base">👤</span>
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}