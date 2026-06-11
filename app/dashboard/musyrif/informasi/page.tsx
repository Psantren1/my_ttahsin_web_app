'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Megaphone, ArrowLeft, Home, BookOpen, Star, Award, User,
  Clock, CheckCircle2, RefreshCw, FileText
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface InformasiRecord {
  id: string;
  judul: string;
  isi: string;
  target_role: string;
  created_by_name: string;
  created_at: string;
}

export default function InformasiMusyrifPage() {
  const { user } = useAuth();
  const [infoList, setInfoList] = useState<InformasiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/informasi?target_role=MUSYRIF')
      .then(res => res.json())
      .then(data => {
        if (data.data) setInfoList(data.data);
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/musyrif"
              className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Informasi & Pengumuman</span>
              <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">
                Dari Admin Baitul Huffaz
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">
            {user ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'M'}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Loading */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="text-tosca-300 animate-spin" size={36} strokeWidth={1.5} />
            <p className="text-sm text-slate-400 font-bold">Memuat informasi...</p>
          </div>
        ) : infoList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
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
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {infoList.length} Informasi
            </p>

            {infoList.map(info => (
              <div
                key={info.id}
                className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="bg-gradient-to-r from-tosca-800 to-teal-700 p-5">
                  <div className="flex items-start gap-3">
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
        <Link href="/dashboard/musyrif/informasi" className="flex flex-col items-center justify-center gap-1 flex-1 text-fuchsia-600">
          <Megaphone size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Informasi</span>
        </Link>
        <Link href="/dashboard/musyrif/profil" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <User size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
