'use client';

import React from 'react';
import { 
  Award, X, Eye, Download, Save, Send, AlertCircle 
} from 'lucide-react';

interface Santri {
  id: string; nis: string; nisn: string;
  nama_lengkap: string; kelas_id: string; kelas_nama: string; is_active: boolean;
}

interface TargetRecord {
  id: string; santriId: string; nis: string; santriName: string;
  kelasNama: string; juzTarget: string; namaSurat: string;
  progres: number; statusLulus: string; catatan?: string; updatedAt: string;
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

interface SertifikatModalProps {
  modalSantri: Santri;
  modalTarget: TargetRecord | null;
  modalNilai: { tajwid: number; makhraj: number; kelancaran: number; rata: number };
  modalExisting: SertifikatRecord | null;
  isPDFLoading: boolean;
  onClose: () => void;
  // Form fields
  fParagraf: string; setFParagraf: (v: string) => void;
  fAlamat: string; setFAlamat: (v: string) => void;
  fAkreditasi: string; setFAkreditasi: (v: string) => void;
  fNamaTTD: string; setFNamaTTD: (v: string) => void;
  fJabatan: string; setFJabatan: (v: string) => void;
  fKota: string; setFKota: (v: string) => void;
  fTanggal: string; setFTanggal: (v: string) => void;
  // Handlers
  handlePDF: (action: 'download' | 'preview') => void;
  handleSimpanDraft: () => void;
  handleTerbitkan: () => void;
  handleCabutTerbit: () => void;
  hasTahsinData: boolean;
}

export default function SertifikatModal({
  modalSantri, modalTarget, modalNilai, modalExisting, isPDFLoading, onClose,
  fParagraf, setFParagraf,
  fAlamat, setFAlamat,
  fAkreditasi, setFAkreditasi,
  fNamaTTD, setFNamaTTD,
  fJabatan, setFJabatan,
  fKota, setFKota,
  fTanggal, setFTanggal,
  handlePDF, handleSimpanDraft, handleTerbitkan, handleCabutTerbit,
  hasTahsinData
}: SertifikatModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">

        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-tosca-900 to-tosca-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-tosca-300 font-bold uppercase tracking-widest mb-0.5">
              {modalExisting ? (modalExisting.isPublished ? '✅ Sudah Terbit' : '💾 Draft') : '✨ Buat Baru'}
            </p>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Sertifikat — {modalSantri.nama_lengkap}
            </h2>
            {modalExisting && (
              <p className="text-[10px] text-tosca-300 mt-0.5">No. {modalExisting.nomorSertifikat}</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* ── Data Otomatis Santri ── */}
          <div className="bg-tosca-50/50 rounded-2xl border border-tosca-100 p-4 space-y-3">
            <p className="text-[10px] font-bold text-tosca-500 uppercase tracking-widest">Data Siswa (Otomatis)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Nama Lengkap', val: modalSantri.nama_lengkap },
                { label: 'NIS', val: modalSantri.nis },
                { label: 'Kelas', val: modalSantri.kelas_nama },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-3 border border-tosca-100">
                  <p className="text-[9px] text-surface-400 font-bold uppercase">{item.label}</p>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Data Target & Nilai ── */}
          <div className="bg-fuchsia-50/40 rounded-2xl border border-fuchsia-100 p-4 space-y-3">
            <p className="text-[10px] font-bold text-fuchsia-600 uppercase tracking-widest">Data Tahsin (dari Target & Setoran)</p>
            {modalTarget ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Nama Surat', val: modalTarget.namaSurat },
                  { label: 'Juz ke-', val: modalTarget.juzTarget },
                  { label: 'Status', val: modalTarget.statusLulus },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl p-3 border border-fuchsia-100">
                    <p className="text-[9px] text-fuchsia-400 font-bold uppercase">{item.label}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">{item.val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="text-amber-500 shrink-0" size={16} />
                  <p className="text-xs text-amber-700 font-semibold">
                    Belum ada data target. Guru perlu mengisi Target Tahsin terlebih dahulu.
                  </p>
              </div>
            )}
            {/* Nilai */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Tajwid',     val: modalNilai.tajwid },
                { label: 'Makhraj',    val: modalNilai.makhraj },
                { label: 'Kelancaran', val: modalNilai.kelancaran },
                { label: 'Rata-rata',  val: modalNilai.rata },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-3 border text-center ${item.label === 'Rata-rata' ? 'bg-tosca-50 border-tosca-200' : 'bg-white border-fuchsia-100'}`}>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{item.label}</p>
                  <p className={`text-lg font-bold mt-1 ${item.label === 'Rata-rata' ? 'text-tosca-700' : 'text-slate-800'}`}>{item.val || '—'}</p>
                </div>
              ))}
            </div>
            {!hasTahsinData && (
              <p className="text-[10px] text-slate-400 font-semibold italic text-center">
                * Nilai 0 karena belum ada data setoran Tahsin untuk siswa ini.
              </p>
            )}
          </div>

          {/* ── Input: Data Sekolah ── */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Kop Sertifikat</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Alamat Sekolah / Pondok</label>
                <input
                  type="text"
                  placeholder="Jl. Contoh No. 1, Kota, Provinsi"
                  value={fAlamat}
                  onChange={e => setFAlamat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-tosca-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Akreditasi</label>
                <select
                  value={fAkreditasi}
                  onChange={e => setFAkreditasi(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-tosca-500"
                >
                  {['A','B','C','Belum Terakreditasi'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Input: Paragraf Teks ── */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Paragraf Teks Sertifikat
            </label>
            <textarea
              rows={4}
              value={fParagraf}
              onChange={e => setFParagraf(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-tosca-500 resize-none leading-relaxed"
            />
          </div>

          {/* ── Input: Data TTD ── */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Penandatanganan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kota Penandatangan</label>
                <input type="text" placeholder="Palembang" value={fKota} onChange={e => setFKota(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-tosca-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tanggal Terbit</label>
                <input type="text" placeholder="03 Juni 2026" value={fTanggal} onChange={e => setFTanggal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-tosca-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Penanggung Jawab</label>
                <input type="text" placeholder="Ust. Ahmad, S.Pd.I" value={fNamaTTD} onChange={e => setFNamaTTD(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-tosca-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Jabatan</label>
                <input type="text" placeholder="Kepala Pondok" value={fJabatan} onChange={e => setFJabatan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-tosca-500" />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer — Tombol Aksi */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {/* Preview */}
          <button
            onClick={() => handlePDF('preview')}
            disabled={isPDFLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <Eye size={14} /> Preview
          </button>

          {/* Unduh PDF */}
          <button
            onClick={() => handlePDF('download')}
            disabled={isPDFLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-tosca-200 text-tosca-700 rounded-xl text-xs font-bold uppercase hover:bg-tosca-50 transition-all disabled:opacity-50"
          >
            <Download size={14} />
            {isPDFLoading ? 'Memproses...' : 'Unduh PDF'}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Simpan Draft */}
          <button
            onClick={handleSimpanDraft}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-all"
          >
            <Save size={14} /> Simpan Draft
          </button>

          {/* Cabut / Terbitkan */}
          {modalExisting?.isPublished ? (
            <button
              onClick={handleCabutTerbit}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              <X size={14} /> Cabut Terbit
            </button>
          ) : (
            <button
              onClick={handleTerbitkan}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md"
            >
              <Send size={14} /> Terbitkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
