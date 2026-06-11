'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';
import {
  ArrowLeft,
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Home,
  Star,
  Video,
  Award,
  User,
  CalendarDays,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface PresensiRecord {
  id: string;
  meetingId: string;
  meetingName: string;
  santriId: string;
  santriName: string;
  nis: string;
  kelasNama: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  createdAt: string;
}

const statusConfig = {
  Hadir: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  Izin:  { color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: Clock,         dot: 'bg-blue-500' },
  Sakit: { color: 'bg-amber-50 text-amber-700 border-amber-200',      icon: AlertCircle,   dot: 'bg-amber-500' },
  Alpa:  { color: 'bg-rose-50 text-rose-700 border-rose-200',         icon: XCircle,       dot: 'bg-rose-500' },
};

export default function PresensiSantriPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [myRecords, setMyRecords] = useState<PresensiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/absensi?santuario_id=${user.id}`);
      const data = await res.json();
      const mapped: PresensiRecord[] = (data.data || []).map((r: any) => ({
        id: r.id,
        meetingId: r.tanggal || '',
        meetingName: new Date(r.tanggal || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        santriId: r.santuario_id,
        santriName: r.santri_name || '',
        nis: r.nis || '',
        kelasNama: r.kelas_nama || '',
        status: r.status === 'HADIR' ? 'Hadir' as const : r.status === 'IZIN' ? 'Izin' as const : r.status === 'SAKIT' ? 'Sakit' as const : 'Alpa' as const,
        createdAt: r.created_at || ''
      }));
      mapped.sort((a, b) => b.meetingId.localeCompare(a.meetingId));
      setMyRecords(mapped);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user !== undefined) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Statistik ──
  const totalSesi        = myRecords.length;
  const totalHadir       = myRecords.filter(r => r.status === 'Hadir').length;
  const totalIzin        = myRecords.filter(r => r.status === 'Izin').length;
  const totalSakit       = myRecords.filter(r => r.status === 'Sakit').length;
  const totalAlpa        = myRecords.filter(r => r.status === 'Alpa').length;
  const persentaseHadir  = totalSesi > 0 ? Math.round((totalHadir / totalSesi) * 100) : 0;

  const attendanceColor = persentaseHadir >= 85
    ? 'text-emerald-600'
    : persentaseHadir >= 70
    ? 'text-amber-600'
    : 'text-rose-600';

  const progressColor = persentaseHadir >= 85
    ? 'bg-emerald-500'
    : persentaseHadir >= 70
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/santri"
              className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Presensi Kehadiran</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">
                  {settings.appName} • TA {settings.tahunAjaran}
                </span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">
            {user ? user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'S'}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Ringkasan Hero Card */}
        <div className="relative bg-gradient-to-tr from-tosca-900 to-teal-700 rounded-3xl p-6 text-white shadow-xl overflow-hidden">
          <div className="absolute right-4 top-4 opacity-10">
            <CheckSquare size={100} />
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 mb-1">Ringkasan Kehadiran</p>
          <h1 className="text-2xl font-black">{user ? user.fullName : 'Santri'}</h1>
          <p className="text-xs text-teal-200 mt-0.5 font-semibold">{user ? user.nis : ''} • {myRecords[0]?.kelasNama || 'Kelas Anda'}</p>

          {/* Progress Kehadiran */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-200 font-bold">Persentase Kehadiran</span>
              <span className="text-sm font-black text-white">{persentaseHadir}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                style={{ width: `${persentaseHadir}%` }}
              ></div>
            </div>
          </div>

          {/* Badge stats row */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: 'Hadir', val: totalHadir, bg: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200' },
              { label: 'Izin',  val: totalIzin,  bg: 'bg-blue-500/20 border-blue-400/30 text-blue-200' },
              { label: 'Sakit', val: totalSakit, bg: 'bg-amber-500/20 border-amber-400/30 text-amber-200' },
              { label: 'Alpa',  val: totalAlpa,  bg: 'bg-rose-500/20 border-rose-400/30 text-rose-200' },
            ].map(item => (
              <div key={item.label} className={`flex flex-col items-center justify-center p-2 rounded-xl border ${item.bg}`}>
                <span className="text-lg font-black">{item.val}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-tosca-50 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center shrink-0">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-[9px] text-tosca-400 font-bold uppercase tracking-wider">Total Sesi</p>
              <p className="text-xl font-black text-tosca-900">{totalSesi} Sesi</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-tosca-50 shadow-sm flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${persentaseHadir >= 85 ? 'bg-emerald-100 text-emerald-600' : persentaseHadir >= 70 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[9px] text-tosca-400 font-bold uppercase tracking-wider">Persentase</p>
              <p className={`text-xl font-black ${attendanceColor}`}>{persentaseHadir}%</p>
            </div>
          </div>
        </div>

        {/* Riwayat List */}
        <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <CalendarDays className="text-tosca-600" size={18} />
              Riwayat Kehadiran Saya
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 font-bold text-sm">Memuat data...</div>
          ) : myRecords.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
              <CalendarDays className="text-tosca-200 stroke-[1.5]" size={48} />
              <p className="text-sm font-black text-slate-400">Belum ada data presensi.</p>
              <p className="text-xs text-slate-300 font-semibold">Data akan muncul setelah Musyrif mencatat kehadiran.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {myRecords.map((record) => {
                const cfg = statusConfig[record.status];
                const StatusIcon = cfg.icon;
                return (
                  <li
                    key={record.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/40 transition-all"
                  >
                    {/* Left: dot + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`}></span>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">{record.meetingName}</p>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                          <CalendarDays size={10} />
                          {record.createdAt}
                        </p>
                      </div>
                    </div>

                    {/* Right: status badge */}
                    <span className={`shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wide ${cfg.color}`}>
                      <StatusIcon size={11} />
                      {record.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Info footer */}
        <div className="flex items-start gap-2 bg-tosca-50 border border-tosca-100 rounded-2xl p-4">
          <GraduationCap className="text-tosca-500 shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] text-tosca-700 font-semibold leading-relaxed">
            Data presensi ini dicatat oleh Musyrif Anda. Jika ada ketidaksesuaian, silakan hubungi Musyrif kelas Anda.
          </p>
        </div>

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-tosca-100 px-3 sm:px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/santri" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Beranda</span>
        </Link>
        <Link href="/dashboard/santri/nilai" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Star size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/santri/presensi" className="flex flex-col items-center gap-1 flex-1 text-tosca-600">
          <CheckSquare size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Presensi</span>
        </Link>
        <Link href="/dashboard/santri/virtual-class" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Video size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Kelas Virtual</span>
        </Link>
        <Link href="/dashboard/santri/profil" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <User size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
