'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, BookOpenCheck, Home, BookOpen, Star, CheckSquare, Calendar, Target, Award } from 'lucide-react';

export default function StatusPage() {
  const [santriList, setSantriList] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch santri list
    fetch('/api/santri')
      .then(res => res.json())
      .then(santriData => {
        if (!santriData.data) return;
        
        // Fetch setoran (hafalan records) to get status
        return fetch('/api/setoran')
          .then(res => res.json())
          .then(setoranData => {
            const hafalanRecords = setoranData.data || [];
            const map: any = {};
            
            hafalanRecords.forEach((r: any) => {
              const santriId = r.santuario_id;
              if (santriId && !map[santriId]) {
                const santri = santriData.data.find((s: any) => s.id === santriId);
                map[santriId] = {
                  id: santriId,
                  nama: santri?.full_name || r.santri_name || 'Santri',
                  status: r.status === 'LANJUT' ? 'Lanjut' : 'Ulangi'
                };
              }
            });
            setSantriList(Object.values(map));
          });
      })
      .catch(e => console.error('Gagal fetch status hafalan:', e));
  }, []);

  const lanjutList = santriList.filter(s => s.status === 'Lanjut');
  const ulangiList = santriList.filter(s => s.status === 'Ulangi');

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
              <span className="text-base font-black text-tosca-950 block tracking-tight">Status Hafalan</span>
              <span className="text-[10px] text-tosca-500 font-medium">Lanjut & Ulangi</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">UM</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Lanjut */}
        <div className="bg-green-50 rounded-3xl border border-green-100 p-5 space-y-4">
          <h4 className="text-sm font-black text-green-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpenCheck className="text-green-600" size={18} /> Status Lanjut (Lulus)
          </h4>
          <div className="space-y-3">
            {lanjutList.length === 0 ? (
              <p className="text-xs text-green-600 font-bold p-2 text-center bg-white border border-green-100 rounded-2xl">Belum ada santri lulus uji.</p>
            ) : lanjutList.map(s => (
              <div key={s.id} className="p-4 bg-white border border-green-100 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-black text-sm">
                    {s.nama.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className="text-sm font-black text-slate-800">{s.nama}</span>
                </div>
                <span className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold">Lulus Uji</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Ulangi */}
        <div className="bg-red-50 rounded-3xl border border-red-100 p-5 space-y-4">
          <h4 className="text-sm font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpenCheck className="text-red-600" size={18} /> Status Ulangi (Murojaah)
          </h4>
          <div className="space-y-3">
            {ulangiList.length === 0 ? (
              <p className="text-xs text-red-650 font-bold p-2 text-center bg-white border border-red-100 rounded-2xl">Belum ada santri perlu murojaah.</p>
            ) : ulangiList.map(s => (
              <div key={s.id} className="p-4 bg-white border border-red-100 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
                    {s.nama.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className="text-sm font-black text-slate-800">{s.nama}</span>
                </div>
                <span className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Perlu Murojaah</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 sm:px-6 py-2.5 flex items-center justify-around shadow-2xl">
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
          <span className="text-base">👤</span>
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}