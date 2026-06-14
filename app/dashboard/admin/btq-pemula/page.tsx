'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useKelasList, useSantriList, useCreateBtqPemula, useBtqPemulaList } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Search, Filter, CheckCircle2, AlertCircle, Loader2, X, Save
} from 'lucide-react';

export default function ManajemenBtqPemula() {
  const qc = useQueryClient();
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [editingMap, setEditingMap] = useState<Record<string, {
    jilid: string; halaman: string; nilai: string; predikat: string; catatan: string;
  }>>({});

  const { data: kelasData } = useKelasList();
  const { data: santriData } = useSantriList();
  const { data: btqData } = useBtqPemulaList(selectedKelasId ? { kelas_id: selectedKelasId } : undefined);
  const createBtq = useCreateBtqPemula();

  const kelasList = useMemo(() => kelasData?.data || [], [kelasData]);
  const santriList = useMemo(() => santriData?.data || [], [santriData]);
  const btqRecords = useMemo(() => btqData?.data || [], [btqData]);

  const santriInKelas = useMemo(() => {
    if (!selectedKelasId) return [];
    return santriList.filter((s: any) => s.kelas_id === selectedKelasId && s.is_active);
  }, [santriList, selectedKelasId]);

  const mergedList = useMemo(() => {
    return santriInKelas.map((s: any) => {
      const rec = btqRecords.find((r: any) => r.santuario_id === s.id);
      return { santri: s, record: rec || null };
    });
  }, [santriInKelas, btqRecords]);

  const filteredList = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return mergedList.filter((item: any) =>
      (item.santri.nis || '').toLowerCase().includes(q) ||
      (item.santri.full_name || '').toLowerCase().includes(q)
    );
  }, [mergedList, searchTerm]);

  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  const initEdit = (santri: any, record: any) => {
    setEditingMap(prev => ({
      ...prev,
      [santri.id]: {
        jilid: record?.jilid || '',
        halaman: record?.halaman?.toString() || '',
        nilai: record?.nilai?.toString() || '',
        predikat: record?.predikat || '',
        catatan: record?.catatan || '',
      },
    }));
  };

  const handleEdit = (santriId: string, field: string, value: string) => {
    setEditingMap(prev => ({
      ...prev,
      [santriId]: { ...prev[santriId], [field]: value },
    }));
  };

  const handleSave = async (santriId: string) => {
    const data = editingMap[santriId];
    if (!data) return;
    try {
      await createBtq.mutateAsync({
        santuario_id: santriId,
        jilid: data.jilid,
        halaman: parseInt(data.halaman) || 0,
        nilai: parseInt(data.nilai) || 0,
        predikat: data.predikat,
        catatan: data.catatan || null,
      });
      triggerToast('Data BTQ Pemula berhasil disimpan!');
      qc.invalidateQueries({ queryKey: ['btq-pemula'] });
    } catch {
      triggerToast('Gagal menyimpan data.');
    }
  };

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {showToast && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={18} />
              <span className="text-sm font-bold">{toastMsg}</span>
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-tosca-100 rounded-2xl text-tosca-600 shadow-md shadow-tosca-50">
                <BookOpen size={28} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900 leading-tight">Manajemen BTQ Pemula</h1>
                <p className="text-tosca-600 font-medium">Kelola data Baca Tulis Quran Pemula siswa Manajemen Al-Quran.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-tosca-500 shrink-0" size={18} />
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-tosca-50/50 border border-tosca-100 rounded-xl text-sm font-bold text-tosca-900 focus:ring-2 focus:ring-tosca-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k: any) => (
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
                placeholder="Cari NIS atau Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-tosca-50/50 border border-tosca-100 rounded-xl text-sm focus:ring-2 focus:ring-tosca-500 w-full font-semibold text-black"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-tosca-50/40 border-b border-tosca-100">
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">No</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">NIS</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Nama</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Level</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Kelas</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Jilid</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Halaman</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Nilai</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest">Predikat</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-tosca-700 uppercase tracking-widest text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tosca-50">
                  {!selectedKelasId ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                        <BookOpen size={40} className="mx-auto text-tosca-200 mb-3 stroke-[1.5]" />
                        <p className="text-sm">Pilih kelas terlebih dahulu untuk melihat data BTQ Pemula.</p>
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                        <AlertCircle size={32} className="mx-auto text-tosca-300 mb-3 stroke-[1.5]" />
                        <p className="text-sm">Tidak ada siswa di kelas ini.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item: any, index: number) => {
                      const s = item.santri;
                      const r = item.record;
                      const isEditing = !!editingMap[s.id];
                      const editVal = editingMap[s.id];

                      return (
                        <tr key={s.id} className="hover:bg-tosca-50/20 transition-colors group">
                          <td className="px-4 py-3 text-xs text-center font-bold text-surface-400">{index + 1}</td>
                          <td className="px-4 py-3 text-xs font-bold text-tosca-700">{s.nis}</td>
                          <td className="px-4 py-3 text-sm font-bold text-tosca-900">{s.full_name}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className="px-2.5 py-1 bg-tosca-50 text-tosca-700 border border-tosca-100 rounded-md font-bold text-[10px] uppercase">
                              Level {s.kelas_level}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-tosca-600">{s.kelas_nama}</td>

                          {isEditing ? (
                            <>
                              <td className="px-2 py-3">
                                <input value={editVal.jilid} onChange={(e) => handleEdit(s.id, 'jilid', e.target.value)}
                                  className="w-16 px-2 py-1.5 border border-tosca-200 rounded-lg text-xs font-semibold text-center focus:ring-2 focus:ring-tosca-500" placeholder="1" />
                              </td>
                              <td className="px-2 py-3">
                                <input value={editVal.halaman} onChange={(e) => handleEdit(s.id, 'halaman', e.target.value)}
                                  className="w-16 px-2 py-1.5 border border-tosca-200 rounded-lg text-xs font-semibold text-center focus:ring-2 focus:ring-tosca-500" placeholder="1" />
                              </td>
                              <td className="px-2 py-3">
                                <input value={editVal.nilai} onChange={(e) => handleEdit(s.id, 'nilai', e.target.value)}
                                  className="w-16 px-2 py-1.5 border border-tosca-200 rounded-lg text-xs font-semibold text-center focus:ring-2 focus:ring-tosca-500" placeholder="100" />
                              </td>
                              <td className="px-2 py-3">
                                <select value={editVal.predikat} onChange={(e) => handleEdit(s.id, 'predikat', e.target.value)}
                                  className="w-20 px-1 py-1.5 border border-tosca-200 rounded-lg text-[10px] font-bold text-center focus:ring-2 focus:ring-tosca-500 bg-white">
                                  <option value="">--</option>
                                  <option value="Mumtaz">Mumtaz</option>
                                  <option value="Jayyid Jiddan">Jayyid Jiddan</option>
                                  <option value="Jayyid">Jayyid</option>
                                  <option value="Maqbul">Maqbul</option>
                                  <option value="Rasib">Rasib</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center gap-1 justify-center">
                                  <button onClick={() => handleSave(s.id)}
                                    className="h-8 w-8 rounded-lg bg-tosca-600 text-white flex items-center justify-center hover:bg-tosca-700 transition-all"
                                    title="Simpan"><Save size={14} /></button>
                                  <button onClick={() => {
                                    const newMap = { ...editingMap };
                                    delete newMap[s.id];
                                    setEditingMap(newMap);
                                  }}
                                    className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"
                                    title="Batal"><X size={14} /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-sm font-bold text-slate-800">{r?.jilid || <span className="text-slate-300">-</span>}</td>
                              <td className="px-4 py-3 text-sm font-bold text-slate-800">{r?.halaman ?? <span className="text-slate-300">-</span>}</td>
                              <td className="px-4 py-3 text-sm font-bold text-slate-800">{r?.nilai ?? <span className="text-slate-300">-</span>}</td>
                              <td className="px-4 py-3">
                                {r?.predikat ? (
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block ${
                                    r.predikat === 'Mumtaz' ? 'bg-green-100 text-green-700 border border-green-200' :
                                    r.predikat === 'Jayyid Jiddan' ? 'bg-tosca-100 text-tosca-700 border border-tosca-200' :
                                    r.predikat === 'Jayyid' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                    r.predikat === 'Maqbul' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    'bg-red-100 text-red-700 border border-red-200'
                                  }`}>{r.predikat}</span>
                                ) : <span className="text-slate-300">-</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => { initEdit(s, r); }}
                                  className="px-3 py-1.5 bg-tosca-50 text-tosca-700 rounded-lg text-xs font-bold hover:bg-tosca-100 transition-all border border-tosca-100">
                                  {r ? 'Edit' : 'Input'}
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {selectedKelasId && filteredList.length > 0 && (
              <div className="px-6 py-4 bg-tosca-50/20 border-t border-surface-100 flex items-center justify-between text-xs text-tosca-500 font-bold uppercase tracking-wider">
                <p>Menampilkan {filteredList.length} dari {mergedList.length} siswa</p>
              </div>
            )}
          </div>
        </main>
    </>
  );
}
