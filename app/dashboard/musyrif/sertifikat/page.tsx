'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award, ArrowLeft, Download, CheckCircle2, Home, BookOpen,
  Star, CheckSquare, User, FileText, RefreshCw, Eye,
  Clock, AlertCircle, BookMarked
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';

// ─── Interface (compatible with SertifikatData from PDF template) ─────────────

interface SertifikatRecord {
  id: string;
  nomorSertifikat: string;
  nis: string;
  namaSurat: string;
  juzKe: string;
  statusKelulusan: string;
  nilaiTajwid: number;
  nilaiMakhraj: number;
  nilaiKelancaran: number;
  nilaiRata: number;
  paragrafTeks: string;
  namaSekolah: string;
  alamatSekolah: string;
  akreditasi: string;
  kotaPenandatangan: string;
  tanggalTerbit: string;
  namaPenanggungJawab: string;
  jabatan: string;
  catatan?: string;
  isPublished: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LucideIcon = React.FC<{ size?: string | number; className?: string }> & any;

const statusConfig: Record<string, {
  badge: string;
  icon: LucideIcon;
  dot: string;
}> = {
  'Lulus': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
  'Proses': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    dot: 'bg-amber-400',
  },
  'Belum Lulus': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
    dot: 'bg-rose-500',
  },
};

function getPredikat(nilai: number) {
  if (nilai >= 90) return { label: 'Mumtaz',        color: '#065f46' };
  if (nilai >= 80) return { label: 'Jayyid Jiddan', color: '#1e40af' };
  if (nilai >= 70) return { label: 'Jayyid',        color: '#92400e' };
  if (nilai >= 60) return { label: 'Maqbul',        color: '#7c3aed' };
  return             { label: 'Dhoif',          color: '#9f1239' };
}

// ─── Komponen Utama ────────────────────────────────────────────────────────────

