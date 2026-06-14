'use client';

import React from 'react';
import { X, BookOpen, GraduationCap, Calendar as CalendarIcon, Users, School, MessageSquare } from 'lucide-react';
import { AdminCard } from '@/components/ui/admin-card';

interface DetailAktivitasModalProps {
  activity: any;
  onClose: () => void;
}

export default function DetailAktivitasModal({ activity, onClose }: DetailAktivitasModalProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Tahsin': return <BookOpen size={20} className="text-tosca-600" />;
      case 'sertifikat': return <GraduationCap size={20} className="text-tosca-600" />;
      case 'jadwal': return <CalendarIcon size={20} className="text-tosca-600" />;
      case 'santri': return <Users size={20} className="text-tosca-600" />;
      case 'kelas': return <School size={20} className="text-tosca-600" />;
      default: return <MessageSquare size={20} className="text-surface-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AdminCard padding="none" className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-surface-200">
              {getActivityIcon(activity.type)}
            </div>
            <h2 className="text-lg font-bold text-tosca-900">Detail Aktivitas</h2>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-tosca-600 text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold shadow-md">
              {activity.user.charAt(0)}
            </div>
            <h3 className="text-lg font-bold text-tosca-900">{activity.user}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              activity.status === 'Lancar' ? 'bg-tosca-100 text-tosca-700' : 'bg-surface-100 text-surface-600'
            }`}>
              {activity.status}
            </span>
          </div>
          <div className="space-y-3 bg-surface-50 p-5 rounded-2xl border border-surface-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-surface-400 font-medium text-xs uppercase">Tindakan</span>
              <span className="text-tosca-900 font-semibold">{activity.action}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-surface-400 font-medium text-xs uppercase">Target</span>
              <span className="text-tosca-900 font-semibold">{activity.target}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-surface-400 font-medium text-xs uppercase">Waktu</span>
              <span className="text-tosca-900 font-semibold">{activity.time}</span>
            </div>
          </div>
          <div className="p-4 bg-white border border-surface-200 rounded-2xl">
            <p className="text-xs font-semibold text-surface-400 uppercase mb-1.5">Keterangan:</p>
            <p className="text-sm text-surface-700 leading-relaxed">{activity.detail}</p>
          </div>
          <button onClick={onClose} className="w-full py-3.5 bg-tosca-900 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all">
            Tutup
          </button>
        </div>
      </AdminCard>
    </div>
  );
}
