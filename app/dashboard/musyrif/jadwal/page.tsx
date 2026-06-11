'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Calendar, CheckCircle2, Home, BookOpen, Star, CheckSquare, Target, Award, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface JadwalData {
  id: number;
  sesi: string;
  jam: string;
  lokasi: string;
  musyrif: string;
  hari: string;
}

export default function JadwalMusyrifPage() {
  const { user } = useAuth();
  const [jadwalList, setJadwalList] = useState<JadwalData[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const formatJam = (jamMulai: string) => jamMulai ? jamMulai.slice(0, 5) : '';

  const fetchJadwal = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/jadwal?musyrif_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.data || []).map((j: any) => ({
          id: j.id,
          sesi: j.sesi || '',
          jam: formatJam(j.jam_mulai),
          lokasi: j.lokasi || '',
          musyrif: j.musyrif_name || '',
          hari: j.hari || ''
        }));
        setJadwalList(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, [user]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Listen for updates from other pages
  useEffect(() => {
    const interval = setInterval(fetchJadwal, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const getHariLabel = (hari: string) => {
    const hariLabels: Record<string, string> = {
      'SENIN': 'Senin', 'SELASA': 'Selasa', 'RABU': 'Rabu', 'KAMIS': 'Kamis',
      'JUMAT': 'Jumat', 'SABTU': 'Sabtu', 'MINGGU': 'Minggu'
    };
    return hariLabels[hari] || hari;
  };

  // Group jadwal by hari
  const jadwalByHari = jadwalList.reduce((acc, jadwal) => {
    const hari = jadwal.hari || 'SENIN';
    if (!acc[hari]) acc[hari] = [];
    acc[hari].push(jadwal);
    return acc;
  }, {} as Record<string, JadwalData[]>);

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
              <span className="text-base font-black text-tosca-950 block tracking-tight">Jadwal Halaqah</span>
              <span className="text-[10px] text-tosca-500 font-medium">Kelola jadwal sesi</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">UM</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl">
            <CheckCircle2 className="text-teal-400" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* Info */}
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 flex items-center gap-3">
          <Calendar className="text-indigo-500" size={20} />
          <p className="text-sm text-indigo-700 font-medium">Jadwal sinkron dengan manajemen admin. Diperbarui otomatis.</p>
        </div>

        {/* Jadwal List by Hari */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Calendar className="text-indigo-500" size={18} /> Daftar Jadwal Halaqah
            </h3>
          </div>

          {Object.keys(jadwalByHari).length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">Belum ada jadwal</p>
            </div>
          ) : (
            <div className="p-5 space-y-6">
              {Object.entries(jadwalByHari).map(([hari, jadwals]) => (
                <div key={hari} className="space-y-3">
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    {getHariLabel(hari)}
                  </h4>
                  <div className="space-y-2">
                    {jadwals.map((j) => (
                      <div key={j.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                        <div>
                          <p className="text-sm font-black text-slate-800">{j.sesi}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{j.lokasi}</p>
                        </div>
                        <span className="text-xs font-extrabold text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-100">{j.jam}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 sm:px-6 py-2.5 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/musyrif" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Beranda</span>
        </Link>
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
