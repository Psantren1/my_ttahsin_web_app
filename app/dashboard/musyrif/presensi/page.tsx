'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  CheckSquare, 
  CheckCircle2, 
  Home, 
  BookOpen, 
  Star,
  Plus,
  Save,
  Trash2,
  CalendarDays,
  X
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSantriList, useAbsensiList, useCreateAbsensi, apiKeys } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  is_active: boolean;
}

interface PresensiRecord {
  id: string;
  meetingId: string;
  meetingName: string;
  santriId: string;
  santriName: string;
  nis: string;
  kelasNama: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  createdAt: string;
}

export default function PresensiPage() {
  const { settings } = useSettings();
  const { user } = useAuth();

  const { data: santriData } = useSantriList();
  const { data: absensiData } = useAbsensiList();
  const createAbsensi = useCreateAbsensi();
  const queryClient = useQueryClient();
  
  // Interactive UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [currentMeetingName, setCurrentMeetingName] = useState<string>('');
  
  // Local attendance input states
  const [attendanceStates, setAttendanceStates] = useState<{ [santriId: string]: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' }>({});
  
  const [notification, setNotification] = useState<string | null>(null);

  const santriList: Santri[] = (santriData?.data || []).map((s: any) => ({
    id: s.id,
    nis: s.nis || '',
    nisn: s.nisn || '',
    nama_lengkap: s.full_name || '',
    kelas_id: s.kelas_id || '',
    kelas_nama: s.kelas_nama || '',
    is_active: s.is_active,
  }));

  const records: PresensiRecord[] = (absensiData?.data || []).map((r: any) => ({
    id: r.id,
    meetingId: r.tanggal || '',
    meetingName: `Presensi ${new Date(r.tanggal || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    santriId: r.santuario_id,
    santriName: r.santri_name || '',
    nis: r.nis || '',
    kelasNama: r.kelas_nama || '',
    status: r.status === 'HADIR' ? 'Hadir' as const : r.status === 'IZIN' ? 'Izin' as const : r.status === 'SAKIT' ? 'Sakit' as const : 'Alpa' as const,
    createdAt: r.created_at || ''
  }));

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle setting up a new meeting session
  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingName.trim()) return;

    const newId = `meet-${Date.now()}`;
    setCurrentMeetingId(newId);
    setCurrentMeetingName(newMeetingName);
    
    // Initialize all students to 'Hadir' by default
    const initialAttendance: { [id: string]: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' } = {};
    santriList.forEach(s => {
      initialAttendance[s.id] = 'Hadir';
    });
    setAttendanceStates(initialAttendance);
    
    setIsModalOpen(false);
    setNewMeetingName('');
    showNotification(`Sesi "${newMeetingName}" berhasil dibuat! Silakan sesuaikan kehadiran.`);
  };

  // Modify local attendance states
  const setAttendance = (santriId: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa') => {
    setAttendanceStates(prev => ({
      ...prev,
      [santriId]: status
    }));
  };

  // Save the attendance list to API
  const handleSaveAttendance = async () => {
    if (!currentMeetingId) {
      alert('Silakan buat sesi pertemuan baru terlebih dahulu dengan menekan tombol "Tambah Pertemuan".');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const meetingDateString = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    try {
      await Promise.all(santriList.map(s =>
        createAbsensi.mutateAsync({
          santuario_id: s.id,
          tanggal: today,
          status: attendanceStates[s.id] === 'Hadir' ? 'HADIR' : attendanceStates[s.id] === 'Izin' ? 'IZIN' : attendanceStates[s.id] === 'Sakit' ? 'SAKIT' : 'ALPA',
          upsert: true
        })
      ));

      setCurrentMeetingId(null);
      setCurrentMeetingName('');
      setAttendanceStates({});
      
      showNotification(`Berhasil menyimpan presensi untuk "${currentMeetingName}"!`);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan presensi');
    }
  };

  // Delete a specific meeting session from history
  const handleDeleteMeeting = async (meetingId: string, meetingName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data presensi sesi "${meetingName}"?`)) return;

    const recordsToDelete = records.filter(r => r.meetingId === meetingId);
    if (recordsToDelete.length === 0) return;

    try {
      await Promise.all(
        recordsToDelete.map(r =>
          fetch(`/api/absensi/${r.id}`, { method: 'DELETE' })
        )
      );
      queryClient.invalidateQueries({ queryKey: apiKeys.absensi.all });
      showNotification(`Sesi "${meetingName}" berhasil dihapus.`);
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus data presensi');
    }
  };

  // Extract unique meetings for history list
  const uniqueMeetingsMap: { [id: string]: { id: string; name: string; date: string } } = {};
  records.forEach(r => {
    if (!uniqueMeetingsMap[r.meetingId]) {
      uniqueMeetingsMap[r.meetingId] = {
        id: r.meetingId,
        name: r.meetingName,
        date: r.createdAt
      };
    }
  });
  const historicalMeetings = Object.values(uniqueMeetingsMap);

  return (
    <>
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="text-tosca-400" size={18} />
            <span className="text-xs font-extrabold">{notification}</span>
          </div>
        )}

        {/* Dashboard Actions */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-800">
              {currentMeetingId ? `Sesi Aktif: ${currentMeetingName}` : 'Sesi Presensi Belum Dimulai'}
            </h2>
            <p className="text-xs text-slate-400 font-semibold">
              {currentMeetingId ? 'Silakan sesuaikan status kehadiran santri di tabel bawah.' : 'Tekan "Tambah Pertemuan" untuk memulai sesi absensi baru.'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentMeetingId ? (
              <button 
                onClick={handleSaveAttendance}
                className="flex-1 sm:flex-initial py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Save size={16} /> Simpan Presensi
              </button>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-initial py-3 px-6 bg-tosca-600 hover:bg-tosca-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} /> Tambah Pertemuan
              </button>
            )}
          </div>
        </div>

        {/* Input Table Form */}
        {currentMeetingId && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/20">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <CheckSquare className="text-tosca-600" size={18} /> Lembar Kehadiran Siswa
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-5 text-center w-16">No</th>
                    <th className="py-4 px-5">NIS</th>
                    <th className="py-4 px-5">Nama Lengkap</th>
                    <th className="py-4 px-5">Kelas</th>
                    <th className="py-4 px-5 text-center">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {santriList.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/20 transition-all font-semibold">
                      <td className="py-4 px-5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-4 px-5 font-bold text-slate-600">{s.nis}</td>
                      <td className="py-4 px-5 font-black text-slate-900">{s.nama_lengkap}</td>
                      <td className="py-4 px-5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 font-extrabold text-[9px] uppercase">
                          {s.kelas_nama}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map(status => (
                            <button
                              key={status}
                              onClick={() => setAttendance(s.id, status)}
                              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                attendanceStates[s.id] === status
                                  ? status === 'Hadir' ? 'bg-green-600 text-white shadow-sm' :
                                    status === 'Izin' ? 'bg-blue-600 text-white shadow-sm' :
                                    status === 'Sakit' ? 'bg-amber-500 text-white shadow-sm' :
                                    'bg-rose-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History / Daftar Pertemuan */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <CalendarDays className="text-orange-500" size={18} /> Riwayat Sesi Pertemuan Kehadiran
            </h3>
          </div>
          
          {historicalMeetings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold text-sm">
              <CalendarDays className="mx-auto text-slate-200 mb-2 stroke-[1.5]" size={36} />
              Belum ada riwayat presensi yang disimpan.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historicalMeetings.map(m => {
                // Calculate stats for this meeting
                const mRecords = records.filter(r => r.meetingId === m.id);
                const hadirCount = mRecords.filter(r => r.status === 'Hadir').length;
                const totalCount = mRecords.length;

                return (
                  <div key={m.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800">{m.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                        <span>Tanggal: {m.date}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-black">Kehadiran: {hadirCount}/{totalCount} Siswa</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteMeeting(m.id, m.name)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Hapus Pertemuan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      {/* Modal Dialog Tambah Pertemuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-tosca-50 border-b border-tosca-100/50 flex items-center justify-between">
              <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2">
                <CalendarDays className="text-tosca-600" size={18} /> Tambah Pertemuan Baru
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-tosca-500 hover:text-tosca-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMeeting} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nama / Deskripsi Pertemuan</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Halaqah Pagi 3 Juni"
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-tosca-500 bg-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-tosca-600 hover:bg-tosca-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                Mulai Sesi Absensi
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
