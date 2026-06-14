'use client';

import React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { AdminCard } from '@/components/ui/admin-card';

interface QuickAddModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  quickType: string;
  setQuickType: (val: string) => void;
  quickName: string;
  setQuickName: (val: string) => void;
  quickEmail: string;
  setQuickEmail: (val: string) => void;
  quickKeterangan: string;
  setQuickKeterangan: (val: string) => void;
  isSubmitting: boolean;
}

export default function QuickAddModal({
  onClose,
  onSubmit,
  quickType,
  setQuickType,
  quickName,
  setQuickName,
  quickEmail,
  setQuickEmail,
  quickKeterangan,
  setQuickKeterangan,
  isSubmitting
}: QuickAddModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AdminCard padding="none" className="w-full max-w-lg shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-tosca-900 flex items-center gap-2">
            <Plus size={22} className="text-tosca-600" /> Tambah Data Cepat
          </h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600"><X size={22} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-surface-700 ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={quickName} 
              onChange={e => setQuickName(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000 transition-all" 
              placeholder="Nama Siswa / Guru / Kelas" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-surface-700 ml-1">Tipe Data</label>
              <select 
                value={quickType} 
                onChange={e => setQuickType(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000"
              >
                <option>Siswa</option>
                <option>Guru</option>
                <option>Kelas</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-surface-700 ml-1">
                {quickType === 'Kelas' ? 'Level (7-12)' : quickType === 'Siswa' ? 'NIS' : 'NIP'}
              </label>
              <input 
                type="text" 
                value={quickKeterangan} 
                onChange={e => setQuickKeterangan(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000 transition-all" 
                placeholder={quickType === 'Kelas' ? '7' : quickType === 'Siswa' ? 'NIS' : 'NIP'} 
              />
            </div>
          </div>
          {quickType !== 'Kelas' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-surface-700 ml-1">Email</label>
              <input 
                type="email" 
                value={quickEmail} 
                onChange={e => setQuickEmail(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000 transition-all" 
                placeholder="email@baitulhuffaz.sch.id" 
              />
              <p className="text-[10px] text-surface-400 ml-1">*Kosongi untuk generate otomatis.</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-tosca-600 text-white rounded-2xl font-semibold shadow-lg hover:bg-tosca-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            Simpan Data
          </button>
        </form>
      </AdminCard>
    </div>
  );
}
