'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Megaphone, ArrowLeft, Home, Star, Video, User,
  Clock, CheckCircle2, RefreshCw, Award, FileText
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';

interface InformasiRecord {
  id: string;
  judul: string;
  isi: string;
  target_role: string;
  created_by_name: string;
  created_at: string;
}

export default function InformasiSantriPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [infoList, setInfoList] = useState<InformasiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/informasi?target_role=SANTRI')
      .then(res => res.json())
      .then(data => {
        if (data.data) setInfoList(data.data);
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-tosca-50/30 flex flex-col pb-24 lg:pb-8">
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
              <span className="text-base font-black text-tosca-900 block">Informasi & Pengumuman</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">
                  {settings.appName} • {user?.fullName || 'Santri'}
                </span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">
            {user ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'S'}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Loading */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="text-tosca-300 animate-spin" size={36} strokeWidth={1.5} />
            <p className="text-sm text-slate-400 font-bold">Memuat informasi...</p>
          </div>
        ) : infoList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-tosca-50 flex items-center justify-center">
              <Megaphone className="text-tosca-300" size={36} strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-black text-slate-700">Belum Ada Informasi</p>
              <p className="text-xs text-slate-400 font-semibold max-w-xs">
                Belum ada informasi atau pengumuman dari Admin.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              {infoList.length} Informasi
            </p>

            {infoList.map(info => (
              <div
                key={info.id}
                className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden hover:shadow-md hover:border-tosca-200 transition-all"
              >
                <div className="bg-gradient-to-r from-tosca-900 to-teal-800 p-5 relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                    <Megaphone size={80} />
                  </div>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Megaphone className="text-amber-300" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-black text-white">{info.judul}</h2>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-teal-200 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(info.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{info.created_by_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line">{info.isi}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
        <Link href="/dashboard/santri/informasi" className="flex flex-col items-center gap-1 flex-1 text-tosca-600">
          <Megaphone size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Informasi</span>
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
