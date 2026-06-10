'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/sidebar';
import Navbar from '@/components/ui/navbar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2,
  ExternalLink,
  User
} from 'lucide-react';

export default function ManajemenJadwal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedDay, setSelectedDay] = useState(16);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [formSesi, setFormSesi] = useState('');
  const [formJamMulai, setFormJamMulai] = useState('');
  const [formJamSelesai, setFormJamSelesai] = useState('');
  const [formLokasi, setFormLokasi] = useState('');

  const loadJadwal = async () => {
    try {
      const res = await fetch('/api/jadwal');
      const json = await res.json();
      if (json.data) setScheduleData(json.data);
    } catch (err) {
      console.error('Failed to load jadwal', err);
    }
  };

  useEffect(() => {
    loadJadwal();
  }, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/jadwal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sesi: formSesi,
          jam_mulai: formJamMulai,
          jam_selesai: formJamSelesai,
          lokasi: formLokasi,
          hari: `2026-05-${String(selectedDay).padStart(2, '0')}`,
          is_active: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to create jadwal');
      setIsModalOpen(false);
      setFormSesi('');
      setFormJamMulai('');
      setFormJamSelesai('');
      setFormLokasi('');
      triggerToast();
      await loadJadwal();
    } catch (err) {
      console.error('Failed to create jadwal', err);
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-tosca-900">Manajemen Jadwal</h1>
              <p className="text-tosca-600 font-medium">Atur jadwal kegiatan halaqah dan akademik Baitul Huffaz.</p>
            </div>
            <div className="flex items-center gap-4">
              {showToast && (
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold">Jadwal Berhasil Dibuat!</span>
                </div>
              )}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-tosca-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-tosca-200 hover:bg-tosca-700 transition-all active:scale-95"
              >
                <Plus size={20} />
                Buat Jadwal Baru
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendar Mini */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-tosca-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-extrabold text-tosca-900">Mei 2026</h3>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-tosca-400 hover:bg-tosca-50 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                    <button className="p-1.5 text-tosca-400 hover:bg-tosca-50 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-tosca-300 mb-4">
                  <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {[...Array(31)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedDay(i + 1)}
                      className={`p-2 rounded-xl text-sm font-bold transition-all ${
                        selectedDay === i + 1 
                        ? 'bg-tosca-600 text-white shadow-lg shadow-tosca-100' 
                        : 'text-tosca-700 hover:bg-tosca-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-tosca-900">Jadwal Hari Ini</h2>
                <span className="text-sm font-bold text-tosca-500 bg-tosca-50 px-3 py-1 rounded-full">Sabtu, {selectedDay} Mei 2026</span>
              </div>
              
              {scheduleData.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-tosca-50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-tosca-200 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-tosca-50 rounded-2xl text-tosca-600 group-hover:bg-tosca-600 group-hover:text-white transition-all duration-300">
                      <Clock size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-extrabold text-tosca-900">{item.title}</h4>
                      <p className="text-sm text-tosca-500 font-bold flex items-center gap-1">
                        <Clock size={14} />
                        {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 sm:gap-12">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-tosca-100 flex items-center justify-center text-tosca-600 font-bold border-2 border-white shadow-sm">
                        {item.instructor.charAt(5)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-tosca-400 font-bold uppercase tracking-wider">Pengajar</span>
                        <span className="text-sm font-bold text-tosca-800">{item.instructor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                        <MapPin size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-tosca-400 font-bold uppercase tracking-wider">Lokasi</span>
                        <span className="text-sm font-bold text-tosca-800">{item.location}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Detail Jadwal: ${item.title}`)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-tosca-50 text-tosca-700 rounded-xl text-sm font-bold hover:bg-tosca-900 hover:text-white transition-all"
                    >
                      <ExternalLink size={16} />
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Buat Jadwal Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-tosca-50 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tosca-600 rounded-xl text-white">
                  <CalendarIcon size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-900">Buat Jadwal Baru</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-tosca-400 hover:text-tosca-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCreateSchedule}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Nama Kegiatan</label>
                <input type="text" value={formSesi} onChange={e => setFormSesi(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" placeholder="Contoh: Tahfizh Sore" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-tosca-700 ml-1">Jam Mulai</label>
                  <input type="time" value={formJamMulai} onChange={e => setFormJamMulai(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-tosca-700 ml-1">Jam Selesai</label>
                  <input type="time" value={formJamSelesai} onChange={e => setFormJamSelesai(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Pengajar (Musyrif/ah)</label>
                <select className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm font-bold text-tosca-900">
                  <option>Ust. Mansyur</option>
                  <option>Usth. Siti Khadijah</option>
                  <option>Ust. Zulkifli</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-tosca-700 ml-1">Lokasi</label>
                <input type="text" value={formLokasi} onChange={e => setFormLokasi(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-medium" placeholder="Nama ruangan atau gedung" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border-2 border-tosca-50 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-200">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
