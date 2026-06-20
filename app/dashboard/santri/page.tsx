'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  GraduationCap, Sparkles, Home, Star, ClipboardList, Target, Video, Award, User, LogOut, Calendar, CheckSquare, BookOpen, Megaphone,
  BookOpenCheck, BookMarked, RefreshCw
} from 'lucide-react';

const defaultProfile = {
  nama: '',
  nis: '',
  kelas: '',
  foto: '',
};

const LEVEL_MODULE: Record<string, { label: string; icon: any; color: string }> = {
  BTQ_PEMULA: { label: 'BTQ1', icon: BookOpen, color: 'from-tosca-400 to-tosca-700' },
  BTQ_LANJUTAN: { label: 'BTQ2', icon: BookOpenCheck, color: 'from-tosca-400 to-tosca-700' },
  TAHSIN: { label: 'Tahsin', icon: BookOpen, color: 'from-tosca-400 to-tosca-700' },
  TAHFIDZ: { label: 'Tahfidz', icon: BookMarked, color: 'from-tosca-400 to-tosca-700' },
  MUROJAAH: { label: 'Murojaah', icon: RefreshCw, color: 'from-tosca-400 to-tosca-700' },
};

export default function SantriDashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const level = user?.levelProgram || 'TAHSIN';
  const progMod = LEVEL_MODULE[level] || LEVEL_MODULE['TAHSIN'];
  const modules = [
    { id: 'overview', label: 'Beranda', icon: Home, color: 'from-tosca-500 to-tosca-600', href: '/dashboard/santri' },
    { id: 'setoran', label: progMod.label, icon: progMod.icon, color: progMod.color, href: '/dashboard/santri/setoran' },
    { id: 'jadwal', label: 'Jadwal', icon: Calendar, color: 'from-tosca-500 to-tosca-800', href: '/dashboard/santri/jadwal' },
    { id: 'nilai', label: 'Nilai', icon: Star, color: 'from-tosca-300 to-tosca-600', href: '/dashboard/santri/nilai' },
    { id: 'evaluasi', label: 'Evaluasi', icon: ClipboardList, color: 'from-tosca-600 to-tosca-900', href: '/dashboard/santri/evaluasi' },
    { id: 'target', label: 'Target', icon: Target, color: 'from-tosca-500 to-tosca-700', href: '/dashboard/santri/target' },
    { id: 'presensi', label: 'Presensi', icon: CheckSquare, color: 'from-tosca-400 to-tosca-600', href: '/dashboard/santri/presensi' },
    { id: 'virtual-class', label: 'Kelas Virtual', icon: Video, color: 'from-tosca-400 to-tosca-700', href: '/dashboard/santri/virtual-class' },
    { id: 'sertifikat', label: 'Sertifikat', icon: Award, color: 'from-tosca-300 to-tosca-600', href: '/dashboard/santri/sertifikat' },
    { id: 'informasi', label: 'Informasi', icon: Megaphone, color: 'from-tosca-500 to-tosca-800', href: '/dashboard/santri/informasi' },
  ];

  const [juzTarget, setJuzTarget] = useState<string>('');
  const [rataNilai, setRataNilai] = useState<number>(0);
  const [adabPredikat, setAdabPredikat] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load Target
        const targetRes = await fetch(`/api/target?santuario_id=${user.id}`);
        const targetData = await targetRes.json();
        const allTargets = (targetData.data || []).map((r: any) => ({
          santriId: r.santuario_id,
          santriName: r.santri_name || '',
          juzTarget: r.juz || '',
        }));
        const match = allTargets.find((r: any) => 
          r.santriId === user.id || 
          r.santriName.toLowerCase() === user.fullName.toLowerCase()
        );
        if (match) {
          setJuzTarget(`Juz ${match.juzTarget}`);
        }

        // Load Nilai Rata-rata
        const TahsinRes = await fetch(`/api/setoran?santuario_id=${user.id}`);
        const TahsinData = await TahsinRes.json();
        const allTahsin = (TahsinData.data || []).map((r: any) => ({
          santriId: r.santuario_id,
          nis: r.nis || '',
          santriName: r.santri_name || '',
          rata: Number(r.rata_rata) || 0,
        }));
        const myTahsin = allTahsin.filter((r: any) => 
          r.santriId === user.id || 
          r.nis === user.nis || 
          r.santriName.toLowerCase() === user.fullName.toLowerCase()
        );
        if (myTahsin.length > 0) {
          const sum = myTahsin.reduce((acc: number, r: any) => acc + r.rata, 0);
          setRataNilai(parseFloat((sum / myTahsin.length).toFixed(1)));
        }

        // Load Evaluasi Adab
        const evalRes = await fetch(`/api/evaluasi?santuario_id=${user.id}`);
        const evalData = await evalRes.json();
        const allEval = (evalData.data || []).map((r: any) => ({
          santriId: r.santuario_id,
          santriName: r.santri_name || '',
          adab: r.predikat_adab || '',
        }));
        const evalMatch = allEval.find((r: any) => 
          r.santriId === user.id || 
          r.santriName.toLowerCase() === user.fullName.toLowerCase()
        );
        if (evalMatch) {
          setAdabPredikat(evalMatch.adab);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadData();
  }, [user]);

  // Derived user display attributes
  const displayNama = user ? user.fullName : '';
  const displayNis = user ? user.nis : '';
  const avatarInitials = user 
    ? user.fullName.split(' ').map(n => n.charAt(0)).slice(0, 2).join('') 
    : '';

  return (
    <>
      <div className="relative bg-gradient-to-tr from-tosca-900 to-tosca-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden min-h-[140px] flex flex-col justify-between">
        <div className="absolute right-4 top-4 opacity-10"><Award size={120} /></div>
        <div className="space-y-1 z-10">
          <h1 className="text-xl sm:text-2xl font-black">Assalamualaikum, {displayNama}</h1>
          <p className="text-xs text-tosca-100 font-medium">Pantau perkembangan Tahsin Anda.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 bg-white/10 px-3 py-1.5 rounded-xl w-fit border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-wider text-tosca-200">NIS: {displayNis}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-tosca-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Menu Siswa
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {modules.map(m => {
            const Icon = m.icon;
            return (
              <Link key={m.id} href={m.href || '/dashboard/santri'}
                  className="flex flex-col items-center justify-between p-3 h-[110px] rounded-2xl transition-all border bg-white border-tosca-100 hover:border-tosca-200 shadow-sm hover:scale-103 cursor-pointer">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${m.color} text-white shadow-sm`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-center w-full px-1 text-tosca-600">{m.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-tosca-50 shadow-sm">
            <span className="text-[10px] text-tosca-400 font-bold uppercase">Rata-rata Nilai</span>
            <p className="text-2xl font-black text-tosca-900 mt-1">{rataNilai}/100</p>
            <span className="text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded mt-2 block w-fit">Mumtaz</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-tosca-50 shadow-sm">
            <span className="text-[10px] text-tosca-400 font-bold uppercase">Target Tahsin</span>
            <p className="text-2xl font-black text-tosca-900 mt-1">{juzTarget}</p>
            <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded mt-2 block w-fit">Aktif</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-tosca-50 shadow-sm">
            <span className="text-[10px] text-tosca-400 font-bold uppercase">Predikat Adab</span>
            <p className="text-2xl font-black text-tosca-900 mt-1">{adabPredikat}</p>
            <span className="text-[9px] text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded mt-2 block w-fit">Karakter</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-tosca-50 shadow-sm">
            <span className="text-[10px] text-tosca-400 font-bold uppercase">Sertifikat</span>
            <p className="text-2xl font-black text-tosca-900 mt-1">—</p>
            <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded mt-2 block w-fit">Siap Unduh</span>
          </div>
        </div>

        {/* Juz Selesai */}
        <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-5">
          <h3 className="text-xs font-black text-tosca-500 uppercase tracking-widest mb-4">Juz yang Telah Diselesaikan</h3>
          <div className="flex flex-wrap gap-2">
            <p className="text-sm text-slate-400 font-semibold">Belum ada data juz yang diselesaikan.</p>
          </div>
        </div>
    </>
  );
}