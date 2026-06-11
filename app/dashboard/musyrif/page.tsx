'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen, Star, BookOpenCheck, ClipboardList, CheckSquare,
  Calendar, Target, Award, Sparkles, User, Home, LogOut, ChevronRight, Clock, Smartphone,
  Video, Megaphone
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';

export default function MusyrifDashboard() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { settings } = useSettings();
  const [matchedMusyrif, setMatchedMusyrif] = React.useState<any>(null);

  React.useEffect(() => {
    if (!user) return;
    fetch(`/api/musyrif/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setMatchedMusyrif(data.data);
      })
      .catch(() => {}); // silent fail, tampilan tetap berjalan
  }, [user]);

  const modules = [
    { id: 'jadwal', label: 'Jadwal', icon: Calendar, color: 'from-indigo-500 to-blue-700', href: '/dashboard/musyrif/jadwal' },
    { id: 'virtual-class', label: 'Kelas Virtual', icon: Video, color: 'from-teal-500 to-cyan-600', href: '/dashboard/musyrif/virtual-class' },
    { id: 'setoran', label: 'Setoran', icon: BookOpen, color: 'from-sky-500 to-blue-600', href: '/dashboard/musyrif/setoran' },
    { id: 'nilai', label: 'Input Nilai', icon: Star, color: 'from-amber-400 to-orange-500', href: '/dashboard/musyrif/nilai' },
    { id: 'status', label: 'Status', icon: BookOpenCheck, color: 'from-rose-500 to-pink-600', href: '/dashboard/musyrif/status' },
    { id: 'evaluasi', label: 'Evaluasi', icon: ClipboardList, color: 'from-violet-500 to-purple-600', href: '/dashboard/musyrif/evaluasi' },
    { id: 'kehadiran', label: 'Presensi', icon: CheckSquare, color: 'from-green-500 to-emerald-600', href: '/dashboard/musyrif/presensi' },
    { id: 'target', label: 'Target', icon: Target, color: 'from-fuchsia-500 to-purple-700', href: '/dashboard/musyrif/target' },
    { id: 'sertifikat', label: 'Sertifikat', icon: Award, color: 'from-yellow-500 to-amber-600', href: '/dashboard/musyrif/sertifikat' },
    { id: 'informasi', label: 'Informasi', icon: Megaphone, color: 'from-pink-500 to-rose-600', href: '/dashboard/musyrif/informasi' },
    { id: 'profil', label: 'Profil', icon: User, color: 'from-slate-500 to-gray-600', href: '/dashboard/musyrif/profil' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-tosca-100/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl overflow-hidden flex items-center justify-center ${settings.logoUrl ? 'h-10 w-10 bg-white border border-tosca-100' : 'bg-gradient-to-tr from-tosca-600 to-teal-400 h-10 w-10 shadow-md shadow-tosca-200'}`}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <GraduationCap className="text-white h-5 w-5" />
              )}
            </div>
            <div>
              <span className="text-base font-black text-tosca-955 block tracking-tight">{settings.appName}</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">Musyrif Panel • TA {settings.tahunAjaran}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-tosca-900">{user?.fullName || 'Musyrif'}</span>
              <span className="text-[9px] font-bold text-tosca-400 uppercase tracking-widest">{matchedMusyrif?.kelas_nama || 'Halaqah'}</span>
            </div>
            <Link href="/dashboard/musyrif/profil">
              <div className="h-9 w-9 rounded-xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 font-bold shadow-sm hover:bg-tosca-100 transition-colors cursor-pointer">
                {user ? user.fullName.split(' ').map((n: string) => n.charAt(0)).slice(0, 2).join('') : 'UM'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="relative bg-gradient-to-tr from-tosca-900 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none flex items-center justify-end pr-6">
            <Smartphone size={160} />
          </div>
          <div className="space-y-1 z-10">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Ahlan wa Sahlan, {user?.fullName || 'Musyrif'}</h1>
            <p className="text-xs text-teal-100 font-medium leading-relaxed max-w-xl">Akses semua fitur halaqah Anda melalui modul di bawah ini.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 z-10 bg-white/10 px-3 py-1.5 rounded-xl w-fit border border-white/5">
            <Clock size={12} className="text-teal-300 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-200">Sesi Aktif: Tahfizh Pagi</span>
          </div>
        </div>

        {/* Module Launcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Modul Halaqah
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
            {modules.map((m) => {
              const IconComp = m.icon;
              return (
                <Link
                  key={m.id}
                  href={m.href || '/dashboard/musyrif'}
                  className="flex flex-col items-center justify-between p-3 h-[110px] rounded-2xl transition-all border bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:scale-103"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${m.color} text-white shadow-sm`}>
                    <IconComp size={20} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight w-full px-1 text-slate-600">
                    {m.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Santri Aktif</span>
            <p className="text-2xl font-black text-slate-900 mt-2">5 Santri</p>
            <span className="text-[9px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded w-fit mt-3 block">Halaqah A</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hadir Hari Ini</span>
            <p className="text-2xl font-black text-slate-900 mt-2">4 / 5</p>
            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded w-fit mt-3 block">Presensi Selesai</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Juz Diselesaikan</span>
            <p className="text-2xl font-black text-slate-900 mt-2">12 Juz</p>
            <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded w-fit mt-3 block">Target Terpenuhi</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sertifikat Terbit</span>
            <p className="text-2xl font-black text-slate-900 mt-2">8 Buah</p>
            <span className="text-[9px] text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded w-fit mt-3 block">Siap Diunduh</span>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 sm:px-6 py-2.5 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/musyrif/jadwal" className="flex flex-col items-center justify-center gap-1 flex-1 text-tosca-600">
          <Calendar size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Jadwal</span>
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