'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award, ArrowLeft, Download, CheckCircle2,
  Home, Star, Video, User, AlertCircle,
  FileText, Clock, BookMarked, RefreshCw
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface SertifikatRecord {
  id: string;
  nomorSertifikat: string;
  santriId: string;
  nis: string;
  santriName: string;
  kelasNama: string;
  namaSurat: string;
  juzKe: string;
  statusKelulusan: string;
  paragrafTeks: string;
  namaSekolah: string;
  alamatSekolah: string;
  akreditasi: string;
  nilaiTajwid: number;
  nilaiMakhraj: number;
  nilaiKelancaran: number;
  nilaiRata: number;
  kotaPenandatangan: string;
  tanggalTerbit: string;
  namaPenanggungJawab: string;
  jabatan: string;
  isPublished: boolean;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  nis: string;
  nama_lengkap: string;
  kelas_nama: string;
  role: string;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function SertifikatSantriPage() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [sertifikatList, setSertifikatList] = useState<SertifikatRecord[]>([]);
  const [isPDFLoading, setIsPDFLoading] = useState<string | null>(null);
  const [notif, setNotif]               = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3500);
  };

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadData = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/sertifikat?santuario_id=${user.id}`);
      const data = await res.json();
      const mapped = (data.data || []).map((r: any) => ({
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
      setSertifikatList(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ── Filter: hanya milik santri ini & sudah published ──────────────────────
  const mySertifikat = sertifikatList.filter(s => s.isPublished === true);

  // ── Unduh PDF ─────────────────────────────────────────────────────────────
  const handleDownload = async (rec: SertifikatRecord) => {
    setIsPDFLoading(rec.id);
    showNotif('Memproses PDF, harap tunggu...');
    try {
      const [{ pdf }, { SertifikatPDF }, Reacts] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/SertifikatTemplate'),
        import('react'),
      ]);

      const data = {
        ...rec,
        logoUrl: settings.logoUrl || undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = Reacts.default.createElement(SertifikatPDF, { data }) as any;
      const blob = await pdf(element).toBlob();
      const url  = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Sertifikat-${rec.santriName}-${rec.nomorSertifikat}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showNotif(`✅ Sertifikat berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      showNotif('❌ Gagal membuat PDF. Coba lagi.');
    } finally {
      setIsPDFLoading(null);
    }
  };

  // ── Warna status ──────────────────────────────────────────────────────────
  const statusStyle = (s: string) => {
    if (s === 'Lulus')       return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'Proses')      return 'bg-amber-50 text-amber-700 border-amber-200';
    return                          'bg-rose-50 text-rose-700 border-rose-200';
  };
  const statusIcon = (s: string) => {
    if (s === 'Lulus')  return <CheckCircle2 size={13} className="text-emerald-600" />;
    if (s === 'Proses') return <Clock        size={13} className="text-amber-600" />;
    return                     <AlertCircle  size={13} className="text-rose-600" />;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tosca-50/30 flex flex-col pb-24 lg:pb-8">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/santri"
              className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-900 block">Sertifikat Saya</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">
                  {settings.appName} • {user?.fullName || 'Santri'}
                </span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">
            {user ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'S'}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── Toast ── */}
        {notif && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 max-w-sm">
            <CheckCircle2 className="text-teal-400 shrink-0" size={18} />
            <span className="text-xs font-extrabold">{notif}</span>
          </div>
        )}

        {/* ── Info Banner ── */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-start gap-3">
          <Award className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-amber-800">Sertifikat Hafalan Al-Quran</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Sertifikat akan muncul di sini setelah diterbitkan oleh Admin.
              Hubungi Musyrif Anda untuk informasi lebih lanjut.
            </p>
          </div>
        </div>

        {/* ── Konten ── */}
        {mySertifikat.length === 0 ? (

          /* ── Kosong ── */
          <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-tosca-50 flex items-center justify-center">
              <FileText className="text-tosca-300" size={36} strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-black text-slate-700">Belum Ada Sertifikat</p>
              <p className="text-xs text-slate-400 font-semibold max-w-xs">
                Sertifikat Anda belum diterbitkan. Selesaikan setoran hafalan dan hubungi Musyrif untuk proses kelulusan.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-tosca-500 font-bold uppercase tracking-wider mt-2">
              <RefreshCw size={12} className="animate-spin-slow" />
              Akan otomatis diperbarui saat diterbitkan
            </div>
          </div>

        ) : (

          /* ── Daftar Sertifikat ── */
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              {mySertifikat.length} Sertifikat Diterbitkan
            </p>

            {mySertifikat.map(srt => (
              <div
                key={srt.id}
                className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden hover:shadow-md hover:border-tosca-200 transition-all"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-tosca-900 to-teal-800 p-5 relative overflow-hidden">
                  {/* Ornamen */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                    <Award size={80} />
                  </div>

                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-teal-300">
                          Sertifikat Resmi
                        </span>
                      </div>
                      <p className="text-base font-black text-white">{srt.santriName}</p>
                      <p className="text-[10px] text-teal-300 font-semibold">No. {srt.nomorSertifikat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-teal-300 font-bold uppercase">Diterbitkan</p>
                      <p className="text-[10px] text-white font-black mt-0.5">{srt.tanggalTerbit}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">

                  {/* Info Hafalan */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-tosca-50/50 rounded-xl p-3 border border-tosca-100">
                      <p className="text-[9px] text-tosca-400 font-bold uppercase mb-1">Nama Surat</p>
                      <div className="flex items-center gap-1">
                        <BookMarked size={11} className="text-tosca-500 shrink-0" />
                        <p className="text-xs font-black text-tosca-900 truncate">{srt.namaSurat}</p>
                      </div>
                    </div>
                    <div className="bg-tosca-50/50 rounded-xl p-3 border border-tosca-100">
                      <p className="text-[9px] text-tosca-400 font-bold uppercase mb-1">Juz ke-</p>
                      <p className="text-xs font-black text-tosca-900">{srt.juzKe}</p>
                    </div>
                    <div className={`rounded-xl p-3 border ${statusStyle(srt.statusKelulusan)}`}>
                      <p className="text-[9px] font-bold uppercase mb-1 opacity-60">Status</p>
                      <div className="flex items-center gap-1">
                        {statusIcon(srt.statusKelulusan)}
                        <p className="text-[10px] font-black truncate">{srt.statusKelulusan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Nilai */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                      Ringkasan Nilai
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Tajwid',     val: srt.nilaiTajwid },
                        { label: 'Makhraj',    val: srt.nilaiMakhraj },
                        { label: 'Kelancaran', val: srt.nilaiKelancaran },
                        { label: 'Rata-rata',  val: srt.nilaiRata, highlight: true },
                      ].map(item => (
                        <div
                          key={item.label}
                          className={`rounded-xl p-2.5 text-center border ${item.highlight
                            ? 'bg-tosca-600 border-tosca-600'
                            : 'bg-white border-slate-200'
                          }`}
                        >
                          <p className={`text-[8px] font-bold uppercase ${item.highlight ? 'text-teal-200' : 'text-slate-400'}`}>
                            {item.label}
                          </p>
                          <p className={`text-lg font-black mt-0.5 ${item.highlight ? 'text-white' : 'text-slate-800'}`}>
                            {item.val}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Penandatangan */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-tosca-400" />
                      <span className="font-semibold">{srt.namaPenanggungJawab}</span>
                      <span className="text-slate-200">·</span>
                      <span>{srt.jabatan}</span>
                    </div>
                    <span className="font-semibold">{srt.kotaPenandatangan}</span>
                  </div>

                  {/* Tombol Unduh */}
                  <button
                    onClick={() => handleDownload(srt)}
                    disabled={isPDFLoading === srt.id}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-tosca-600 hover:bg-tosca-700 active:scale-[.98] disabled:opacity-60 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-tosca-200"
                  >
                    {isPDFLoading === srt.id ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        Memproses PDF...
                      </>
                    ) : (
                      <>
                        <Download size={15} />
                        Unduh Sertifikat PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-tosca-100 px-3 sm:px-4 py-2 flex items-center justify-around shadow-2xl">
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
        <Link href="/dashboard/santri/sertifikat" className="flex flex-col items-center gap-1 flex-1 text-tosca-600">
          <Award size={20} strokeWidth={2.5} />
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