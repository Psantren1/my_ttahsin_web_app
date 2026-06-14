'use client';

import React, { useState } from 'react';
import { ArrowUpDown, CheckCircle2, Info, Users, X } from 'lucide-react';
import { useKelasList, useSantriList, useBulkReassign } from '@/lib/hooks/useApi';
import { useSettings } from '@/lib/hooks/useSettings';

export default function ManajemenNaikKelas() {
  const { settings } = useSettings();
  const [fromKelasId, setFromKelasId] = useState('');
  const [toKelasId, setToKelasId] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState('');

  const { data: kelasData } = useKelasList();
  const { data: santriData } = useSantriList();
  const bulkReassign = useBulkReassign();

  const kelasList = kelasData?.data || [];
  const santriList = santriData?.data || [];

  const filteredSantri = fromKelasId
    ? santriList.filter((s: any) => s.kelas_id === fromKelasId)
    : santriList;

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredSantri.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSantri.map((s: any) => s.id)));
    }
  };

  const handleReassign = async () => {
    if (!toKelasId || selectedIds.size === 0) return;
    try {
      const result = await bulkReassign.mutateAsync({
        santri_ids: Array.from(selectedIds),
        to_kelas_id: toKelasId,
      });
      setShowConfirm(false);
      setSelectedIds(new Set());
      triggerToast(`${result.count} siswa berhasil dipindahkan!`);
    } catch (err) {
      console.error('Bulk reassign failed', err);
    }
  };

  const targetKelas = kelasList.find((k: any) => k.id === toKelasId);

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900">Manajemen Naik Kelas</h1>
            <p className="text-tosca-600 font-medium">Pindahkan siswa secara massal ke kelas lain.</p>
          </div>
          <div className="flex items-center gap-4">
            {showToast && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">{showToast}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Informasi Level Program</p>
            <p>Kenaikan kelas tidak mengubah Level Program siswa. Untuk mengubah Level Program, gunakan menu Manajemen Siswa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-surface-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Kelas Asal</label>
                <select value={fromKelasId} onChange={e => { setFromKelasId(e.target.value); setSelectedIds(new Set()); }} className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  <option value="">-- Semua Kelas --</option>
                  {kelasList.map((k: any) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Kelas Tujuan</label>
                <select value={toKelasId} onChange={e => setToKelasId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {kelasList.map((k: any) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={toggleAll}
                  disabled={!toKelasId || filteredSantri.length === 0}
                  className="w-full px-4 py-3 rounded-xl border-2 border-tosca-200 text-tosca-600 font-bold hover:bg-tosca-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedIds.size === filteredSantri.length ? 'Unselect All' : 'Select All'}
                </button>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-surface-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-tosca-900 flex items-center gap-2">
                <Users size={20} />
                Daftar Siswa
              </h2>
              <span className="text-sm text-tosca-500 font-medium">
                {selectedIds.size} / {filteredSantri.length} dipilih
              </span>
            </div>
            {filteredSantri.length === 0 ? (
              <p className="text-center py-12 text-surface-400 font-medium">Tidak ada siswa ditemukan</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredSantri.map((s: any) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedIds.has(s.id)
                        ? 'border-tosca-500 bg-tosca-50'
                        : 'border-surface-100 hover:border-tosca-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="w-5 h-5 rounded-lg border-tosca-300 text-tosca-600 focus:ring-tosca-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-tosca-900 truncate">{s.full_name}</p>
                      <p className="text-sm text-surface-400">{s.nis} {s.kelas_nama ? `— ${s.kelas_nama}` : ''}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-tosca-900 mb-4">Ringkasan</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-tosca-600 font-semibold">Siswa Dipilih</span>
                <span className="font-bold text-tosca-900">{selectedIds.size}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-tosca-600 font-semibold">Kelas Tujuan</span>
                <span className="font-bold text-tosca-900">{targetKelas?.nama || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-tosca-600 font-semibold">Tahun Ajaran</span>
                <span className="font-bold text-tosca-900">{settings.tahunAjaran}</span>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={selectedIds.size === 0 || !toKelasId}
                className="w-full mt-4 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Pindahkan ke Kelas
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center">
            <div className="p-3 bg-tosca-100 rounded-2xl w-fit mx-auto mb-4">
              <ArrowUpDown size={28} className="text-tosca-600" />
            </div>
            <h2 className="text-xl font-bold text-tosca-900 mb-2">Konfirmasi Pemindahan</h2>
            <p className="text-surface-500 mb-6">
              {selectedIds.size} siswa akan dipindahkan ke <strong>{targetKelas?.nama}</strong>.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-3 border-2 border-surface-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors">Batal</button>
              <button onClick={handleReassign} className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all">
                {bulkReassign.isPending ? 'Memindahkan...' : 'Ya, Pindahkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
