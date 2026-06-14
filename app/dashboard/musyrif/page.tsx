'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen, Star, BookOpenCheck, ClipboardList, CheckSquare,
  Calendar, Target, Award, Sparkles, User, Home, LogOut, ChevronRight, Clock, Smartphone,
  Video, Megaphone, BookMarked, RefreshCw
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

  const LEVEL_MODULE: Record<string, { label: string; icon: any; color: string }> = {
    BTQ_PEMULA: { label: 'BTQ1', icon: BookOpen, color: 'from-tosca-400 to-tosca-600' },
    BTQ_LANJUTAN: { label: 'BTQ2', icon: BookOpenCheck, color: 'from-tosca-400 to-tosca-600' },
    TAHSIN: { label: 'Tahsin', icon: BookOpen, color: 'from-tosca-400 to-tosca-600' },
    TAHFIDZ: { label: 'Tahfidz', icon: BookMarked, color: 'from-tosca-400 to-tosca-600' },
    MUROJAAH: { label: 'Murojaah', icon: RefreshCw, color: 'from-tosca-400 to-tosca-600' },
  };

  const level = user?.levelProgram || 'TAHSIN';
  const progMod = LEVEL_MODULE[level] || LEVEL_MODULE['TAHSIN'];
  const modules = [
    { id: 'jadwal', label: 'Jadwal', icon: Calendar, color: 'from-tosca-500 to-tosca-800', href: '/dashboard/musyrif/jadwal' },
    { id: 'virtual-class', label: 'Kelas Virtual', icon: Video, color: 'from-tosca-400 to-tosca-700', href: '/dashboard/musyrif/virtual-class' },
    { id: 'setoran', label: progMod.label, icon: progMod.icon, color: progMod.color, href: '/dashboard/musyrif/setoran' },
    { id: 'nilai', label: 'Input Nilai', icon: Star, color: 'from-tosca-300 to-tosca-500', href: '/dashboard/musyrif/nilai' },
    { id: 'status', label: 'Status', icon: BookOpenCheck, color: 'from-tosca-600 to-tosca-900', href: '/dashboard/musyrif/status' },
    { id: 'evaluasi', label: 'Evaluasi', icon: ClipboardList, color: 'from-tosca-600 to-tosca-900', href: '/dashboard/musyrif/evaluasi' },
    { id: 'kehadiran', label: 'Presensi', icon: CheckSquare, color: 'from-tosca-500 to-tosca-700', href: '/dashboard/musyrif/presensi' },
    { id: 'target', label: 'Target', icon: Target, color: 'from-tosca-500 to-tosca-700', href: '/dashboard/musyrif/target' },
    { id: 'sertifikat', label: 'Sertifikat', icon: Award, color: 'from-tosca-300 to-tosca-600', href: '/dashboard/musyrif/sertifikat' },
    { id: 'informasi', label: 'Informasi', icon: Megaphone, color: 'from-tosca-500 to-tosca-800', href: '/dashboard/musyrif/informasi' },
    { id: 'profil', label: 'Profil', icon: User, color: 'from-tosca-700 to-tosca-900', href: '/dashboard/musyrif/profil' },
  ];

  return (
    <>
        {/* Hero Card */}
        <div className="relative bg-gradient-to-tr from-tosca-900 to-tosca-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none flex items-center justify-end pr-6">
            <Smartphone size={160} />
          </div>
          <div className="space-y-1 z-10">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Ahlan wa Sahlan, {user?.fullName || 'Guru'}</h1>
            <p className="text-xs text-tosca-100 font-medium leading-relaxed max-w-xl">Akses semua fitur halaqah Anda melalui modul di bawah ini.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 z-10 bg-white/10 px-3 py-1.5 rounded-xl w-fit border border-white/5">
            <Clock size={12} className="text-tosca-300 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-wider text-tosca-200">Sesi Aktif: Tahfizh Pagi</span>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa Aktif</span>
            <p className="text-2xl font-black text-slate-900 mt-2">5 Siswa</p>
            <span className="text-[9px] text-tosca-600 font-bold bg-tosca-50 px-2 py-0.5 rounded w-fit mt-3 block">Halaqah A</span>
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
    </>
  );
}