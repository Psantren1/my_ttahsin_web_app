'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, BookOpenCheck, Home, BookOpen, Star, CheckSquare, Calendar, Target, Award } from 'lucide-react';
import { useSantriList, useSetoranList } from '@/lib/hooks/useApi';

export default function StatusPage() {
  const { data: santriData } = useSantriList();
  const { data: setoranData } = useSetoranList();
  const [santriList, setSantriList] = useState<any[]>([]);

  useEffect(() => {
    if (!santriData?.data || !setoranData?.data) return;
    const TahsinRecords = setoranData.data || [];
    const map: any = {};
    TahsinRecords.forEach((r: any) => {
      const santriId = r.santuario_id;
      if (santriId && !map[santriId]) {
        const santri = santriData.data.find((s: any) => s.id === santriId);
        map[santriId] = {
          id: santriId,
          nama: santri?.full_name || r.santri_name || 'Siswa',
          status: r.status === 'LANJUT' ? 'Lanjut' : 'Ulangi'
        };
      }
    });
    setSantriList(Object.values(map));
  }, [santriData, setoranData]);

  const lanjutList = santriList.filter((s: any) => s.status === 'Lanjut');
  const ulangiList = santriList.filter((s: any) => s.status === 'Ulangi');

  return (
    <>
        {/* Status Lanjut */}
        <div className="bg-green-50 rounded-3xl border border-green-100 p-5 space-y-4">
          <h4 className="text-sm font-black text-green-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpenCheck className="text-green-600" size={18} /> Status Lanjut (Lulus)
          </h4>
          <div className="space-y-3">
            {lanjutList.length === 0 ? (
              <p className="text-xs text-green-600 font-bold p-2 text-center bg-white border border-green-100 rounded-2xl">Belum ada santri lulus uji.</p>
            ) : lanjutList.map((s: any) => (
              <div key={s.id} className="p-4 bg-white border border-green-100 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-black text-sm">
                    {s.nama.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className="text-sm font-black text-slate-800">{s.nama}</span>
                </div>
                <span className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold">Lulus Uji</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Ulangi */}
        <div className="bg-red-50 rounded-3xl border border-red-100 p-5 space-y-4">
          <h4 className="text-sm font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpenCheck className="text-red-600" size={18} /> Status Ulangi (Murojaah)
          </h4>
          <div className="space-y-3">
            {ulangiList.length === 0 ? (
              <p className="text-xs text-red-650 font-bold p-2 text-center bg-white border border-red-100 rounded-2xl">Belum ada santri perlu murojaah.</p>
            ) : ulangiList.map((s: any) => (
              <div key={s.id} className="p-4 bg-white border border-red-100 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
                    {s.nama.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className="text-sm font-black text-slate-800">{s.nama}</span>
                </div>
                <span className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Perlu Murojaah</span>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}
