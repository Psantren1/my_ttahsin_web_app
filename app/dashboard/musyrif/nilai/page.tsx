'use client';

import React, { useState, useMemo } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSantriList, useSetoranList, useBtqPemulaList, useBtqLanjutanList, useTahfidzList, useMurojaahList } from '@/lib/hooks/useApi';

interface Column {
  key: string;
  label: string;
  align?: string;
}

interface LevelDisplay {
  title: string;
  desc: string;
  columns: Column[];
  mapRecord: (r: any) => Record<string, any>;
  scoreKey: string;
}

const LEVEL_DISPLAY: Record<string, LevelDisplay> = {
  TAHSIN: {
    title: 'Daftar Nilai Tahsin',
    desc: 'Tajwid, Makhraj, Kelancaran',
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'tajwid', label: 'Tajwid', align: 'text-center' },
      { key: 'makhraj', label: 'Makhraj', align: 'text-center' },
      { key: 'kelancaran', label: 'Kelancaran', align: 'text-center' },
      { key: 'skor_akhir', label: 'Skor Akhir', align: 'text-center' },
    ],
    scoreKey: 'skor_akhir',
    mapRecord: (r: any) => ({
      nama: r.santri_name || '',
      tajwid: r.tajwid_score ?? 0,
      makhraj: r.makhraj_score ?? 0,
      kelancaran: r.kelancaran_score ?? 0,
      skor_akhir: Math.round(((r.tajwid_score ?? 0) + (r.makhraj_score ?? 0) + (r.kelancaran_score ?? 0)) / 3),
    }),
  },
  BTQ_PEMULA: {
    title: 'Daftar Nilai BTQ Pemula',
    desc: 'Jilid, Halaman, Nilai, Predikat',
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'jilid', label: 'Jilid', align: 'text-center' },
      { key: 'halaman', label: 'Halaman', align: 'text-center' },
      { key: 'nilai', label: 'Nilai', align: 'text-center' },
      { key: 'predikat', label: 'Predikat', align: 'text-center' },
    ],
    scoreKey: 'nilai',
    mapRecord: (r: any) => ({
      nama: r.santri_name || '',
      jilid: r.jilid || '',
      halaman: r.halaman ?? 0,
      nilai: r.nilai ?? 0,
      predikat: r.predikat || '',
    }),
  },
  BTQ_LANJUTAN: {
    title: 'Daftar Nilai BTQ Lanjutan',
    desc: 'Level, Juz/Surah, Nilai, Status',
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'level', label: 'Level', align: 'text-center' },
      { key: 'juz_surah', label: 'Juz/Surah' },
      { key: 'nilai', label: 'Nilai', align: 'text-center' },
      { key: 'status_bacaan', label: 'Status Bacaan', align: 'text-center' },
      { key: 'predikat', label: 'Predikat', align: 'text-center' },
    ],
    scoreKey: 'nilai',
    mapRecord: (r: any) => ({
      nama: r.santri_name || '',
      level: r.level || '',
      juz_surah: r.juz_surah || '',
      nilai: r.nilai ?? 0,
      status_bacaan: r.status_bacaan || '',
      predikat: r.predikat || '',
    }),
  },
  TAHFIDZ: {
    title: 'Daftar Nilai Tahfidz',
    desc: 'Juz, Surat, Ayat, Hafalan Baru, Nilai',
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'juz', label: 'Juz', align: 'text-center' },
      { key: 'surat', label: 'Surat' },
      { key: 'ayat', label: 'Ayat', align: 'text-center' },
      { key: 'hafalan_baru', label: 'Hafalan Baru' },
      { key: 'nilai', label: 'Nilai', align: 'text-center' },
    ],
    scoreKey: 'nilai',
    mapRecord: (r: any) => ({
      nama: r.santri_name || '',
      juz: r.juz ?? '',
      surat: r.surat || '',
      ayat: r.ayat || '',
      hafalan_baru: r.hafalan_baru || '',
      nilai: r.nilai ?? 0,
    }),
  },
  MUROJAAH: {
    title: 'Daftar Nilai Murojaah',
    desc: 'Juz, Surah, Ayat, Nilai, Status',
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'juz', label: 'Juz', align: 'text-center' },
      { key: 'surah', label: 'Surah' },
      { key: 'ayat', label: 'Ayat', align: 'text-center' },
      { key: 'nilai', label: 'Nilai', align: 'text-center' },
      { key: 'status_murojaah', label: 'Status', align: 'text-center' },
    ],
    scoreKey: 'nilai',
    mapRecord: (r: any) => ({
      nama: r.santri_name || '',
      juz: r.juz ?? '',
      surah: r.surah || '',
      ayat: r.ayat || '',
      nilai: r.nilai ?? 0,
      status_murojaah: r.status_murojaah || '',
    }),
  },
};

const DATA_HOOKS: Record<string, (opts?: any) => { data: any }> = {
  TAHSIN: (opts) => useSetoranList(opts),
  BTQ_PEMULA: (opts) => useBtqPemulaList(opts),
  BTQ_LANJUTAN: (opts) => useBtqLanjutanList(opts),
  TAHFIDZ: (opts) => useTahfidzList(opts),
  MUROJAAH: (opts) => useMurojaahList(opts),
};

export default function NilaiPage() {
  const { user } = useAuth();
  const level = user?.levelProgram || 'TAHSIN';
  const display = LEVEL_DISPLAY[level] || LEVEL_DISPLAY['TAHSIN'];
  const useData = DATA_HOOKS[level] || DATA_HOOKS['TAHSIN'];

  const { data: santriData } = useSantriList();
  const { data: nilaiData } = useData(user ? { musyrif_id: user.id } : undefined);

  const nilaiList = useMemo(() => {
    if (!santriData?.data || !nilaiData?.data) return [];
    const records = nilaiData.data || [];
    return santriData.data.map((s: any) => {
      const myRecs = records.filter((r: any) => r.santuario_id === s.id);
      const latest = myRecs[0] || {};
      return { id: s.id, ...display.mapRecord(latest) };
    });
  }, [santriData, nilaiData, display]);

  return (
    <>
      <div className="bg-tosca-50 rounded-2xl border border-tosca-100 p-4 flex items-center gap-3">
        <Star className="text-amber-500" size={20} />
        <p className="text-sm text-tosca-700 font-medium">Daftar nilai {level.replace('_', ' ').toLowerCase()} siswa.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={18} /> {display.title}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                {display.columns.map(col => (
                  <th key={col.key} className={`py-4 px-5 ${col.align || ''}`}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {nilaiList.length === 0 ? (
                <tr>
                  <td colSpan={display.columns.length} className="py-8 text-center text-slate-400 font-bold">
                    Belum ada data santri.
                  </td>
                </tr>
              ) : nilaiList.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                  {display.columns.map(col => (
                    <td key={col.key} className={`py-4 px-5 ${col.align || ''} font-bold text-slate-700`}>
                      {col.key === display.scoreKey ? (
                        <span className="px-3 py-1.5 bg-tosca-600 text-white rounded-lg text-sm font-black">
                          {s[col.key]}
                        </span>
                      ) : (
                        s[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
