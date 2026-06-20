'use client';

import React, { useState, useEffect } from 'react';
import { Star, AlertCircle, BookOpen, BookMarked, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NilaiRecord {
  id: string;
  detail1: string;
  detail2: string;
  score1: number;
  score2: number;
  score3: number;
  rata: number;
  status: string;
  createdAt: string;
}

const LEVEL_API: Record<string, string> = {
  TAHSIN: '/api/setoran',
  BTQ_PEMULA: '/api/btq-pemula',
  BTQ_LANJUTAN: '/api/btq-lanjutan',
  TAHFIDZ: '/api/tahfidz',
  MUROJAAH: '/api/murojaah',
};

const LEVEL_MAP: Record<string, (r: any) => NilaiRecord> = {
  TAHSIN: (r) => ({
    id: r.id,
    detail1: r.surah || '',
    detail2: r.ayat_start ? (r.ayat_end ? `${r.ayat_start}-${r.ayat_end}` : String(r.ayat_start)) : '',
    score1: r.tajwid_score || 0,
    score2: r.makhraj_score || 0,
    score3: r.kelancaran_score || 0,
    rata: Number(r.rata_rata) || 0,
    status: r.status === 'LANJUT' ? 'Lanjut' : 'Ulang',
    createdAt: r.created_at || '',
  }),
  BTQ_PEMULA: (r) => ({
    id: r.id,
    detail1: r.jilid || '',
    detail2: String(r.halaman || ''),
    score1: r.nilai || 0,
    score2: 0,
    score3: 0,
    rata: r.nilai || 0,
    status: '',
    createdAt: r.created_at || '',
  }),
  BTQ_LANJUTAN: (r) => ({
    id: r.id,
    detail1: r.level || '',
    detail2: r.juz_surah || '',
    score1: r.nilai || 0,
    score2: 0,
    score3: 0,
    rata: r.nilai || 0,
    status: r.status_bacaan || '',
    createdAt: r.created_at || '',
  }),
  TAHFIDZ: (r) => ({
    id: r.id,
    detail1: r.surat || '',
    detail2: r.ayat || '',
    score1: r.nilai || 0,
    score2: 0,
    score3: 0,
    rata: r.nilai || 0,
    status: r.status_setoran || '',
    createdAt: r.created_at || '',
  }),
  MUROJAAH: (r) => ({
    id: r.id,
    detail1: r.surah || '',
    detail2: r.ayat || '',
    score1: r.nilai || 0,
    score2: 0,
    score3: 0,
    rata: r.nilai || 0,
    status: r.status_murojaah || '',
    createdAt: r.created_at || '',
  }),
};

const FIELD_LABELS: Record<string, { label1: string; label2: string; scores: string[]; title: string }> = {
  TAHSIN: { label1: 'Surah', label2: 'Ayat', scores: ['Tajwid', 'Makhraj', 'Kelancaran'], title: 'Detail Nilai Tahsin Harian' },
  BTQ_PEMULA: { label1: 'Jilid', label2: 'Halaman', scores: ['Nilai'], title: 'Detail Nilai BTQ Pemula' },
  BTQ_LANJUTAN: { label1: 'Level', label2: 'Juz/Surah', scores: ['Nilai'], title: 'Detail Nilai BTQ Lanjutan' },
  TAHFIDZ: { label1: 'Surat', label2: 'Ayat', scores: ['Nilai'], title: 'Detail Nilai Tahfidz' },
  MUROJAAH: { label1: 'Surah', label2: 'Ayat', scores: ['Nilai'], title: 'Detail Nilai Murojaah' },
};

export default function NilaiSantriPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<NilaiRecord[]>([]);

  const level = user?.levelProgram || 'TAHSIN';
  const apiPath = LEVEL_API[level] || LEVEL_API['TAHSIN'];
  const mapper = LEVEL_MAP[level] || LEVEL_MAP['TAHSIN'];
  const labels = FIELD_LABELS[level] || FIELD_LABELS['TAHSIN'];

  const loadRiwayat = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${apiPath}?santuario_id=${user.id}`);
      const data = await res.json();
      const mapped = (data.data || []).map(mapper);
      setRecords(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRiwayat();
    const interval = setInterval(loadRiwayat, 2000);
    return () => clearInterval(interval);
  }, [user, apiPath, mapper]);

  return (
    <>
      <div className="bg-tosca-50 border border-tosca-100 rounded-2xl p-4 flex items-center gap-3">
        <Star className="text-amber-500 shrink-0" size={20} />
        <p className="text-sm text-tosca-700 font-bold leading-relaxed">
          Berikut adalah detail rekaman nilai {level.replace('_', ' ').toLowerCase()} Anda secara real-time.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-tosca-50 bg-tosca-50/10 flex items-center justify-between">
          <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2">
            <Star className="text-amber-500" size={18} /> {labels.title}
          </h3>
        </div>
        {records.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            <div className="flex flex-col items-center justify-center space-y-2">
              <AlertCircle size={32} className="text-tosca-300 stroke-[1.5]" />
              <p className="text-sm">Belum ada riwayat nilai yang diunggah oleh Guru.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-tosca-50">
            {records.map((r) => {
              const showScoreGrid = level === 'TAHSIN';
              return (
                <div key={r.id} className="p-5 space-y-3 hover:bg-tosca-50/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-tosca-500" />
                        <span className="font-bold text-tosca-900">{r.detail1}</span>
                        {r.detail2 && <span className="text-tosca-400 text-sm">{labels.label2} {r.detail2}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-tosca-400">
                        {r.status && (
                          <span className={`px-2 py-0.5 rounded-full border font-semibold ${
                            r.status === 'Lanjut' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            r.status === 'Ulang' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-tosca-50 text-tosca-600 border-tosca-200'
                          }`}>
                            {r.status === 'Lanjut' ? <CheckCircle2 className="h-3 w-3 inline mr-0.5" /> :
                             r.status === 'Ulang' ? <AlertCircle className="h-3 w-3 inline mr-0.5" /> : null}
                            {r.status}
                          </span>
                        )}
                        <span>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-tosca-700">{r.rata}</p>
                      <p className="text-[10px] text-tosca-400 font-semibold">NILAI</p>
                    </div>
                  </div>
                  {showScoreGrid && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-tosca-50 rounded-xl py-2">
                        <p className="text-xs text-tosca-400 font-medium">Tajwid</p>
                        <p className="text-sm font-bold text-tosca-700">{r.score1}</p>
                      </div>
                      <div className="bg-tosca-50 rounded-xl py-2">
                        <p className="text-xs text-tosca-400 font-medium">Makhraj</p>
                        <p className="text-sm font-bold text-tosca-700">{r.score2}</p>
                      </div>
                      <div className="bg-tosca-50 rounded-xl py-2">
                        <p className="text-xs text-tosca-400 font-medium">Kelancaran</p>
                        <p className="text-sm font-bold text-tosca-700">{r.score3}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
