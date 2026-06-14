'use client';

import React, { useState, useEffect } from 'react';

import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Users,
  CalendarDays,
  Percent
} from 'lucide-react';

interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  is_active: boolean;
}

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

const defaultPresensiRecords: PresensiRecord[] = [];

export default function ManajemenKehadiran() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [presensiRecords, setPresensiRecords] = useState<PresensiRecord[]>([]);
  const [kelasOptions, setKelasOptions] = useState<any[]>([]);
  
  // Selection / Filter states
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      const [santriRes, absensiRes, kelasRes] = await Promise.all([
        fetch('/api/santri'),
        fetch('/api/absensi'),
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
      const absensiJson = await absensiRes.json();
      if (absensiJson.data) {
        const mapped = (absensiJson.data || []).map((r: any) => ({
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
        setPresensiRecords(mapped);
      }
      const kelasJson = await kelasRes.json();
      if (kelasJson.data) setKelasOptions(kelasJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Extract unique classes from Manajemen Kelas
  const classesList = kelasOptions.length > 0 ? kelasOptions.map(k => k.nama) : Array.from(new Set(santriList.map(s => s.kelas_nama)));

  // Calculate rekap statistics per santri
  const rekapData = santriList.map(s => {
    // Filter presensi records for this specific santri
    const myRecords = presensiRecords.filter(r => r.santriId === s.id);
    const totalPertemuan = myRecords.length;
    const totalKehadiran = myRecords.filter(r => r.status === 'Hadir').length;

    return {
      id: s.id,
      nis: s.nis,
      nisn: s.nisn,
      nama_lengkap: s.nama_lengkap,
      kelas_nama: s.kelas_nama,
      totalPertemuan,
      totalKehadiran,
      presentaseKehadiran: totalPertemuan > 0 ? Math.round((totalKehadiran / totalPertemuan) * 100) : 100
    };
  });

  // Filter rekapData based on selected class and search query
  const filteredRekap = rekapData.filter(item => {
    const matchesKelas = !selectedKelas || item.kelas_nama === selectedKelas;
    const matchesSearch = (item.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.nis || '').includes(searchQuery);
    return matchesKelas && matchesSearch;
  });

  // Aggregate Stats
  const totalSantriFiltered = filteredRekap.length;
  const totalMeetings = Array.from(new Set(presensiRecords.map(r => r.meetingId))).length;
  const avgAttendanceRate = filteredRekap.length > 0 
    ? Math.round(filteredRekap.reduce((sum, item) => sum + item.presentaseKehadiran, 0) / filteredRekap.length)
    : 100;

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900 flex items-center gap-2">
                <ClipboardCheck className="text-tosca-600" size={32} /> Manajemen Kehadiran
              </h1>
              <p className="text-tosca-600 font-semibold">Rekapitulasi persentase presensi harian siswa Manajemen Al-Quran.</p>
            </div>
            
            {/* Class Filter */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
              <Filter className="text-tosca-500 shrink-0 ml-2" size={18} />
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="bg-transparent font-bold text-tosca-900 border-none outline-none text-sm pr-4 cursor-pointer"
              >
                <option value="">Semua Kelas</option>
                {classesList.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Total Siswa</p>
                <p className="text-2xl font-bold text-tosca-900">{totalSantriFiltered} Siswa</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <CalendarDays size={24} />
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Total Sesi Pertemuan</p>
                <p className="text-2xl font-bold text-tosca-900">{totalMeetings} Sesi</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Percent size={24} />
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Rata-rata Kehadiran</p>
                <p className="text-2xl font-bold text-tosca-900">{avgAttendanceRate}%</p>
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
            {/* Search header bar */}
            <div className="p-6 border-b border-surface-100 bg-tosca-50/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-sm font-bold text-tosca-900 flex items-center gap-2">
                <ClipboardCheck className="text-tosca-600" size={18} /> Ringkasan Kehadiran
              </h3>
              <div className="relative group w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari santri..." 
                  className="pl-11 pr-4 py-2.5 bg-white border border-tosca-200 rounded-2xl text-xs font-bold text-black placeholder:text-surface-400 focus:ring-2 focus:ring-tosca-500 w-full shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-tosca-50/40 border-b border-tosca-100 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                    <th className="py-4 px-6 text-center w-16">No</th>
                    <th className="py-4 px-6">NIS / NISN</th>
                    <th className="py-4 px-6">Nama Lengkap</th>
                    <th className="py-4 px-6">Kelas</th>
                    <th className="py-4 px-6 text-center">Jumlah Pertemuan</th>
                    <th className="py-4 px-6 text-center">Jumlah Kehadiran</th>
                    <th className="py-4 px-6 text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tosca-50 text-xs text-tosca-800">
                  {filteredRekap.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertCircle size={32} className="text-tosca-300 stroke-[1.5]" />
                          <p className="text-sm">Belum ada data kehadiran untuk filter yang dipilih.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRekap.map((item, index) => (
                      <tr key={item.id} className="hover:bg-tosca-50/20 transition-all font-semibold">
                        <td className="py-4 px-6 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{item.nis}</p>
                          <p className="text-[9px] text-slate-400">NISN: {item.nisn}</p>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-sm">{item.nama_lengkap}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 bg-tosca-50 text-tosca-700 rounded border border-tosca-100 font-bold text-[9px] uppercase">
                            {item.kelas_nama}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-700">{item.totalPertemuan} Sesi</td>
                        <td className="py-4 px-6 text-center font-bold text-tosca-600">{item.totalKehadiran} Sesi</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 hidden sm:block">
                              <div 
                                className={`h-full rounded-full ${
                                  item.presentaseKehadiran >= 85 ? 'bg-emerald-500' :
                                  item.presentaseKehadiran >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${item.presentaseKehadiran}%` }}
                              ></div>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              item.presentaseKehadiran >= 85 ? 'bg-emerald-50 text-emerald-700' :
                              item.presentaseKehadiran >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {item.presentaseKehadiran}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </>
  );
}
