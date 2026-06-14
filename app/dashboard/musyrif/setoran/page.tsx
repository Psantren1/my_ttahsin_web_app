'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  User, 
  Check, 
  X, 
  Star, 
  AlertCircle,
  Plus,
  HelpCircle,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  useSantriList, useSetoranList, useCreateSetoran,
  useBtqPemulaList, useCreateBtqPemula,
  useBtqLanjutanList, useCreateBtqLanjutan,
  useTahfidzList, useCreateTahfidz,
  useMurojaahList, useCreateMurojaah,
} from '@/lib/hooks/useApi';

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
  ayat: string;
  tajwid: number;
  makhraj: number;
  kelancaran: number;
  rata: number;
  status: 'Lanjut' | 'Ulang';
  createdAt: string;
}

// ─── Level config ────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, {
  label: string; labelInput: string; color: string; heroTitle: string; heroDesc: string;
  fields: { name: string; label: string; type: string; placeholder: string }[];
  mapRecord: (r: any) => any;
  buildPayload: (santriId: string, userId: string, inputs: any) => any;
  scoreLabel: string;
}> = {
  TAHSIN: {
    label: 'Tahsin', labelInput: 'Setoran Tahsin', color: 'from-tosca-900 to-tosca-800',
    heroTitle: 'Penilaian Setoran Tahsin',
    heroDesc: 'Pilih santri untuk menginput setoran Tahsin, berikan skor tajwid, makhraj, dan kelancaran.',
    fields: [
      { name: 'surah', label: 'Nama Surat', type: 'text', placeholder: 'Contoh: An-Naba' },
      { name: 'ayat', label: 'Rentang Ayat', type: 'text', placeholder: 'Contoh: 1-20' },
    ],
    scoreLabel: 'Skor Penilaian (0-100)',
    mapRecord: (r: any) => ({
      id: r.id, santriId: r.santuario_id, santriName: r.santri_nama || '',
      kelasId: r.kelas_id || '', kelasNama: r.kelas_nama || '', nis: r.nis || '',
      detail1: r.surah || '', detail2: r.ayat_start ? (r.ayat_end ? `${r.ayat_start}-${r.ayat_end}` : String(r.ayat_start)) : '',
      score1: r.tajwid_score || 0, score2: r.makhraj_score || 0, score3: r.kelancaran_score || 0,
      rata: r.rata_rata || 0, status: r.status === 'LANJUT' ? 'Lanjut' : 'Ulang',
      createdAt: r.created_at || '',
    }),
    buildPayload: (santriId, userId, inputs) => {
      const taj = parseFloat(inputs.tajwid) || 0;
      const makh = parseFloat(inputs.makhraj) || 0;
      const lancar = parseFloat(inputs.kelancaran) || 0;
      const rata = parseFloat(((taj + makh + lancar) / 3).toFixed(1));
      return {
        santuario_id: santriId, musyrif_id: userId,
        surah: inputs.surah?.trim(),
        ayat_start: inputs.ayat?.includes('-') ? parseInt(inputs.ayat.split('-')[0]) : undefined,
        ayat_end: inputs.ayat?.includes('-') ? parseInt(inputs.ayat.split('-')[1]) : undefined,
        tajwid_score: taj, makhraj_score: makh, kelancaran_score: lancar,
        rata_rata: rata, status: inputs.status === 'Lanjut' ? 'LANJUT' : 'ULANGI', jenis: 'SABAQ',
      };
    },
  },
  BTQ_PEMULA: {
    label: 'BTQ1', labelInput: 'BTQ Pemula', color: 'from-emerald-700 to-emerald-600',
    heroTitle: 'Penilaian BTQ Pemula',
    heroDesc: 'Pilih santri untuk menginput nilai BTQ Pemula (jilid, halaman, nilai).',
    fields: [
      { name: 'jilid', label: 'Jilid', type: 'text', placeholder: 'Contoh: 1' },
      { name: 'halaman', label: 'Halaman', type: 'number', placeholder: 'Contoh: 10' },
    ],
    scoreLabel: 'Nilai',
    mapRecord: (r: any) => ({
      id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
      kelasId: r.kelas_id || '', kelasNama: r.kelas_nama || '', nis: r.nis || '',
      detail1: r.jilid || '', detail2: String(r.halaman || ''),
      score1: r.nilai || 0, score2: 0, score3: 0,
      rata: r.nilai || 0, status: '',
      createdAt: r.created_at || '',
    }),
    buildPayload: (santriId, userId, inputs) => ({
      santuario_id: santriId, musyrif_id: userId,
      jilid: inputs.jilid?.trim(), halaman: parseInt(inputs.halaman) || 0,
      nilai: parseInt(inputs.nilai) || 0,
      predikat: inputs.predikat || '',
      catatan: inputs.catatan || null,
    }),
  },
  BTQ_LANJUTAN: {
    label: 'BTQ2', labelInput: 'BTQ Lanjutan', color: 'from-blue-700 to-blue-600',
    heroTitle: 'Penilaian BTQ Lanjutan',
    heroDesc: 'Pilih santri untuk menginput nilai BTQ Lanjutan.',
    fields: [
      { name: 'juz_surah', label: 'Juz/Surah', type: 'text', placeholder: 'Contoh: Juz 1' },
      { name: 'level', label: 'Level', type: 'text', placeholder: 'Contoh: A' },
    ],
    scoreLabel: 'Nilai',
    mapRecord: (r: any) => ({
      id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
      kelasId: r.kelas_id || '', kelasNama: r.kelas_nama || '', nis: r.nis || '',
      detail1: r.juz_surah || '', detail2: r.level || '',
      score1: r.nilai || 0, score2: 0, score3: 0,
      rata: r.nilai || 0, status: '',
      createdAt: r.created_at || '',
    }),
    buildPayload: (santriId, userId, inputs) => ({
      santuario_id: santriId, musyrif_id: userId,
      level: inputs.level?.trim(), juz_surah: inputs.juz_surah?.trim(),
      nilai: parseInt(inputs.nilai) || 0,
      status_bacaan: inputs.status_bacaan || '',
      predikat: inputs.predikat || '',
      status_penilaian: inputs.status_penilaian || '',
    }),
  },
  TAHFIDZ: {
    label: 'Tahfidz', labelInput: 'Tahfidz', color: 'from-purple-700 to-purple-600',
    heroTitle: 'Penilaian Tahfidz',
    heroDesc: 'Pilih santri untuk menginput setoran hafalan Tahfidz.',
    fields: [
      { name: 'surah', label: 'Surah', type: 'text', placeholder: 'Contoh: Al-Baqarah' },
      { name: 'ayat', label: 'Ayat', type: 'text', placeholder: 'Contoh: 1-10' },
    ],
    scoreLabel: 'Nilai',
    mapRecord: (r: any) => ({
      id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
      kelasId: r.kelas_id || '', kelasNama: r.kelas_nama || '', nis: r.nis || '',
      detail1: r.surah || '', detail2: r.ayat || '',
      score1: r.nilai || 0, score2: 0, score3: 0,
      rata: r.nilai || 0, status: '',
      createdAt: r.created_at || '',
    }),
    buildPayload: (santriId, userId, inputs) => ({
      santuario_id: santriId, musyrif_id: userId,
      surah: inputs.surah?.trim(), ayat: inputs.ayat?.trim(),
      nilai: parseInt(inputs.nilai) || 0,
      catatan: inputs.catatan || null,
    }),
  },
  MUROJAAH: {
    label: 'Murojaah', labelInput: 'Murojaah', color: 'from-amber-700 to-amber-600',
    heroTitle: 'Penilaian Murojaah',
    heroDesc: 'Pilih santri untuk menginput setoran Murojaah.',
    fields: [
      { name: 'surah', label: 'Surah', type: 'text', placeholder: 'Contoh: Al-Mulk' },
      { name: 'ayat', label: 'Ayat', type: 'text', placeholder: 'Contoh: 1-30' },
    ],
    scoreLabel: 'Nilai',
    mapRecord: (r: any) => ({
      id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
      kelasId: r.kelas_id || '', kelasNama: r.kelas_nama || '', nis: r.nis || '',
      detail1: r.surah || '', detail2: r.ayat || '',
      score1: r.nilai || 0, score2: 0, score3: 0,
      rata: r.nilai || 0, status: '',
      createdAt: r.created_at || '',
    }),
    buildPayload: (santriId, userId, inputs) => ({
      santuario_id: santriId, musyrif_id: userId,
      surah: inputs.surah?.trim(), ayat: inputs.ayat?.trim(),
      nilai: parseInt(inputs.nilai) || 0,
      catatan: inputs.catatan || null,
    }),
  },
};

