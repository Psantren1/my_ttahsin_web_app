'use client';

import React, { useState } from 'react';

import { useKelasList, useMusyrifList, useCreateKelas, useUpdateKelas, useDeleteKelas } from '@/lib/hooks/useApi';
import { Plus, School, Users as UsersIcon, User as UserIcon, X, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';

export default function ManajemenKelas() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editKelas, setEditKelas] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { settings } = useSettings();
  const [showToast, setShowToast] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formLevel, setFormLevel] = useState('7');
  const [formMusyrif, setFormMusyrif] = useState('');

  const { data: kelasData } = useKelasList();
  const { data: musyrifData } = useMusyrifList();

  const kelasList = kelasData?.data || [];
  const musyrifList = musyrifData?.data || [];

  const createKelas = useCreateKelas();
  const updateKelas = useUpdateKelas();
  const deleteKelas = useDeleteKelas();

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createKelas.mutateAsync({ nama: formNama, level: parseInt(formLevel), musyrif_id: formMusyrif || null });
      setIsCreateModalOpen(false);
      resetForm();
      triggerToast('Kelas Berhasil Dibuka!');
    } catch (err) {
      console.error('Failed to create kelas', err);
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKelas) return;
    try {
      await updateKelas.mutateAsync({
        id: editKelas.id,
        nama: formNama,
        level: parseInt(formLevel),
        musyrif_id: formMusyrif || null,
      });
      setEditKelas(null);
      resetForm();
      triggerToast('Kelas Berhasil Diupdate!');
    } catch (err) {
      console.error('Failed to update kelas', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteKelas.mutateAsync(deleteId);
      setDeleteId(null);
      triggerToast('Kelas Berhasil Dihapus!');
    } catch (err) {
      console.error('Failed to delete kelas', err);
    }
  };

  const openEditModal = (kelas: any) => {
    setEditKelas(kelas);
    setFormNama(kelas.nama);
    setFormLevel(String(kelas.level));
    setFormMusyrif(kelas.musyrif?.[0]?.id || '');
  };

  const resetForm = () => {
    setFormNama('');
    setFormLevel('7');
    setFormMusyrif('');
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setEditKelas(null);
    setDeleteId(null);
    resetForm();
  };

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900">Manajemen Kelas</h1>
            <p className="text-tosca-600 font-medium">Kelola daftar kelas dan pembagian santri Baitul Huffaz.</p>
          </div>
          <div className="flex items-center gap-4">
            {showToast && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">{showToast}</span>
              </div>
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-tosca-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-tosca-200 hover:bg-tosca-700 transition-all active:scale-95"
            >
              <Plus size={20} />
              Buka Kelas Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelasList.map((kelas: any) => (
            <div key={kelas.id} className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden group hover:border-tosca-300 hover:shadow-xl transition-all duration-300">
              <div className="p-6 bg-tosca-600 text-white relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <School size={100} />
                </div>
                <h3 className="text-xl font-bold relative z-10">{kelas.nama}</h3>
                <p className="text-tosca-100 text-sm opacity-80 relative z-10">Level {kelas.level} — Tahun Ajaran {settings.tahunAjaran}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-surface-100">
                  <div className="flex items-center gap-2 text-tosca-600 font-semibold">
                    <UserIcon size={18} />
                    <span className="text-sm">Guru</span>
                  </div>
                  <span className="text-sm font-bold text-tosca-900 text-right">
                    {kelas.musyrif?.length
                      ? kelas.musyrif.map((m: any) => m.full_name).join(', ')
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-tosca-600 font-semibold">
                    <UsersIcon size={18} />
                    <span className="text-sm">Jumlah Siswa</span>
                  </div>
                  <span className="text-sm font-bold text-tosca-900">{kelas.jmlSantri} Orang</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(kelas)}
                    className="flex-1 py-3 rounded-2xl border-2 border-surface-100 text-tosca-600 font-bold hover:bg-tosca-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(kelas.id)}
                    className="py-3 px-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-surface-100 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tosca-600 rounded-xl text-white">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-900">Buka Kelas Baru</h2>
              </div>
              <button onClick={closeAllModals} className="text-surface-400 hover:text-tosca-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCreateClass}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Nama Kelas</label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" placeholder="Contoh: 7B - Tahfizh Dasar" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Level</label>
                <select value={formLevel} onChange={e => setFormLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  {[7, 8, 9, 10, 11, 12].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Guru</label>
                <select value={formMusyrif} onChange={e => setFormMusyrif(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  <option value="">-- Pilih Guru --</option>
                  {musyrifList.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nip} — {m.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Tahun Ajaran</label>
                <input type="text" value={settings.tahunAjaran} className="w-full px-4 py-3 rounded-xl border border-tosca-100 bg-tosca-50/50 text-tosca-500 text-sm text-[#0B7D72] font-medium cursor-not-allowed" disabled readOnly />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeAllModals} className="flex-1 px-4 py-3 border-2 border-surface-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-200">{createKelas.isPending ? 'Menyimpan...' : 'Buka Kelas'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editKelas && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-surface-100 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tosca-600 rounded-xl text-white">
                  <Pencil size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-900">Edit Kelas</h2>
              </div>
              <button onClick={closeAllModals} className="text-surface-400 hover:text-tosca-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleEditClass}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Nama Kelas</label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Level</label>
                <select value={formLevel} onChange={e => setFormLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  {[7, 8, 9, 10, 11, 12].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Guru</label>
                <select value={formMusyrif} onChange={e => setFormMusyrif(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  <option value="">-- Pilih Guru --</option>
                  {musyrifList.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nip} — {m.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeAllModals} className="flex-1 px-4 py-3 border-2 border-surface-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-200">{updateKelas.isPending ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center">
            <div className="p-3 bg-red-100 rounded-2xl w-fit mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-tosca-900 mb-2">Hapus Kelas?</h2>
            <p className="text-surface-500 mb-6">Kelas yang dihapus tidak bisa dikembalikan. Santri dan guru di kelas ini akan otomatis terlepas.</p>
            <div className="flex gap-4">
              <button onClick={closeAllModals} className="flex-1 px-4 py-3 border-2 border-surface-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">{deleteKelas.isPending ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
