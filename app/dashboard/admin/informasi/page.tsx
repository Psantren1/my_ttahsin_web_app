'use client';

import React, { useState } from 'react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useInformasiList, useCreateInformasi } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import {
  Megaphone, Plus, Search, Filter, X, CheckCircle2,
  AlertCircle, Edit3, Trash2, Send, Clock, Users, UserCheck
} from 'lucide-react';

interface InformasiRecord {
  id: string;
  judul: string;
  isi: string;
  target_role: 'MUSYRIF' | 'SANTRI' | 'ALL';
  created_by: string;
  created_by_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ROLE_LABEL: Record<string, string> = {
  MUSYRIF: 'Guru',
  SANTRI: 'Siswa',
  ALL: 'Semua (Guru & Siswa)',
};

const ROLE_COLOR: Record<string, string> = {
  MUSYRIF: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  SANTRI: 'bg-tosca-50 text-tosca-700 border-tosca-100',
  ALL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function ManajemenInformasi() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InformasiRecord | null>(null);
  const [formJudul, setFormJudul] = useState('');
  const [formIsi, setFormIsi] = useState('');
  const [formTargetRole, setFormTargetRole] = useState<'MUSYRIF' | 'SANTRI' | 'ALL'>('ALL');
  const [notif, setNotif] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState('');

  const qc = useQueryClient();
  const createInformasi = useCreateInformasi();

  const { data: informasiData } = useInformasiList(filterRole || undefined);
  const informasiList: InformasiRecord[] = informasiData?.data || [];

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3500);
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormJudul('');
    setFormIsi('');
    setFormTargetRole('ALL');
    setIsModalOpen(true);
  };

  const openEdit = (item: InformasiRecord) => {
    setEditingItem(item);
    setFormJudul(item.judul);
    setFormIsi(item.isi);
    setFormTargetRole(item.target_role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formIsi.trim()) return;
    if (!user) {
      showNotif('Silakan login terlebih dahulu.');
      return;
    }

    try {
      if (editingItem) {
        const res = await fetch(`/api/informasi/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            judul: formJudul.trim(),
            isi: formIsi.trim(),
            target_role: formTargetRole,
          }),
        });
        if (!res.ok) throw new Error('Gagal update');
        showNotif('Informasi berhasil diperbarui.');
        qc.invalidateQueries({ queryKey: ['informasi'] } as any);
      } else {
        await createInformasi.mutateAsync({
          judul: formJudul.trim(),
          isi: formIsi.trim(),
          target_role: formTargetRole,
          created_by: user.id,
        });
        showNotif('Informasi berhasil dikirim.');
      }
      setIsModalOpen(false);
    } catch (e) {
      showNotif('Gagal menyimpan informasi.');
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus informasi ini?')) return;
    try {
      const res = await fetch(`/api/informasi/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal hapus');
      showNotif('Informasi berhasil dihapus.');
      qc.invalidateQueries({ queryKey: ['informasi'] } as any);
    } catch (e) {
      showNotif('Gagal menghapus informasi.');
      console.error(e);
    }
  };

  const filtered = informasiList.filter(i =>
    i.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.isi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Toast */}
          {notif && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 max-w-sm">
              <CheckCircle2 className="text-surface-400 shrink-0" size={18} />
              <span className="text-xs font-bold">{notif}</span>
            </div>
          )}

          {/* Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900 flex items-center gap-3">
                <Megaphone className="text-amber-500" size={32} />
                Informasi & Pengumuman
              </h1>
              <p className="text-tosca-600 font-medium text-sm">
                Kirim informasi dan pengumuman ke akun Guru dan Siswa.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-tosca-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-tosca-100 hover:bg-tosca-700 transition-all active:scale-95"
            >
              <Plus size={20} />
              Informasi Baru
            </button>
          </div>

          {/* Filter & Search */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-tosca-500 cursor-pointer"
                  >
                    <option value="">Semua Target</option>
                    <option value="MUSYRIF">Guru</option>
                    <option value="SANTRI">Siswa</option>
                    <option value="ALL">Semua</option>
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari judul atau isi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-tosca-200 rounded-2xl text-xs font-bold text-black placeholder:text-surface-400 focus:ring-2 focus:ring-tosca-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Daftar Informasi */}
            <div className="divide-y divide-tosca-50">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold">
                  <Megaphone className="mx-auto text-tosca-200 mb-3" size={40} strokeWidth={1.5} />
                  {searchQuery || filterRole ? 'Tidak ada informasi sesuai filter.' : 'Belum ada informasi.'}
                </div>
              ) : filtered.map(item => (
                <div key={item.id} className="p-5 hover:bg-tosca-50/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{item.judul}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase ${ROLE_COLOR[item.target_role] || 'bg-slate-50 text-slate-500'}`}>
                          {ROLE_LABEL[item.target_role] || item.target_role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold line-clamp-2 mb-2">{item.isi}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Send size={10} />
                          {item.created_by_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="h-9 w-9 rounded-xl bg-tosca-50 text-tosca-600 hover:bg-tosca-100 flex items-center justify-center transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-700 flex items-center justify-center">
                  {editingItem ? <Edit3 size={20} /> : <Megaphone size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-tosca-900">
                    {editingItem ? 'Edit Informasi' : 'Informasi Baru'}
                  </h2>
                    <p className="text-xs text-tosca-500 font-semibold">
                      {editingItem ? 'Perbarui informasi yang sudah dikirim.' : 'Buat informasi untuk Guru dan/atau Siswa.'}
                    </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-tosca-600">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700">Judul Informasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Libur Semester Ganjil"
                  value={formJudul}
                  onChange={e => setFormJudul(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-tosca-100 text-sm text-[#0B7D72] font-bold placeholder:text-tosca-300 focus:outline-none focus:ring-2 focus:ring-tosca-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700">Isi Informasi</label>
                <textarea
                  placeholder="Tulis informasi atau pengumuman di sini..."
                  value={formIsi}
                  onChange={e => setFormIsi(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-tosca-100 text-sm text-[#0B7D72] font-bold placeholder:text-tosca-300 focus:outline-none focus:ring-2 focus:ring-tosca-500 resize-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700">Target Penerima</label>
                <select
                  value={formTargetRole}
                  onChange={e => setFormTargetRole(e.target.value as 'MUSYRIF' | 'SANTRI' | 'ALL')}
                  className="w-full px-4 py-3 rounded-xl border border-tosca-100 text-sm text-[#0B7D72] font-bold focus:outline-none focus:ring-2 focus:ring-tosca-500"
                >
                  <option value="ALL">Semua (Guru & Siswa)</option>
                  <option value="MUSYRIF">Guru</option>
                  <option value="SANTRI">Siswa</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-tosca-600 text-white font-bold text-sm hover:bg-tosca-700 transition-all shadow-sm"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Kirim Informasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
