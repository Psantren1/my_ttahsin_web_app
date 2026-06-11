'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, BookOpen, Clock, CheckCircle2, Users, Home, BookOpenCheck, Calendar } from 'lucide-react';

const initialSantri: any[] = [];
const initialJadwal: any[] = [];

export default function MusyrifDashboardPage() {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

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
              <span className="text-base font-black text-tosca-950 block tracking-tight">Dashboard</span>
              <span className="text-[10px] text-tosca-500 font-medium">Overview Halaqah</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">UM</div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="text-teal-400" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={12} className="text-tosca-600" /> Santri Aktif
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">{initialSantri.length} Santri</p>
            <span className="text-[9px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded w-fit mt-3">Halaqah A</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-600" /> Hadir Hari Ini
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {initialSantri.filter(s => s.kehadiran === 'Hadir').length} / {initialSantri.length}
            </p>
            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded w-fit mt-3">Presensi Selesai</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <BookOpenCheck size={12} className="text-orange-600" /> Juz Selesai
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">12 Juz</p>
            <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded w-fit mt-3">Target Terpenuhi</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={12} className="text-indigo-600" /> Sesi Aktif
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">2 Jadwal</p>
            <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded w-fit mt-3">Hari Ini</span>
          </div>
        </div>

        {/* Jadwal Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Calendar className="text-tosca-600" size={16} /> Sesi Jadwal Halaqah
          </h3>
          <div className="space-y-3">
            {initialJadwal.map(j => (
              <div key={j.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-800">{j.sesi}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{j.lokasi}</p>
                </div>
                <span className="text-xs font-extrabold text-tosca-600 bg-white px-3 py-1.5 rounded-xl border border-slate-150">{j.jam}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Setoran */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Setoran Terakhir</h3>
            <Link href="/dashboard/musyrif/setoran" className="text-[10px] font-bold text-tosca-600 hover:text-tosca-750">Input Setoran →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {initialSantri.slice(0, 3).map((s, i) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-slate-900">{s.nama}</p>
                  <p className="text-xs text-slate-400 font-medium">Juz {s.juzSelesai[0]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.status === 'Lanjut' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{s.status}</span>
                  <span className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-700">{Math.round((s.tajwid + s.makhraj + s.kelancaran) / 3)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 sm:px-6 py-2.5 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/musyrif" className="flex flex-col items-center justify-center gap-1 flex-1 text-tosca-600">
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Utama</span>
        </Link>
        <Link href="/dashboard/musyrif/setoran" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <BookOpen size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Setoran</span>
        </Link>
        <Link href="/dashboard/musyrif/nilai" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <span className="text-base">★</span>
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/musyrif/presensi" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <span className="text-base">☑</span>
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