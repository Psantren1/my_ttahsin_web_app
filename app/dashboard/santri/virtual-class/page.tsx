'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  Video, 
  FileText, 
  Youtube, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';
import { VirtualMeeting } from '../../musyrif/virtual-class/page';

function toGoogleDriveEmbed(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([^/?#&]+)/,
    /\/open\?id=([^&]+)/,
    /id=([^&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) {
      return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
  }
  return null;
}

export default function VirtualClassSantriPage() {
  const { settings } = useSettings();
  const [meetings, setMeetings] = useState<VirtualMeeting[]>([]);
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  const [viewingDriveUrl, setViewingDriveUrl] = useState<string | null>(null);
  const [viewingDriveTitle, setViewingDriveTitle] = useState('');

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const res = await fetch('/api/zoom-meetings');
        const data = await res.json();
        setMeetings((data.data || []).map((m: any) => {
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
        }));
      } catch (e) {
        console.error('Error fetching meetings', e);
      }
    };
    loadMeetings();
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedMeetingId === id) {
      setExpandedMeetingId(null);
    } else {
      setExpandedMeetingId(id);
    }
  };

  // Helper to extract YouTube ID for iframe embed
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-tosca-100/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/santri" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Kelas Virtual</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-tosca-500 font-extrabold uppercase tracking-wider">{settings.appName} • TA {settings.tahunAjaran}</span>
              </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-tosca-600 text-white flex items-center justify-center font-bold text-sm">AF</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-tr from-tosca-900 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <GraduationCap size={120} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Materi & Kelas Halaqah</h1>
            <p className="text-xs text-teal-100 font-medium leading-relaxed max-w-xl">
              Akses berkas Google Drive, tonton video rekaman bimbingan YouTube, atau bergabung ke sesi tatap muka online via Zoom yang disediakan oleh Musyrif Anda.
            </p>
          </div>
        </div>

        {/* Google Drive Embedded Viewer */}
        {viewingDriveUrl && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <button
                onClick={() => { setViewingDriveUrl(null); setViewingDriveTitle(''); }}
                className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="text-sm font-black text-tosca-900 block">Materi — {viewingDriveTitle}</span>
                <span className="text-[10px] text-tosca-500 font-medium">Google Drive • Dokumen Pendukung</span>
              </div>
            </div>
            <iframe
              src={viewingDriveUrl}
              className="flex-1 w-full"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        )}

        {/* Meeting list */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Sparkles size={14} className="text-amber-500" /> Daftar Pertemuan Aktif
          </h2>

          {meetings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-tosca-50 rounded-2xl text-tosca-500">
                <BookOpen size={40} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-tosca-950">Belum Ada Materi</h3>
                <p className="text-xs text-tosca-500 max-w-xs mx-auto">
                  Musyrif Anda belum mengunggah pertemuan atau materi kelas virtual saat ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => {
                const isExpanded = expandedMeetingId === meeting.id;
                const ytId = meeting.youtubeLink ? getYoutubeId(meeting.youtubeLink) : null;

                return (
                  <div 
                    key={meeting.id} 
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:border-tosca-200"
                  >
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => toggleExpand(meeting.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-tosca-50/20 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <span className="px-2 py-0.5 bg-tosca-50 text-tosca-600 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
                          <Calendar size={10} />
                          {meeting.createdAt}
                        </span>
                        <h3 className="text-base font-black text-tosca-950">
                          {meeting.namaPertemuan}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Indicators */}
                        <div className="hidden sm:flex gap-1.5">
                          {meeting.googleDriveLink && (
                            <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg" title="Materi Tersedia"><FileText size={14} /></span>
                          )}
                          {meeting.youtubeLink && (
                            <span className="p-1.5 bg-red-50 text-red-500 rounded-lg" title="Video YouTube Tersedia"><Youtube size={14} /></span>
                          )}
                          {meeting.zoomLink && (
                            <span className="p-1.5 bg-teal-50 text-teal-500 rounded-lg" title="Zoom Meeting Tersedia"><Video size={14} /></span>
                          )}
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-tosca-500" />
                        ) : (
                          <ChevronDown size={20} className="text-tosca-300" />
                        )}
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="p-6 border-t border-slate-100 bg-tosca-50/5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* 1. Zoom Section */}
                        {meeting.zoomLink && (
                          <div className="bg-teal-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                              <Video size={70} />
                            </div>
                            <div className="space-y-1 z-10">
                              <span className="px-2 py-0.5 bg-green-500 text-white rounded text-[8px] font-black uppercase">Tatap Muka Online</span>
                              <h4 className="text-base font-extrabold">Sesi Pembelajaran Zoom</h4>
                              <p className="text-[10px] text-teal-200">Silakan klik tombol di samping untuk langsung bergabung ke tatap muka online.</p>
                            </div>
                            <a 
                              href={meeting.zoomLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-5 py-3 bg-white text-teal-900 rounded-xl font-black text-xs hover:bg-teal-50 transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm cursor-pointer z-10"
                            >
                              <Video size={16} />
                              Gabung Rapat Zoom
                            </a>
                          </div>
                        )}

                        {/* 2. YouTube Embed Section */}
                        {meeting.youtubeLink && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Video Bimbingan / Materi</span>
                            {ytId ? (
                              <div className="rounded-2xl overflow-hidden aspect-video shadow-md border border-slate-100 bg-black">
                                <iframe 
                                  src={`https://www.youtube.com/embed/${ytId}`} 
                                  title="YouTube Video Player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  className="w-full h-full"
                                ></iframe>
                              </div>
                            ) : (
                              <a 
                                href={meeting.youtubeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl border border-red-100 font-extrabold text-sm transition-all"
                              >
                                <span className="flex items-center gap-2">
                                  <Youtube size={18} />
                                  Tonton Rekaman Materi (Buka YouTube)
                                </span>
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        )}

                        {/* 3. Google Drive Section */}
                        {meeting.googleDriveLink && !viewingDriveUrl && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Bahan & Dokumen Pendukung</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const embed = toGoogleDriveEmbed(meeting.googleDriveLink);
                                if (embed) {
                                  setViewingDriveUrl(embed);
                                  setViewingDriveTitle(meeting.namaPertemuan);
                                } else {
                                  window.open(meeting.googleDriveLink, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-100 font-extrabold text-sm transition-all cursor-pointer shadow-sm"
                            >
                              <span className="flex items-center gap-2">
                                <FileText size={18} />
                                Akses Berkas Materi (Google Drive)
                              </span>
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        )}

                        {/* Default Placeholder if no assets */}
                        {!meeting.zoomLink && !meeting.youtubeLink && !meeting.googleDriveLink && (
                          <p className="text-xs text-slate-500 font-bold text-center py-4 bg-slate-50 rounded-2xl">
                            Belum ada dokumen materi atau link video yang dilampirkan.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
