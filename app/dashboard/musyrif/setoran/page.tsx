'use client';

import React, { useState, useEffect } from 'react';
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

interface HafalanRecord {
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

export default function SetoranHafalanMusyrifPage() {
  const { settings } = useSettings();
  const { user } = useAuth();
  
  // Data lists
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [records, setRecords] = useState<HafalanRecord[]>([]);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form inputs
  const [inputSurah, setInputSurah] = useState('');
  const [inputAyat, setInputAyat] = useState('');
  const [inputStatus, setInputStatus] = useState<'Lanjut' | 'Ulang'>('Lanjut');
  const [inputTajwid, setInputTajwid] = useState('80');
  const [inputMakhraj, setInputMakhraj] = useState('80');
  const [inputKelancaran, setInputKelancaran] = useState('80');

  const loadData = async () => {
    if (!user) return;
    try {
      const [santriRes, setoranRes] = await Promise.all([
        fetch('/api/santri'),
        fetch(`/api/setoran?musyrif_id=${user.id}`)
      ]);
      if (santriRes.ok) {
        const santriData = await santriRes.json();
        setSantriList((santriData.data || []).map((s: any) => ({
          id: s.id,
          nis: s.nis || '',
          nisn: s.nisn || '',
          nama_lengkap: s.full_name || '',
          kelas_id: s.kelas_id || '',
          kelas_nama: s.kelas_nama || '',
          is_active: s.is_active,
        })));
      }
      if (setoranRes.ok) {
        const setoranData = await setoranRes.json();
        const mapped = (setoranData.data || []).map((r: any) => ({
          id: r.id,
          santriId: r.santuario_id,
          santriName: r.santri_nama || '',
          kelasId: r.kelas_id || '',
          kelasNama: r.kelas_nama || '',
          nis: r.nis || '',
          surah: r.surah || '',
          ayat: r.ayat_start ? (r.ayat_end ? `${r.ayat_start}-${r.ayat_end}` : String(r.ayat_start)) : '',
          tajwid: r.tajwid_score || 0,
          makhraj: r.makhraj_score || 0,
          kelancaran: r.kelancaran_score || 0,
          rata: r.rata_rata || 0,
          status: r.status === 'LANJUT' ? 'Lanjut' : 'Ulang',
          createdAt: r.created_at || new Date(r.tanggal || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        }));
        setRecords(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const openAssessmentModal = (santri: Santri) => {
    setSelectedSantri(santri);
    
    // Reset form with default or latest setoran
    const latestRec = records.find(r => r.santriId === santri.id);
    if (latestRec) {
      setInputSurah('');
      setInputAyat('');
      setInputStatus('Lanjut');
      setInputTajwid('80');
      setInputMakhraj('80');
      setInputKelancaran('80');
    } else {
      setInputSurah('');
      setInputAyat('');
      setInputStatus('Lanjut');
      setInputTajwid('80');
      setInputMakhraj('80');
      setInputKelancaran('80');
    }
    
    setIsModalOpen(true);
  };

  const handleSaveSetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    const taj = parseFloat(inputTajwid) || 0;
    const makh = parseFloat(inputMakhraj) || 0;
    const lancar = parseFloat(inputKelancaran) || 0;
    
    if (taj < 0 || taj > 100 || makh < 0 || makh > 100 || lancar < 0 || lancar > 100) {
      alert('Nilai harus berupa angka di rentang 0 hingga 100!');
      return;
    }

    const averageScore = parseFloat(((taj + makh + lancar) / 3).toFixed(1));

    try {
      const res = await fetch('/api/setoran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santuario_id: selectedSantri.id,
          musyrif_id: user?.id || '',
          surah: inputSurah.trim(),
          ayat_start: inputAyat.includes('-') ? parseInt(inputAyat.split('-')[0]) : undefined,
          ayat_end: inputAyat.includes('-') ? parseInt(inputAyat.split('-')[1]) : undefined,
          tajwid_score: taj,
          makhraj_score: makh,
          kelancaran_score: lancar,
          rata_rata: averageScore,
          status: inputStatus === 'Lanjut' ? 'LANJUT' : 'ULANGI',
          jenis: 'SABAQ'
        })
      });
      if (!res.ok) throw new Error('Failed to save');

      await loadData();

      setToastMessage(`Setoran ${selectedSantri.nama_lengkap} berhasil disimpan!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan setoran');
    }

    setIsModalOpen(false);
    setSelectedSantri(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-tosca-100/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/musyrif" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Setoran Hafalan</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">{settings.appName} • TA {settings.tahunAjaran}</span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">UM</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={18} />
            <span className="text-xs font-extrabold">{toastMessage}</span>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-gradient-to-tr from-tosca-900 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <BookMarked size={120} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Penilaian Setoran Hafalan</h1>
            <p className="text-xs text-teal-100 font-medium leading-relaxed max-w-xl">
              Pilih salah satu santri di bawah ini untuk menginput setoran hafalan barunya, memberikan skor tajwid, makhraj, dan kelancaran bimbingan.
            </p>
          </div>
        </div>

        {/* Santri List Container */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Sparkles size={14} className="text-amber-500" /> Daftar Santri Halaqah Anda
          </h2>

          {santriList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-tosca-50 rounded-2xl text-tosca-500">
                <User size={40} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-tosca-950">Belum Ada Santri</h3>
                <p className="text-xs text-tosca-500 max-w-xs mx-auto">
                  Hubungi Admin untuk mendaftarkan santri baru ke dalam kelas bimbingan Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {santriList.map((santri) => {
                // Find all records for this santri to determine their current status
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
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
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
      </main>

      {/* Dialog Modal Penilaian */}
      {isModalOpen && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-tosca-600 to-teal-500 text-white rounded-xl shadow-md">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-tosca-950">Input Setoran Baru</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-tosca-900 ml-1">Nama Surat</label>
                  <input 
                    type="text" 
                    value={inputSurah}
                    onChange={(e) => setInputSurah(e.target.value)}
                    placeholder="Contoh: An-Naba"
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-tosca-900 ml-1">Rentang Ayat</label>
                  <input 
                    type="text" 
                    value={inputAyat}
                    onChange={(e) => setInputAyat(e.target.value)}
                    placeholder="Contoh: 1-20"
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-tosca-900 ml-1">Status Setoran</label>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setInputStatus('Lanjut')}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all ${
                      inputStatus === 'Lanjut' 
                        ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-100 scale-98' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
                    }`}
                  >
                    Lanjut - Lulus
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputStatus('Ulang')}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all ${
                      inputStatus === 'Ulang' 
                        ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-100 scale-98' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                    }`}
                  >
                    Ulang Murojaah
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-50">
                <label className="text-xs font-bold text-tosca-900 ml-1">Skor Penilaian (0-100)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center block">Tajwid</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={inputTajwid}
                      onChange={(e) => setInputTajwid(e.target.value)}
                      required 
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 font-black text-center text-slate-800 focus:border-tosca-600 focus:ring-0 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center block">Makhraj</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={inputMakhraj}
                      onChange={(e) => setInputMakhraj(e.target.value)}
                      required 
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 font-black text-center text-slate-800 focus:border-tosca-600 focus:ring-0 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center block">Kelancaran</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={inputKelancaran}
                      onChange={(e) => setInputKelancaran(e.target.value)}
                      required 
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 font-black text-center text-slate-800 focus:border-tosca-600 focus:ring-0 text-sm"
                    />
                  </div>
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
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-tosca-600 to-teal-500 text-white rounded-2xl font-bold hover:from-tosca-700 hover:to-teal-600 transition-all shadow-md shadow-tosca-100 cursor-pointer"
                >
                  Simpan Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}