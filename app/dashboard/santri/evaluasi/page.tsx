'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  ClipboardList, 
  Home, 
  Star, 
  Video, 
  Award, 
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface EvaluasiRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasNama: string;
  adab: string;
  keterangan: string;
  updatedAt: string;
}

// Fallback profile if no localStorage record is found for the logged-in santri
const defaultProfile = {
  adab: '',
  disiplin: '',
  catatan: '',
  updatedAt: ''
};

export default function EvaluasiSantriPage() {
  const { user } = useAuth();
  const [evalRecord, setEvalRecord] = useState<EvaluasiRecord | null>(null);

  const loadEvaluasi = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/evaluasi?santuario_id=${user.id}`);
      const data = await res.json();
      const allRecords: EvaluasiRecord[] = (data.data || []).map((r: any) => ({
        id: r.id,
        santriId: r.santuario_id,
        santriName: r.santri_name || '',
        kelasNama: r.kelas_nama || '',
        adab: r.predikat_adab || '',
        keterangan: r.catatan || '',
        updatedAt: r.created_at || '',
      }));
      const matched = allRecords.find(r => 
        r.santriId === user.id || 
        r.santriName.toLowerCase() === user.fullName.toLowerCase()
      );
      if (matched) {
        setEvalRecord(matched);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEvaluasi();

    const interval = setInterval(loadEvaluasi, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const displayAdab = evalRecord ? evalRecord.adab : defaultProfile.adab;
  const displayCatatan = evalRecord ? evalRecord.keterangan : defaultProfile.catatan;
  const displayDate = evalRecord ? evalRecord.updatedAt : defaultProfile.updatedAt;

  return (
    <div className="min-h-screen bg-tosca-50/30 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/santri" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-900 block">Evaluasi Adab</span>
              <span className="text-[10px] text-tosca-500 font-medium">Sikap & perkembangan harian</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">
            {user ? user.fullName.split(' ').map(n => n.charAt(0)).slice(0, 2).join('') : 'AF'}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Info */}
        <div className="bg-violet-50 rounded-2xl border border-violet-100 p-4 flex items-center gap-3">
          <ClipboardList className="text-violet-500 shrink-0" size={20} />
          <p className="text-sm text-violet-700 font-bold leading-relaxed">
            Catatan perkembangan sikap dari ustadz
          </p>
        </div>

        {/* Evaluation Cards */}
        <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2">
              <ClipboardList className="text-violet-500" size={18} /> Evaluasi & Sikap Karakter
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Update: {displayDate}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-wider">Predikat Adab</p>
              <p className="text-base font-black text-green-900 mt-1.5">{displayAdab}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Kedisiplinan</p>
              <p className="text-base font-black text-blue-900 mt-1.5">{defaultProfile.disiplin}</p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
            <div className="absolute right-4 top-4 text-slate-100">
              <ClipboardList size={60} className="stroke-[1]" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 relative z-10">Catatan Pembimbing</p>
            <p className="text-sm text-slate-800 leading-relaxed font-semibold relative z-10 max-w-xl">
              "{displayCatatan}"
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-tosca-100 px-3 sm:px-4 py-2 flex items-center justify-around shadow-2xl lg:hidden">
        <Link href="/dashboard/santri" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Beranda</span>
        </Link>
        <Link href="/dashboard/santri/nilai" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Star size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/santri/virtual-class" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Video size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Kelas Virtual</span>
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