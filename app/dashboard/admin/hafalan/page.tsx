'use client';

import React, { useState, useEffect } from 'react';

import { 
  BookOpen, 
  Search, 
  Users, 
  CheckCircle2, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  Activity, 
  Award,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';

// Interfaces
interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  is_active: boolean;
}

interface TahsinRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasId: string;
  kelasNama: string;
  nis: string;
  surah: string;
  ayat: string; // e.g. "1-20" or range
  tajwid: number;
  makhraj: number;
  kelancaran: number;
  rata: number;
  status: 'Lanjut' | 'Ulang';
  createdAt: string;
}

// Initial dummy records for beautiful first impression
const defaultTahsinRecords: TahsinRecord[] = [];

export default function ManajemenTahsinAdminPage() {
  const { settings } = useSettings();
  
  // Data lists
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [records, setRecords] = useState<TahsinRecord[]>([]);
  const [kelasOptions, setKelasOptions] = useState<any[]>([]);
  
  // Filters
  const [selectedKelasId, setSelectedKelasId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadData = async () => {
    try {
      const [santriRes, setoranRes, kelasRes] = await Promise.all([
        fetch('/api/santri'),
        fetch('/api/setoran'),
        fetch('/api/kelas'),
      ]);
      const santriJson = await santriRes.json();
      if (santriJson.data) {
        const mappedSantri = (santriJson.data || []).map((s: any) => ({
          id: s.id,
          nis: s.nis || '',
          nisn: s.nisn || '',
          nama_lengkap: s.full_name || '',
          kelas_id: s.kelas_id || '',
          kelas_nama: s.kelas_nama || '',
          is_active: s.is_active,
        }));
        setSantriList(mappedSantri);
      }
      const setoranJson = await setoranRes.json();
      if (setoranJson.data) {
        const mapped = (setoranJson.data || []).map((r: any) => ({
          id: r.id,
          santriId: r.santuario_id,
          santriName: r.santri_name || '',
          kelasId: r.kelas_id || '',
          kelasNama: r.kelas_nama || '',
          nis: r.nis || '',
          surah: r.surah || '',
          ayat: r.ayat_start ? (r.ayat_end ? `${r.ayat_start}-${r.ayat_end}` : String(r.ayat_start)) : '',
          tajwid: r.tajwid_score || 0,
          makhraj: r.makhraj_score || 0,
          kelancaran: r.kelancaran_score || 0,
          rata: r.rata_rata || 0,
          status: r.status === 'LANJUT' ? 'Lanjut' as const : 'Ulang' as const,
          createdAt: r.created_at || ''
        }));
        setRecords(mapped);
      }
      const kelasJson = await kelasRes.json();
      if (kelasJson.data) {
        setKelasOptions(kelasJson.data);
        if (kelasJson.data.length > 0 && !selectedKelasId) {
          setSelectedKelasId(kelasJson.data[0].id);
        }
      }
    } catch (e) {
      console.error('Error loading data', e);
    }
  };

  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Filter santri by selected class
  const santriInClass = santriList.filter(s => s.kelas_id === selectedKelasId);

  // Group latest records by santriId for current selected class
  const santriTahsinList = santriInClass.map(s => {
    // Find all records for this santri
    const santriRecs = records.filter(r => r.santriId === s.id);
    // Get the latest one by parsing id or timestamp (default to the first one since we prepend new ones)
    const latestRec = santriRecs.length > 0 ? santriRecs[0] : null;

    return {
      santri: s,
      record: latestRec
    };
  });

  // Filter list by search term
  const filteredTahsinList = santriTahsinList.filter(item => 
    (item.santri.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.santri.nis || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculation
  const totalSetoran = records.length;
  const countLanjut = records.filter(r => r.status === 'Lanjut').length;
  const countUlang = records.filter(r => r.status === 'Ulang').length;
  
  const averageAllScores = records.length > 0 
    ? (records.reduce((acc, r) => acc + r.rata, 0) / records.length).toFixed(1) 
    : '0';

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-tosca-100 rounded-2xl text-tosca-600 shadow-md shadow-tosca-50">
                <BookOpen size={28} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900 leading-tight">Manajemen Tahsin</h1>
                <p className="text-tosca-600 font-medium">Pantau berkas, status, dan nilai setoran Tahsin harian santri Manajemen Al-Quran.</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Total Setoran</span>
              <p className="text-2xl font-bold text-tosca-950 mt-1">{totalSetoran} Kali</p>
              <span className="text-[9px] text-tosca-600 font-bold bg-tosca-50 px-2 py-0.5 rounded w-fit mt-3 block">Akumulatif</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Status Lanjut</span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-green-600">{countLanjut}</p>
                <span className="text-xs font-bold text-slate-400">setoran</span>
              </div>
              <span className="text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded w-fit mt-3 block flex items-center gap-1">
                <TrendingUp size={10} /> Lulus Bimbingan
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Status Ulang</span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-red-500">{countUlang}</p>
                <span className="text-xs font-bold text-slate-400">setoran</span>
              </div>
              <span className="text-[9px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded w-fit mt-3 block flex items-center gap-1">
                <TrendingDown size={10} /> Perlu Murojaah
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Rata-rata Nilai</span>
              <p className="text-2xl font-bold text-amber-500 mt-1">{averageAllScores} / 100</p>
              <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded w-fit mt-3 block flex items-center gap-1">
                <Award size={10} /> Predikat Mumtaz
              </span>
            </div>
          </div>

          {/* Filtering Section */}
          <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-tosca-500 shrink-0" size={18} />
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-tosca-50/50 border border-tosca-100 rounded-xl text-sm font-bold text-tosca-900 focus:ring-2 focus:ring-tosca-500"
              >
                {kelasOptions.length === 0 && <option value="">-- Memuat kelas --</option>}
                {kelasOptions.map((k: any) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari NIS atau Nama Lengkap..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-tosca-50/50 border border-tosca-100 rounded-xl text-sm focus:ring-2 focus:ring-tosca-500 w-full font-semibold text-black"
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-tosca-50/40 border-b border-tosca-100">
                    <th className="px-5 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">No</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">NIS</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Nama Lengkap Siswa</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Kelas</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Nama Surat</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">Jumlah/Rentang Ayat</th>
                    <th className="px-3 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">Tajwid</th>
                    <th className="px-3 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">Makhraj</th>
                    <th className="px-3 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">Kelancaran</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">Rata</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tosca-50">
                  {filteredTahsinList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertCircle size={32} className="text-tosca-300 stroke-[1.5]" />
                          <p className="text-sm">Tidak ada data setoran Tahsin ditemukan di kelas ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTahsinList.map((item, index) => {
                      const rec = item.record;
                      const hasRecord = rec !== null;

                      return (
                        <tr key={item.santri.id} className="hover:bg-tosca-50/20 transition-colors group">
                          <td className="px-5 py-3.5 text-xs text-center font-bold text-surface-400">{index + 1}</td>
                          <td className="px-4 py-3.5 text-xs font-bold text-tosca-700">{item.santri.nis}</td>
                          <td className="px-4 py-3.5 text-sm font-bold text-tosca-900 group-hover:text-tosca-600 transition-colors">{item.santri.nama_lengkap}</td>
                          <td className="px-4 py-3.5 text-xs">
                            <span className="px-2.5 py-1 bg-tosca-50 text-tosca-700 border border-tosca-100 rounded-md font-bold text-[10px] uppercase">
                              {item.santri.kelas_nama}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm font-bold text-slate-800">
                            {hasRecord ? `Surah ${rec.surah}` : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-slate-600 text-center">
                            {hasRecord ? `Ayat ${rec.ayat}` : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-3 py-3.5 text-xs font-bold text-center text-slate-700">
                            {hasRecord ? rec.tajwid : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-3 py-3.5 text-xs font-bold text-center text-slate-700">
                            {hasRecord ? rec.makhraj : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-3 py-3.5 text-xs font-bold text-center text-slate-700">
                            {hasRecord ? rec.kelancaran : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {hasRecord ? (
                              <span className="px-2 py-0.5 bg-tosca-900 text-white rounded text-[10px] font-bold tracking-tight">
                                {rec.rata.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {hasRecord ? (
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit mx-auto justify-center ${
                                rec.status === 'Lanjut' 
                                  ? 'bg-green-500 text-white border border-green-400' 
                                  : 'bg-red-500 text-white border border-red-400'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full bg-white ${rec.status === 'Lanjut' ? 'animate-pulse' : ''}`}></span>
                                {rec.status === 'Lanjut' ? 'Lanjut' : 'Ulang'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-full text-[9px] font-bold uppercase block w-fit mx-auto">
                                Belum Setor
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Total count footer */}
            <div className="px-6 py-4 bg-tosca-50/20 border-t border-surface-100 flex items-center justify-between text-xs text-tosca-500 font-bold uppercase tracking-wider">
              <p>Menampilkan {filteredTahsinList.length} dari {filteredTahsinList.length} santri aktif kelas ini</p>
              <div className="flex gap-1.5">
                <span className="px-2.5 py-1 bg-white border border-tosca-100 text-tosca-800 rounded font-bold">Tahun Ajaran: {settings.tahunAjaran}</span>
              </div>
            </div>
          </div>
        </main>
    </>
  );
}
