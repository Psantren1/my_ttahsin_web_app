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
    <>
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="text-tosca-400" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={12} className="text-tosca-600" /> Siswa Aktif
            </span>
            <p className="text-2xl font-black text-slate-900 mt-2">{initialSantri.length} Siswa</p>
            <span className="text-[9px] text-tosca-600 font-bold bg-tosca-50 px-2 py-0.5 rounded w-fit mt-3">Halaqah A</span>
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
    </>
  );
}