export default function SetoranTahsinMusyrifPage() {
  const { settings } = useSettings();
  const { user } = useAuth();

  const level = user?.levelProgram || 'TAHSIN';
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG['TAHSIN'];

  const { data: santriData } = useSantriList();
  const { data: setoranData } = useSetoranList(user ? { musyrif_id: user.id } : undefined);
  const createSetoran = useCreateSetoran();
  const { data: btqPemulaData } = useBtqPemulaList(user ? { musyrif_id: user.id } : undefined);
  const createBtqPemula = useCreateBtqPemula();
  const { data: btqLanjutanData } = useBtqLanjutanList(user ? { musyrif_id: user.id } : undefined);
  const createBtqLanjutan = useCreateBtqLanjutan();
  const { data: tahfidzData } = useTahfidzList(user ? { musyrif_id: user.id } : undefined);
  const createTahfidz = useCreateTahfidz();
  const { data: murojaahData } = useMurojaahList(user ? { musyrif_id: user.id } : undefined);
  const createMurojaah = useCreateMurojaah();

  const MUTATION: Record<string, any> = {
    TAHSIN: createSetoran, BTQ_PEMULA: createBtqPemula, BTQ_LANJUTAN: createBtqLanjutan,
    TAHFIDZ: createTahfidz, MUROJAAH: createMurojaah,
  };
  const mutation = MUTATION[level] || createSetoran;

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const santriList: Santri[] = (santriData?.data || []).map((s: any) => ({
    id: s.id,
    nis: s.nis || '',
    nisn: s.nisn || '',
    nama_lengkap: s.full_name || '',
    kelas_id: s.kelas_id || '',
    kelas_nama: s.kelas_nama || '',
    is_active: s.is_active,
  }));

  const DATA: Record<string, any> = {
    TAHSIN: setoranData, BTQ_PEMULA: btqPemulaData, BTQ_LANJUTAN: btqLanjutanData,
    TAHFIDZ: tahfidzData, MUROJAAH: murojaahData,
  };
  const records = ((DATA[level]?.data || []) as any[]).map(cfg.mapRecord);

  const openAssessmentModal = (santri: Santri) => {
    setSelectedSantri(santri);
    setInputValues({});
    setIsModalOpen(true);
  };

  const handleInputChange = (name: string, value: string) => {
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    try {
      const payload = cfg.buildPayload(selectedSantri.id, user?.id || '', inputValues);
      await mutation.mutateAsync(payload);
      setToastMessage(`Data ${selectedSantri.nama_lengkap} berhasil disimpan!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan data');
    }

    setIsModalOpen(false);
    setSelectedSantri(null);
  };

  const scoreFields = level === 'TAHSIN'
    ? [
        { name: 'tajwid', label: 'Tajwid' },
        { name: 'makhraj', label: 'Makhraj' },
        { name: 'kelancaran', label: 'Kelancaran' },
      ]
    : [{ name: 'nilai', label: 'Nilai' }];

  const extraFields: Array<{ name: string; label: string; type: string; placeholder: string }> = [
    ...cfg.fields,
    ...(level === 'BTQ_PEMULA' ? [
      { name: 'predikat', label: 'Predikat', type: 'text', placeholder: 'Baik/Cukup/Kurang' },
      { name: 'catatan', label: 'Catatan', type: 'text', placeholder: 'Catatan (opsional)' },
    ] : []),
    ...(level === 'BTQ_LANJUTAN' ? [
      { name: 'status_bacaan', label: 'Status Bacaan', type: 'text', placeholder: 'Lancar/Terlambat' },
      { name: 'predikat', label: 'Predikat', type: 'text', placeholder: 'A/B/C' },
      { name: 'status_penilaian', label: 'Status Penilaian', type: 'text', placeholder: 'Tuntas/Belum' },
    ] : []),
    ...(level === 'TAHFIDZ' || level === 'MUROJAAH' ? [
      { name: 'catatan', label: 'Catatan', type: 'text', placeholder: 'Catatan (opsional)' },
    ] : []),
  ];

  return (
    <>
        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={18} />
            <span className="text-xs font-extrabold">{toastMessage}</span>
          </div>
        )}

        {/* Hero Card */}
        <div className={`bg-gradient-to-tr ${cfg.color} rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[120px]`}>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <BookMarked size={120} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{cfg.heroTitle}</h1>
            <p className="text-xs text-tosca-100 font-medium leading-relaxed max-w-xl">{cfg.heroDesc}</p>
          </div>
        </div>

        {/* Santri List Container */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Sparkles size={14} className="text-amber-500" /> Daftar Siswa Halaqah Anda
          </h2>

          {santriList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-tosca-50 rounded-2xl text-tosca-500">
                <User size={40} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-tosca-950">Belum Ada Siswa</h3>
                <p className="text-xs text-tosca-500 max-w-xs mx-auto">
                  Hubungi Admin untuk mendaftarkan santri baru ke dalam kelas bimbingan Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {santriList.map((santri) => {
                const santriRecs = records.filter(r => r.santriId === santri.id);
                const latestRec = santriRecs.length > 0 ? santriRecs[0] : null;
                const hasSetor = latestRec !== null;

                return (
                  <div 
                    key={santri.id} 
                    onClick={() => openAssessmentModal(santri)}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:border-tosca-300 hover:shadow-md active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-2xl bg-tosca-50 text-tosca-600 border border-tosca-100 flex items-center justify-center font-black text-base shadow-inner group-hover:bg-tosca-600 group-hover:text-white transition-colors duration-300">
                        {santri.nama_lengkap.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-slate-800 group-hover:text-tosca-950 transition-colors">
                          {santri.nama_lengkap}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-extrabold">NIS: {santri.nis}</span>
                          <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] font-black text-tosca-600 uppercase tracking-wider">{santri.kelas_nama}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {hasSetor ? (
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                          latestRec.status === 'Lanjut' 
                            ? 'bg-green-500 text-white border border-green-400' 
                            : 'bg-red-500 text-white border border-red-400'
                        }`}>
                          {latestRec.status === 'Lanjut' ? 'Lanjut' : 'Ulang'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Belum Setor
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      {/* Dialog Modal Penilaian */}
      {isModalOpen && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-tosca-600 to-tosca-500 text-white rounded-xl shadow-md">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-tosca-950">Input {cfg.labelInput}</h2>
                  <p className="text-[10px] text-tosca-500 font-bold uppercase tracking-wider mt-0.5">{selectedSantri.nama_lengkap} ({selectedSantri.kelas_nama})</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedSantri(null); }} 
                className="text-tosca-400 hover:text-tosca-600 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSetoran} className="p-6 space-y-4">
              {extraFields.length > 0 && (
                <div className={`grid ${extraFields.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  {extraFields.map(f => (
                    <div key={f.name} className="space-y-1">
                      <label className="text-xs font-bold text-tosca-900 ml-1">{f.label}</label>
                      <input 
                        type={f.type}
                        value={inputValues[f.name] || ''}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                      />
                    </div>
                  ))}
                </div>
              )}

              {level === 'TAHSIN' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-900 ml-1">Status Setoran</label>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleInputChange('status', 'Lanjut')}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all ${
                        (inputValues.status || 'Lanjut') === 'Lanjut' 
                          ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-100 scale-98' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
                      }`}
                    >
                      Lanjut - Lulus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('status', 'Ulang')}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all ${
                        inputValues.status === 'Ulang' 
                          ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-100 scale-98' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                      }`}
                    >
                      Ulang Murojaah
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-50">
                <label className="text-xs font-bold text-tosca-900 ml-1">{cfg.scoreLabel}</label>
                <div className={`gap-3 ${scoreFields.length === 3 ? 'grid grid-cols-3' : 'flex flex-wrap'}`}>
                  {scoreFields.map(sf => (
                    <div key={sf.name} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase text-center block">{sf.label}</label>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={inputValues[sf.name] || '80'}
                        onChange={(e) => handleInputChange(sf.name, e.target.value)}
                        required 
                        className="w-full px-3 py-3 rounded-xl border border-slate-200 font-black text-center text-slate-800 focus:border-tosca-600 focus:ring-0 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-50 mt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setSelectedSantri(null); }} 
                  className="flex-1 px-4 py-3.5 border-2 border-slate-100 text-tosca-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-tosca-600 to-tosca-500 text-white rounded-2xl font-bold hover:from-tosca-700 hover:to-tosca-600 transition-all shadow-md shadow-tosca-100 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
