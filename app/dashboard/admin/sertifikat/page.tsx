'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { useSettings } from '@/lib/hooks/useSettings';
import {
  Award, Search, Filter, Plus, Eye, Download, Send,
  Save, X, CheckCircle2, AlertCircle, Clock, FileText,
  Users, BookMarked, RefreshCw, GraduationCap, Star
} from 'lucide-react';
import dynamic from 'next/dynamic';

const SertifikatModal = dynamic(() => import('@/components/dashboard/admin/SertifikatModal'), { ssr: false });

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Santri {
  id: string; nis: string; nisn: string;
  nama_lengkap: string; kelas_id: string; kelas_nama: string; is_active: boolean;
}

interface TargetRecord {
  id: string; santriId: string; nis: string; santriName: string;
  kelasNama: string; juzTarget: string; namaSurat: string;
  progres: number; statusLulus: string; catatan?: string; updatedAt: string;
}

interface TahsinRecord {
  id: string; santriId: string; santriName: string; nis: string;
  surah: string; tajwid: number; makhraj: number; kelancaran: number;
  rata: number; status: string; createdAt: string;
}

interface SertifikatRecord {
  id: string; nomorSertifikat: string; santriId: string; nis: string;
  santriName: string; kelasNama: string; namaSurat: string; juzKe: string;
  statusKelulusan: string; paragrafTeks: string; namaSekolah: string;
  alamatSekolah: string; akreditasi: string; nilaiTajwid: number;
  nilaiMakhraj: number; nilaiKelancaran: number; nilaiRata: number;
  kotaPenandatangan: string; tanggalTerbit: string;
  namaPenanggungJawab: string; jabatan: string;
  isPublished: boolean; createdAt: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateNomor(existing: SertifikatRecord[]): string {
  const yr = new Date().getFullYear();
  const sameYear = existing.filter(r => r.nomorSertifikat.includes(String(yr)));
  const next = sameYear.length + 1;
  return `BH/SRT/${yr}/${String(next).padStart(3, '0')}`;
}

function avgTahsin(records: TahsinRecord[], santriId: string) {
  const mine = records.filter(r => r.santriId === santriId || r.nis === santriId);
  if (mine.length === 0) return { tajwid: 0, makhraj: 0, kelancaran: 0, rata: 0 };
  const sum = mine.reduce((a, r) => ({
    tajwid:     a.tajwid     + r.tajwid,
    makhraj:    a.makhraj    + r.makhraj,
    kelancaran: a.kelancaran + r.kelancaran,
    rata:       a.rata       + r.rata,
  }), { tajwid: 0, makhraj: 0, kelancaran: 0, rata: 0 });
  const n = mine.length;
  return {
    tajwid:     Math.round(sum.tajwid     / n),
    makhraj:    Math.round(sum.makhraj    / n),
    kelancaran: Math.round(sum.kelancaran / n),
    rata:       Math.round(sum.rata       / n),
  };
}

function todayStr() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_TARGET = {
  'Lulus':       { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Proses':      { badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400'   },
  'Belum Lulus': { badge: 'bg-rose-50 text-rose-700 border-rose-200',          dot: 'bg-rose-500'    },
};

// ─── Default Form Settings (persisten) ────────────────────────────────────────
interface FormSettings {
  alamatSekolah: string; akreditasi: string;
  namaPenanggungJawab: string; jabatan: string; kotaPenandatangan: string;
}
const DEFAULT_FORM: FormSettings = {
  alamatSekolah: '', akreditasi: 'A',
  namaPenanggungJawab: '', jabatan: 'Kepala Pondok', kotaPenandatangan: 'Palembang',
};

// ─── Komponen Utama ────────────────────────────────────────────────────────────

export default function ManajemenSertifikat() {
  const { settings } = useSettings();

  // Data
  const [santriList,    setSantriList]    = useState<Santri[]>([]);
  const [targetRecords, setTargetRecords] = useState<TargetRecord[]>([]);
  const [TahsinRecs,   setTahsinRecs]   = useState<TahsinRecord[]>([]);
  const [sertifikatRecs,setSertifikatRecs]= useState<SertifikatRecord[]>([]);

  // Filter
  const [selectedKelas, setSelectedKelas] = useState('Semua Kelas');
  const [searchQuery,   setSearchQuery]   = useState('');

  // Notif
  const [notif, setNotif] = useState<string | null>(null);
  const showNotif = (msg: string) => { setNotif(msg); setTimeout(() => setNotif(null), 3500); };

  // Modal state
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [modalSantri,    setModalSantri]    = useState<Santri | null>(null);
  const [modalTarget,    setModalTarget]    = useState<TargetRecord | null>(null);
  const [modalNilai,     setModalNilai]     = useState({ tajwid: 0, makhraj: 0, kelancaran: 0, rata: 0 });
  const [modalExisting,  setModalExisting]  = useState<SertifikatRecord | null>(null);
  const [isPDFLoading,   setIsPDFLoading]   = useState(false);

  // Form fields
  const [fParagraf,    setFParagraf]    = useState('');
  const [fAlamat,      setFAlamat]      = useState('');
  const [fAkreditasi,  setFAkreditasi]  = useState('A');
  const [fNamaTTD,     setFNamaTTD]     = useState('');
  const [fJabatan,     setFJabatan]     = useState('');
  const [fKota,        setFKota]        = useState('');
  const [fTanggal,     setFTanggal]     = useState('');

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [santriRes, setoranRes, sertifikatRes] = await Promise.all([
        fetch('/api/santri'),
        fetch('/api/setoran'),
        fetch('/api/sertifikat'),
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
      if (setoranJson.data) setTahsinRecs(setoranJson.data);
      const sertifikatJson = await sertifikatRes.json();
      if (sertifikatJson.data) {
        const mapped = sertifikatJson.data.map((r: any) => ({
          id: r.id,
          nomorSertifikat: r.nomor_sertifikat || r.no_sertifikat || '',
          santriId: r.santuario_id,
          nis: r.nis || '',
          santriName: r.santri_name || '',
          kelasNama: r.kelas_nama || '',
          namaSurat: r.nama_surat || '',
          juzKe: r.juz_ke || String(r.juz || ''),
          statusKelulusan: r.status_kelulusan || (r.status === 'TERBIT' ? 'Lulus' : 'Proses'),
          paragrafTeks: r.paragraf_teks || '',
          namaSekolah: r.nama_sekolah || '',
          alamatSekolah: r.alamat_sekolah || '',
          akreditasi: r.akreditasi || 'A',
          nilaiTajwid: r.nilai_tajwid ?? 0,
          nilaiMakhraj: r.nilai_makhraj ?? 0,
          nilaiKelancaran: r.nilai_kelancaran ?? 0,
          nilaiRata: r.nilai_rata ?? 0,
          kotaPenandatangan: r.kota_penandatangan || 'Palembang',
          tanggalTerbit: r.tgl_cetak || '',
          namaPenanggungJawab: r.nama_penanggung_jawab || '',
          jabatan: r.jabatan || 'Kepala Pondok',
          isPublished: r.status === 'TERBIT',
          createdAt: r.created_at || '',
        }));
        setSertifikatRecs(mapped);
      }
    } catch (err) {
      console.error('Failed to load data', err);
    }
    // Target dari API
    const targetRes = await fetch('/api/target');
    const targetData = await targetRes.json();
    const t = targetData.data ? JSON.stringify(targetData.data) : null;
    if (t) { try { setTargetRecords(JSON.parse(t)); } catch {} }
    // Form settings dari API
    const settRes = await fetch('/api/settings');
    const settData = await settRes.json();
    const fs = settData.data ? JSON.stringify(settData.data) : null;
    if (fs) {
      try {
        const p: FormSettings = { ...DEFAULT_FORM, ...JSON.parse(fs) };
        setFAlamat(p.alamatSekolah); setFAkreditasi(p.akreditasi);
        setFNamaTTD(p.namaPenanggungJawab); setFJabatan(p.jabatan); setFKota(p.kotaPenandatangan);
      } catch {}
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Buka Modal ───────────────────────────────────────────────────────────────
  const openModal = (santri: Santri) => {
    const target  = targetRecords.find(r => r.santriId === santri.id) || null;
    const nilai   = avgTahsin(TahsinRecs, santri.id);
    const existing = sertifikatRecs.find(r => r.santriId === santri.id) || null;

    setModalSantri(santri);
    setModalTarget(target);
    setModalNilai(nilai);
    setModalExisting(existing);

    // Pre-fill form dari existing atau default
    if (existing) {
      setFParagraf(existing.paragrafTeks);
      setFAlamat(existing.alamatSekolah);
      setFAkreditasi(existing.akreditasi);
      setFNamaTTD(existing.namaPenanggungJawab);
      setFJabatan(existing.jabatan);
      setFKota(existing.kotaPenandatangan);
      setFTanggal(existing.tanggalTerbit);
    } else {
      setFParagraf(
        `Telah berhasil menyelesaikan Tahsin Al-Quran dengan baik sesuai kaidah Tajwid yang benar ` +
        `di ${settings.appName}. Sertifikat ini diberikan sebagai penghargaan atas dedikasi dan ` +
        `ketekunan dalam menghafal Kitabullah.`
      );
      setFTanggal(todayStr());
    }
    setIsModalOpen(true);
  };

  // ── Simpan form settings ke API ──────────────────────────────────────────────
  const persistFormSettings = async () => {
    const p: FormSettings = {
      alamatSekolah: fAlamat, akreditasi: fAkreditasi,
      namaPenanggungJawab: fNamaTTD, jabatan: fJabatan, kotaPenandatangan: fKota,
    };
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
  };

  // ── Build SertifikatRecord dari form ─────────────────────────────────────────
  const buildRecord = (isPublished: boolean): SertifikatRecord => {
    const nomor = modalExisting?.nomorSertifikat || generateNomor(sertifikatRecs);
    return {
      id:                  modalExisting?.id || `srt-${Date.now()}`,
      nomorSertifikat:     nomor,
      santriId:            modalSantri!.id,
      nis:                 modalSantri!.nis,
      santriName:          modalSantri!.nama_lengkap,
      kelasNama:           modalSantri!.kelas_nama,
      namaSurat:           modalTarget?.namaSurat  || '—',
      juzKe:               modalTarget?.juzTarget  || '—',
      statusKelulusan:     modalTarget?.statusLulus || 'Proses',
      paragrafTeks:        fParagraf,
      namaSekolah:         settings.appName,
      alamatSekolah:       fAlamat,
      akreditasi:          fAkreditasi,
      nilaiTajwid:         modalNilai.tajwid,
      nilaiMakhraj:        modalNilai.makhraj,
      nilaiKelancaran:     modalNilai.kelancaran,
      nilaiRata:           modalNilai.rata,
      kotaPenandatangan:   fKota,
      tanggalTerbit:       fTanggal,
      namaPenanggungJawab: fNamaTTD,
      jabatan:             fJabatan,
      isPublished,
      createdAt:           modalExisting?.createdAt || new Date().toISOString(),
    };
  };

  // ── Simpan Draft ──────────────────────────────────────────────────────────────
  const handleSimpanDraft = async () => {
    if (!modalSantri) return;
    await persistFormSettings();
    const rec = buildRecord(false);
    const filtered = sertifikatRecs.filter(r => r.santriId !== modalSantri.id);
    const updated = [rec, ...filtered];
    setSertifikatRecs(updated);
    try {
      const res = await fetch('/api/sertifikat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: updated }),
      });
      if (res.ok) {
        setModalExisting(rec);
        showNotif(`Draft sertifikat ${modalSantri.nama_lengkap} berhasil disimpan.`);
        return;
      }
    } catch {}
    await fetch('/api/sertifikat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: updated }),
    });
    setModalExisting(rec);
    showNotif(`Draft sertifikat ${modalSantri.nama_lengkap} berhasil disimpan.`);
  };

  // ── Simpan & Terbitkan ────────────────────────────────────────────────────────
  const handleTerbitkan = async () => {
    if (!modalSantri) return;
    await persistFormSettings();
    const rec = buildRecord(true);
    const filtered = sertifikatRecs.filter(r => r.santriId !== modalSantri.id);
    const updated = [rec, ...filtered];
    setSertifikatRecs(updated);
    try {
      const res = await fetch('/api/sertifikat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: updated }),
      });
      if (res.ok) {
        setModalExisting(rec);
        showNotif(`Sertifikat ${modalSantri.nama_lengkap} berhasil diterbitkan!`);
        setIsModalOpen(false);
        return;
      }
    } catch {}
    await fetch('/api/sertifikat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: updated }),
    });
    setModalExisting(rec);
    showNotif(`Sertifikat ${modalSantri.nama_lengkap} berhasil diterbitkan!`);
    setIsModalOpen(false);
  };

  // ── Cabut Publikasi ───────────────────────────────────────────────────────────
  const handleCabutTerbit = async () => {
    if (!modalSantri || !modalExisting) return;
    const rec = { ...modalExisting, isPublished: false };
    const filtered = sertifikatRecs.filter(r => r.santriId !== modalSantri.id);
    const updated = [rec, ...filtered];
    setSertifikatRecs(updated);
    try {
      const res = await fetch(`/api/sertifikat/${modalSantri.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rec),
      });
      if (res.ok) {
        setModalExisting(rec);
        showNotif(`Publikasi sertifikat ${modalSantri.nama_lengkap} dicabut.`);
        return;
      }
    } catch {}
    await fetch('/api/sertifikat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: updated }),
    });
    setModalExisting(rec);
    showNotif(`Publikasi sertifikat ${modalSantri.nama_lengkap} dicabut.`);
  };

  // ── Generate PDF (Download / Preview) ─────────────────────────────────────────
  const handlePDF = async (action: 'download' | 'preview') => {
    if (!modalSantri) return;
    await persistFormSettings();
    setIsPDFLoading(true);
    try {
      const [{ pdf }, { SertifikatPDF }, Reacts] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/SertifikatTemplate'),
        import('react'),
      ]);
      const rec = buildRecord(modalExisting?.isPublished || false);
      const data = {
        ...rec,
        logoUrl: settings.logoUrl || undefined,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = Reacts.default.createElement(SertifikatPDF, { data }) as any;
      const blob = await pdf(element).toBlob();
      const url  = URL.createObjectURL(blob);
      if (action === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sertifikat-${rec.santriName}-${rec.nomorSertifikat}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showNotif(`PDF berhasil diunduh!`);
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat PDF. Pastikan semua data sudah terisi.');
    } finally {
      setIsPDFLoading(false);
    }
  };

  // ── Data Turunan ──────────────────────────────────────────────────────────────
  const classList = Array.from(new Set(santriList.map(s => s.kelas_nama)));

  const tableData = santriList
    .filter(s => selectedKelas === 'Semua Kelas' || s.kelas_nama === selectedKelas)
    .filter(s =>
      (s.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis || '').includes(searchQuery)
    )
    .map(s => {
      const target   = targetRecords.find(r => r.santriId === s.id);
      const sertif   = sertifikatRecs.find(r => r.santriId === s.id);
      return { santri: s, target, sertif };
    });

  const totalTerbit = sertifikatRecs.filter(r => r.isPublished).length;
  const totalDraft  = sertifikatRecs.filter(r => !r.isPublished).length;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* ── Toast ── */}
          {notif && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 max-w-sm">
              <CheckCircle2 className="text-surface-400 shrink-0" size={18} />
              <span className="text-xs font-bold">{notif}</span>
            </div>
          )}

          {/* ── Header ── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900 flex items-center gap-3">
                <Award className="text-amber-500" size={32} />
                Manajemen Sertifikat
              </h1>
              <p className="text-tosca-600 font-semibold text-sm">
                Buat, pratinjau, dan terbitkan sertifikat Tahsin santri dalam format PDF.
              </p>
            </div>
            {/* Filter Kelas */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-2 rounded-2xl shrink-0">
              <Filter className="text-tosca-500 ml-2 shrink-0" size={16} />
              <select
                value={selectedKelas}
                onChange={e => setSelectedKelas(e.target.value)}
                className="bg-transparent font-bold text-tosca-900 border-none outline-none text-sm pr-3 cursor-pointer"
              >
                <option value="Semua Kelas">Semua Kelas</option>
                {classList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Siswa',    val: santriList.length, icon: Users,     bg: 'bg-tosca-100', color: 'text-tosca-600',  unit: 'Siswa' },
              { label: 'Sudah Terbit',    val: totalTerbit,       icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600', unit: 'Sertifikat' },
              { label: 'Draft / Belum',   val: totalDraft + (santriList.length - sertifikatRecs.length), icon: FileText, bg: 'bg-amber-100', color: 'text-amber-600', unit: 'Siswa' },
            ].map(item => (
              <div key={item.label} className="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                  <item.icon size={22} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{item.val} <span className="text-sm font-bold text-slate-400">{item.unit}</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabel Utama ── */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
            {/* Search bar */}
            <div className="p-5 border-b border-surface-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-sm font-bold text-tosca-900 flex items-center gap-2">
                <GraduationCap className="text-tosca-600" size={18} /> Daftar Siswa
              </h3>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-tosca-200 rounded-2xl text-xs font-bold text-black placeholder:text-surface-400 focus:ring-2 focus:ring-tosca-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-tosca-50/40 border-b border-tosca-100 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                    <th className="py-4 px-5 text-center w-12">No</th>
                    <th className="py-4 px-5">NIS / NISN</th>
                    <th className="py-4 px-5">Nama Lengkap</th>
                    <th className="py-4 px-5">Kelas</th>
                    <th className="py-4 px-5">Nama Surat</th>
                    <th className="py-4 px-5 text-center">Status Target</th>
                    <th className="py-4 px-5 text-center">Sertifikat</th>
                    <th className="py-4 px-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tosca-50 text-xs">
                  {tableData.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      <AlertCircle className="mx-auto text-tosca-200 mb-2" size={32} strokeWidth={1.5} />
                      Tidak ada data santri ditemukan.
                    </td></tr>
                  ) : tableData.map(({ santri, target, sertif }, idx) => {
                    const stCfg = STATUS_TARGET[(target?.statusLulus as keyof typeof STATUS_TARGET) || 'Proses'];
                    return (
                      <tr key={santri.id} className="hover:bg-tosca-50/20 transition-all">
                        <td className="py-4 px-5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-800">{santri.nis}</p>
                          <p className="text-[9px] text-slate-400">NISN: {santri.nisn}</p>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900">{santri.nama_lengkap}</td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 bg-tosca-50 text-tosca-700 border border-tosca-100 rounded font-bold text-[9px] uppercase">
                            {santri.kelas_nama}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {target?.namaSurat ? (
                            <div className="flex items-center gap-1.5">
                              <BookMarked className="text-surface-400 shrink-0" size={12} />
                              <span className="font-bold text-slate-700">{target.namaSurat}</span>
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-4 px-5 text-center">
                          {target ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[9px] font-bold uppercase ${stCfg.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${stCfg.dot}`} />
                              {target.statusLulus}
                            </span>
                          ) : <span className="text-slate-300 font-bold">—</span>}
                        </td>
                        <td className="py-4 px-5 text-center">
                          {sertif ? (
                            sertif.isPublished ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold uppercase">
                                ✅ Terbit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border bg-slate-50 text-slate-500 border-slate-200 text-[9px] font-bold uppercase">
                                💾 Draft
                              </span>
                            )
                          ) : (
                            <span className="text-slate-300 font-bold text-[9px]">Belum Dibuat</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => openModal(santri)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${
                              sertif
                                ? 'bg-slate-100 text-slate-600 hover:bg-tosca-100 hover:text-tosca-700'
                                : 'bg-tosca-600 text-white hover:bg-tosca-700 shadow-sm'
                            }`}
                          >
                            {sertif ? <RefreshCw size={12} /> : <Plus size={12} />}
                            {sertif ? 'Edit' : 'Buat'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      {isModalOpen && modalSantri && (
        <SertifikatModal
          modalSantri={modalSantri}
          modalTarget={modalTarget}
          modalNilai={modalNilai}
          modalExisting={modalExisting}
          isPDFLoading={isPDFLoading}
          onClose={() => setIsModalOpen(false)}
          fParagraf={fParagraf}
          setFParagraf={setFParagraf}
          fAlamat={fAlamat}
          setFAlamat={setFAlamat}
          fAkreditasi={fAkreditasi}
          setFAkreditasi={setFAkreditasi}
          fNamaTTD={fNamaTTD}
          setFNamaTTD={setFNamaTTD}
          fJabatan={fJabatan}
          setFJabatan={setFJabatan}
          fKota={fKota}
          setFKota={setFKota}
          fTanggal={fTanggal}
          setFTanggal={setFTanggal}
          handlePDF={handlePDF}
          handleSimpanDraft={handleSimpanDraft}
          handleTerbitkan={handleTerbitkan}
          handleCabutTerbit={handleCabutTerbit}
          hasTahsinData={TahsinRecs.filter(r => r.santriId === modalSantri.id).length > 0}
        />
      )}
    </>
  );
}
