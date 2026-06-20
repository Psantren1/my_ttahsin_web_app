'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  Plus, 
  Video, 
  FileText, 
  Youtube, 
  Trash2, 
  X, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';
import { useZoomMeetingsList, useCreateZoomMeeting } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { apiKeys } from '@/lib/hooks/useApi';

export interface VirtualMeeting {
  id: string;
  namaPertemuan: string;
  googleDriveLink: string;
  youtubeLink: string;
  zoomLink: string;
  createdAt: string;
}

export default function VirtualClassMusyrifPage() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { data: meetingsData } = useZoomMeetingsList();
  const createMeeting = useCreateZoomMeeting();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form states
  const [namaPertemuan, setNamaPertemuan] = useState('');
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [zoomLink, setZoomLink] = useState('');

  const meetings: VirtualMeeting[] = (meetingsData?.data || []).map((m: any) => {
    let parsedDesc = { googleDriveLink: '', youtubeLink: '' };
    if (m.description) {
      try { parsedDesc = JSON.parse(m.description); } catch (e) { /* ignore */ }
    }
    return {
      id: m.id,
      namaPertemuan: m.topic || '',
      googleDriveLink: parsedDesc.googleDriveLink || '',
      youtubeLink: parsedDesc.youtubeLink || '',
      zoomLink: m.link || '',
      createdAt: m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    };
  });

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMeeting.mutateAsync({
        musyrif_id: user?.id || '',
        topic: namaPertemuan,
        description: JSON.stringify({ googleDriveLink, youtubeLink }),
        meeting_date: new Date().toISOString().split('T')[0],
        meeting_time: new Date().toTimeString().slice(0, 5),
        duration: 60,
        link: zoomLink,
        host_name: user?.fullName || ''
      });
    } catch (e) {
      console.error('Error creating meeting', e);
    }
    
    // Clear form states
    setNamaPertemuan('');
    setGoogleDriveLink('');
    setYoutubeLink('');
    setZoomLink('');
    
    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteMeeting = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pertemuan ini?')) {
      try {
        await fetch(`/api/zoom-meetings/${id}`, { method: 'DELETE' });
        queryClient.invalidateQueries({ queryKey: apiKeys.zoom.all });
      } catch (e) {
        console.error('Error deleting meeting', e);
      }
    }
  };

  return (
    <>
        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={18} />
            <span className="text-xs font-extrabold">Pertemuan Berhasil Ditambahkan!</span>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-gradient-to-tr from-tosca-900 to-tosca-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <Video size={100} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Manajemen Kelas Virtual</h1>
            <p className="text-xs text-tosca-100 font-medium leading-relaxed max-w-xl">
              Unggah materi bimbingan Google Drive, bagikan rekaman bimbingan YouTube, atau jadwalkan tatap muka online via Zoom untuk santri halaqah Anda.
            </p>
          </div>
        </div>

        {/* Meeting List */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Sparkles size={14} className="text-amber-500" /> Daftar Pertemuan & Materi
          </h2>

          {meetings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-tosca-50 rounded-2xl text-tosca-500">
                <Video size={40} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-tosca-950">Belum Ada Pertemuan</h3>
                <p className="text-xs text-tosca-500 max-w-xs mx-auto">
                   Silakan klik tombol &quot;Tambah Pertemuan&quot; di atas untuk membuat kelas virtual pertama Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {meetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-tosca-200 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-tosca-50 text-tosca-600 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={10} />
                        {meeting.createdAt}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-tosca-950 group-hover:text-tosca-700 transition-colors">
                      {meeting.namaPertemuan}
                    </h3>
                    
                    {/* Visual badges for active links */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {meeting.googleDriveLink && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-blue-100">
                          <FileText size={12} />
                          Materi Drive
                        </span>
                      )}
                      {meeting.youtubeLink && (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-red-100">
                          <Youtube size={12} />
                          Video YouTube
                        </span>
                      )}
                      {meeting.zoomLink && (
                        <span className="px-2.5 py-1 bg-tosca-50 text-tosca-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-tosca-100">
                          <Video size={12} />
                          Rapat Zoom
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                      title="Hapus Pertemuan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      {/* Modal Dialog Tambah Pertemuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-tosca-600 to-tosca-400 text-white rounded-xl shadow-md">
                  <Video size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-950">Tambah Pertemuan Baru</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-tosca-400 hover:text-tosca-600 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-tosca-900 ml-1">Nama Pertemuan / Pembahasan</label>
                <input 
                  type="text" 
                  value={namaPertemuan}
                  onChange={(e) => setNamaPertemuan(e.target.value)}
                  placeholder="Contoh: Bimbingan Tahfizh Juz 30 (Halaqah A)"
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-tosca-900 ml-1">Link Materi Google Drive (Opsional)</label>
                <input 
                  type="url" 
                  value={googleDriveLink}
                  onChange={(e) => setGoogleDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-tosca-900 ml-1">Link Video YouTube (Opsional)</label>
                <input 
                  type="url" 
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-tosca-900 ml-1">Link Zoom Meeting (Opsional)</label>
                <input 
                  type="url" 
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-tosca-600 focus:ring-0 text-sm font-semibold text-black"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-3 border-2 border-slate-100 text-tosca-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-tosca-600 to-tosca-500 text-white rounded-2xl font-bold hover:from-tosca-700 hover:to-tosca-600 transition-all shadow-md shadow-tosca-100 cursor-pointer"
                >
                  Simpan Pertemuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