export default function SertifikatMusyrifPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [sertifikatList, setSertifikatList] = useState<SertifikatRecord[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isPDFLoading, setIsPDFLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadData = async () => {
    if (!user) return;
    try {
      // Get musyrif profile for kelas_id
      const profileRes = await fetch(`/api/musyrif/${user.id}`);
      const profileData = await profileRes.json();
      const musyrifKelasId = profileData.data?.kelas_id;

      // Get santri in this class
      const santriRes = await fetch('/api/santri');
      const santriData = await santriRes.json();
      const kelasSantriIds: string[] = musyrifKelasId
        ? (santriData.data || []).filter((s: any) => s.kelas_id === musyrifKelasId).map((s: any) => s.id)
        : [];

      // Get sertifikat
      const res = await fetch('/api/sertifikat');
      const data = await res.json();
      if (data.data) {
        const filtered = data.data.filter((r: any) =>
          kelasSantriIds.includes(r.santuario_id)
        );
        const mapped = filtered.map((r: any) => ({
          id: r.id,
          nomorSertifikat: r.nomor_sertifikat || r.no_sertifikat || '',
          nis: r.nis || '',
          santriName: r.santri_name || '',
          kelasNama: r.kelas_nama || '',
          namaSurat: r.nama_surat || '',
          juzKe: r.juz_ke || String(r.juz || ''),
          statusKelulusan: r.status_kelulusan || (r.status === 'TERBIT' ? 'Lulus' : 'Proses'),
          nilaiTajwid: r.nilai_tajwid ?? 0,
          nilaiMakhraj: r.nilai_makhraj ?? 0,
          nilaiKelancaran: r.nilai_kelancaran ?? 0,
          nilaiRata: r.nilai_rata ?? 0,
          paragrafTeks: r.paragraf_teks || '',
          namaSekolah: r.nama_sekolah || '',
          alamatSekolah: r.alamat_sekolah || '',
          akreditasi: r.akreditasi || 'A',
          kotaPenandatangan: r.kota_penandatangan || 'Palembang',
          tanggalTerbit: r.tgl_cetak || '',
          namaPenanggungJawab: r.nama_penanggung_jawab || '',
          jabatan: r.jabatan || 'Kepala Pondok',
          catatan: r.catatan,
          isPublished: r.status === 'TERBIT',
          createdAt: r.created_at || '',
        }));
        setSertifikatList(mapped);
      }
    } catch (e) {
      console.error('Gagal fetch sertifikat:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ── Download / Preview PDF ────────────────────────────────────────────────
  const handlePDF = async (rec: SertifikatRecord, action: 'download' | 'preview') => {
    setIsPDFLoading(rec.id);
    showNotification(action === 'download' ? 'Memproses PDF, harap tunggu...'
                                           : 'Membuka pratinjau PDF...');
    try {
      const [{ pdf }, { SertifikatPDF }, Reacts] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/SertifikatTemplate'),
        import('react'),
      ]);

      // Build PDF data from record + settings (cast to any for dynamic data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = {
        nomorSertifikat: rec.nomorSertifikat,
        namaSekolah: settings.appName,
        logoUrl: settings.logoUrl || undefined,
        nis: rec.nis,
        kelasNama: 'Kelas Default',
        namaSurat: rec.namaSurat,
        juzKe: rec.juzKe,
        statusKelulusan: rec.statusKelulusan,
        paragrafTeks: rec.paragrafTeks || 'Sertifikat hafalan Al-Quran.',
        alamatSekolah: rec.alamatSekolah || 'Alamat Pondok',
        akreditasi: rec.akreditasi || 'A',
        nilaiTajwid: rec.nilaiTajwid || 85,
        nilaiMakhraj: rec.nilaiMakhraj || 85,
        nilaiKelancaran: rec.nilaiKelancaran || 85,
        nilaiRata: rec.nilaiRata || 85,
        kotaPenandatangan: rec.kotaPenandatangan || 'Palembang',
        tanggalTerbit: rec.tanggalTerbit || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        namaPenanggungJawab: rec.namaPenanggungJawab || 'Ustadz',
        jabatan: rec.jabatan || 'Kepala Pondok',
        catatan: rec.catatan,
      } as any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = Reacts.default.createElement(SertifikatPDF, { data }) as any;
      const blob = await pdf(element).toBlob();
      const url  = URL.createObjectURL(blob);

      if (action === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sertifikat-${rec.namaSurat}-Juz${rec.juzKe}-${rec.nomorSertifikat}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showNotification('✅ PDF berhasil diunduh!');
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error(err);
      showNotification('❌ Gagal membuat PDF. Pastikan semua data sudah terisi.');
    } finally {
      setIsPDFLoading(null);
    }
  };

  // ── Statistik ─────────────────────────────────────────────────────────────
  const published = sertifikatList.filter(r => r.isPublished);
  const drafts    = sertifikatList.filter(r => !r.isPublished);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">

      {/* ── Header ── */}
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
              <span className="text-base font-black text-tosca-950 block tracking-tight">Sertifikat Hafalan</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">
                  {settings.appName} • TA {settings.tahunAjaran}
                </span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center font-bold text-sm">
            SM
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ── Toast Notification ── */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 max-w-sm text-center">
            <CheckCircle2 className="text-teal-400 shrink-0" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* ── Info Banner ── */}
        <div className="bg-gradient-to-r from-tosca-50 to-teal-50 rounded-2xl border border-tosca-100 p-4 flex items-start gap-3">
          <Award className="text-tosca-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-tosca-800">Pengelolaan Sertifikat Hafalan</p>
            <p className="text-xs text-tosca-600 mt-0.5">
              Halaman ini menampilkan sertifikat yang telah diterbitkan oleh Admin.
              Santri dapat mengunduh sertifikat melalui aplikasi mereka masing-masing.
            </p>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Total',
              val: sertifikatList.length,
              unit: 'Sertifikat',
              bg: 'bg-tosca-100', color: 'text-tosca-600',
              icon: FileText,
            },
            {
              label: 'Terbit',
              val: published.length,
              unit: 'Diterbitkan',
              bg: 'bg-emerald-100', color: 'text-emerald-600',
              icon: CheckCircle2,
            },
            {
              label: 'Draft',
              val: drafts.length,
              unit: 'Belum Terbit',
              bg: 'bg-amber-100', color: 'text-amber-600',
              icon: Clock,
            },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-black text-slate-900">{item.val} <span className="text-[10px] font-bold text-slate-400">{item.unit}</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Loading State ── */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="text-tosca-300 animate-spin" size={36} strokeWidth={1.5} />
            <p className="text-sm text-slate-400 font-bold">Memuat data sertifikat...</p>
          </div>
        ) : sertifikatList.length === 0 ? (

          /* ── Empty State ── */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-tosca-50 flex items-center justify-center">
              <Award className="text-tosca-300" size={36} strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-black text-slate-700">Belum Ada Sertifikat</p>
              <p className="text-xs text-slate-400 font-semibold max-w-xs">
                Sertifikat belum tersedia. Admin yang menerbitkan sertifikat untuk para santri.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-tosca-500 font-bold uppercase tracking-wider mt-2">
              <RefreshCw size={12} className="animate-spin-slow" />
              Data akan otomatis diperbarui saat Admin menerbitkan sertifikat
            </div>
          </div>

        ) : (

          /* ── Daftar Sertifikat ── */
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {sertifikatList.length} Sertifikat
            </p>

            {sertifikatList.map(srt => {
              const status    = srt.statusKelulusan;
              const cfg       = statusConfig[status] || statusConfig['Proses'];
              const StatusIcon = cfg.icon;
              const predikat  = getPredikat(srt.nilaiRata || 0);

              return (
                <div
                  key={srt.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    srt.isPublished ? 'border-emerald-100' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-4 flex items-center justify-between ${
                    srt.isPublished
                      ? 'bg-gradient-to-r from-emerald-800 to-teal-700'
                      : 'bg-gradient-to-r from-slate-600 to-slate-500'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Award size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
                            No. {srt.nomorSertifikat}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            srt.isPublished
                              ? 'bg-emerald-400/30 text-emerald-200 border border-emerald-300/30'
                              : 'bg-white/20 text-white/70 border border-white/20'
                          }`}>
                            {srt.isPublished ? '✅ Terbit' : '💾 Draft'}
                          </span>
                        </div>
                        <p className="text-xs font-black text-white mt-0.5 flex items-center gap-1.5">
                          <BookMarked size={12} className="text-amber-400" />
                          {srt.namaSurat} — Juz {srt.juzKe}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase ${cfg.badge}`}>
                      <StatusIcon size={10} />
                      {status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    {/* Info Ringkasan */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Tajwid',     val: srt.nilaiTajwid || 0 },
                        { label: 'Makhraj',    val: srt.nilaiMakhraj || 0 },
                        { label: 'Kelancaran', val: srt.nilaiKelancaran || 0 },
                        { label: 'Rata-rata',  val: srt.nilaiRata || 0, highlight: true },
                      ].map(item => (
                        <div
                          key={item.label}
                          className={`rounded-xl p-2.5 text-center border ${
                            item.highlight
                              ? 'bg-tosca-50 border-tosca-200'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <p className={`text-[8px] font-bold uppercase ${item.highlight ? 'text-tosca-400' : 'text-slate-400'}`}>
                            {item.label}
                          </p>
                          <p className={`text-base font-black mt-0.5 ${item.highlight ? 'text-tosca-700' : 'text-slate-800'}`}>
                            {item.val}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Detail Tambahan */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>Predikat: <span className="font-black text-slate-700">{predikat.label}</span></span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-tosca-400">{srt.kotaPenandatangan || 'Palembang'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span>{srt.tanggalTerbit || '-'}</span>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Preview PDF */}
                      <button
                        onClick={() => handlePDF(srt, 'preview')}
                        disabled={isPDFLoading === srt.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all disabled:opacity-50"
                      >
                        {isPDFLoading === srt.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Eye size={12} />
                        )}
                        Preview
                      </button>

                      {/* Unduh PDF */}
                      <button
                        onClick={() => handlePDF(srt, 'download')}
                        disabled={isPDFLoading === srt.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-tosca-600 hover:bg-tosca-700 active:scale-[.98] text-white rounded-xl text-[10px] font-black uppercase tracking-wide transition-all shadow-sm shadow-tosca-200 disabled:opacity-50"
                      >
                        {isPDFLoading === srt.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Download size={12} />
                        )}
                        Unduh PDF
                      </button>

                      {/* TTD Info */}
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[8px] text-slate-400 font-bold uppercase">TTD</span>
                        <span className="text-[10px] font-black text-slate-600">{srt.namaPenanggungJawab || 'Ustadz'}</span>
                        <span className="text-[8px] text-slate-400">{srt.jabatan || 'Kepala Pondok'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Bottom Nav ── */}
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
        <Link href="/dashboard/musyrif/sertifikat" className="flex flex-col items-center justify-center gap-1 flex-1 text-fuchsia-600">
          <Award size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Sertifikat</span>
        </Link>
        <Link href="/dashboard/musyrif/profil" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <User size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}