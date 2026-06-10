'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/sidebar';
import Navbar from '@/components/ui/navbar';
import { Plus, School, Users as UsersIcon, User as UserIcon, X, CheckCircle2 } from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';

export default function ManajemenKelas() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings } = useSettings();
  const [showToast, setShowToast] = useState(false);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [formNama, setFormNama] = useState('');

  const loadKelas = async () => {
    try {
      const res = await fetch('/api/kelas');
      const json = await res.json();
      if (json.data) setKelasList(json.data);
    } catch (err) {
      console.error('Failed to load kelas', err);
    }
  };

  useEffect(() => {
    loadKelas();
  }, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: formNama }),
      });
      if (!res.ok) throw new Error('Failed to create kelas');
      setIsModalOpen(false);
      setFormNama('');
      triggerToast();
      await loadKelas();
    } catch (err) {
      console.error('Failed to create kelas', err);
    }
  };

  return (
    <div className="min-h-screen bg-tosca-50/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-72 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header Card with White Background */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-tosca-50 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-tosca-900">Manajemen Kelas</h1>
              <p className="text-tosca-600 font-medium">Kelola daftar kelas dan pembagian santri Baitul Huffaz.</p>
            </div>
            <div className="flex items-center gap-4">
              {showToast && (
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold">Kelas Berhasil Dibuka!</span>
                </div>
              )}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-tosca-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-tosca-200 hover:bg-tosca-700 transition-all active:scale-95"
              >
                <Plus size={20} />
                Buka Kelas Baru
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kelasList.map((kelas) => (
              <div key={kelas.id} className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden group hover:border-tosca-300 hover:shadow-xl transition-all duration-300">
                <div className="p-6 bg-tosca-600 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <School size={100} />
                  </div>
                  <h3 className="text-xl font-bold relative z-10">{kelas.nama}</h3>
                  <p className="text-tosca-100 text-sm opacity-80 relative z-10">Tahun Ajaran {settings.tahunAjaran}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-tosca-50">
                    <div className="flex items-center gap-2 text-tosca-600 font-semibold">
                      <UserIcon size={18} />
                      <span className="text-sm">Musyrif/ah</span>
                    </div>
                    <span className="text-sm font-bold text-tosca-900">{kelas.wali}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-tosca-600 font-semibold">
                      <UsersIcon size={18} />
                      <span className="text-sm">Jumlah Santri</span>
                    </div>
                    <span className="text-sm font-bold text-tosca-900">{kelas.jmlSantri} Orang</span>
                  </div>
                  <button 
                    onClick={() => alert(`Membuka Detail ${kelas.nama}`)}
                    className="w-full mt-4 py-3 rounded-2xl border-2 border-tosca-50 text-tosca-600 font-bold hover:bg-tosca-600 hover:text-white hover:border-tosca-600 transition-all duration-300"
                  >
                    Lihat Detail Kelas
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal Buka Kelas Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-tosca-50 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tosca-600 rounded-xl text-white">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-900">Buka Kelas Baru</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-tosca-400 hover:text-tosca-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCreateClass}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Nama Kelas</label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" placeholder="Contoh: 7B - Tahfizh Dasar" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Musyrif/ah</label>
                <select className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  <option>Ust. Mansyur</option>
                  <option>Usth. Siti Khadijah</option>
                  <option>Ust. Zulkifli</option>
                  <option>Usth. Maryam</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Tahun Ajaran</label>
                <input type="text" value={settings.tahunAjaran} className="w-full px-4 py-3 rounded-xl border border-tosca-100 bg-tosca-50/50 text-tosca-500 text-sm text-[#0B7D72] font-medium cursor-not-allowed" disabled readOnly />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border-2 border-tosca-50 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-200">Buka Kelas</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
