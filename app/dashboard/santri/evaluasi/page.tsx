'use client';

import React from 'react';
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
import { useEvaluasiList } from '@/lib/hooks/useApi';

const defaultProfile = {
  adab: '',
  disiplin: '',
  catatan: '',
  updatedAt: ''
};

export default function EvaluasiSantriPage() {
  const { user } = useAuth();
  const { data: evalRes } = useEvaluasiList();
  const allRecords: any[] = (evalRes?.data || []).map((r: any) => ({
    id: r.id,
    santriId: r.santuario_id,
    santriName: r.santri_name || '',
    kelasNama: r.kelas_nama || '',
    adab: r.predikat_adab || '',
    keterangan: r.catatan || '',
    updatedAt: r.created_at || '',
  }));
  const evalRecord = allRecords.find(r => 
    r.santriId === user?.id || 
    r.santriName.toLowerCase() === (user?.fullName || '').toLowerCase()
  ) || null;

  const displayAdab = evalRecord ? evalRecord.adab : defaultProfile.adab;
  const displayCatatan = evalRecord ? evalRecord.keterangan : defaultProfile.catatan;
  const displayDate = evalRecord ? evalRecord.updatedAt : defaultProfile.updatedAt;

  return (<>
    <div className="bg-violet-50 rounded-2xl border border-violet-100 p-4 flex items-center gap-3">
      <ClipboardList className="text-violet-500 shrink-0" size={20} />
      <p className="text-sm text-violet-700 font-bold leading-relaxed">
        Catatan perkembangan sikap dari guru
      </p>
    </div>

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
  </>
  );
}
