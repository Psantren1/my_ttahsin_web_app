'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';
import {
  ArrowLeft, BookOpen, Home, Star, Video, Award, User,
  CheckCircle2, AlertCircle, Sparkles, BookMarked
} from 'lucide-react';

interface SetoranRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasNama: string;
  nis: string;
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
  TAHSIN: '/api/setoran', BTQ_PEMULA: '/api/btq-pemula', BTQ_LANJUTAN: '/api/btq-lanjutan',
  TAHFIDZ: '/api/tahfidz', MUROJAAH: '/api/murojaah',
};

const LEVEL_MAP: Record<string, (r: any) => SetoranRecord> = {
  TAHSIN: (r) => ({
    id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
    kelasNama: r.kelas_nama || '', nis: r.nis || '',
    detail1: r.surah || '', detail2: r.ayat_start ? (r.ayat_end ? `${r.ayat_start}-${r.ayat_end}` : String(r.ayat_start)) : '',
    score1: r.tajwid_score || 0, score2: r.makhraj_score || 0, score3: r.kelancaran_score || 0,
    rata: Number(r.rata_rata) || 0, status: r.status === 'LANJUT' ? 'Lanjut' : 'Ulang',
    createdAt: r.created_at || '',
  }),
  BTQ_PEMULA: (r) => ({
    id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
    kelasNama: r.kelas_nama || '', nis: r.nis || '',
    detail1: r.jilid || '', detail2: String(r.halaman || ''),
    score1: r.nilai || 0, score2: 0, score3: 0,
    rata: r.nilai || 0, status: '', createdAt: r.created_at || '',
  }),
  BTQ_LANJUTAN: (r) => ({
    id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
    kelasNama: r.kelas_nama || '', nis: r.nis || '',
    detail1: r.juz_surah || '', detail2: r.level || '',
    score1: r.nilai || 0, score2: 0, score3: 0,
    rata: r.nilai || 0, status: '', createdAt: r.created_at || '',
  }),
  TAHFIDZ: (r) => ({
    id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
    kelasNama: r.kelas_nama || '', nis: r.nis || '',
    detail1: r.surah || '', detail2: r.ayat || '',
    score1: r.nilai || 0, score2: 0, score3: 0,
    rata: r.nilai || 0, status: '', createdAt: r.created_at || '',
  }),
  MUROJAAH: (r) => ({
    id: r.id, santriId: r.santuario_id, santriName: r.santri_name || '',
    kelasNama: r.kelas_nama || '', nis: r.nis || '',
    detail1: r.surah || '', detail2: r.ayat || '',
    score1: r.nilai || 0, score2: 0, score3: 0,
    rata: r.nilai || 0, status: '', createdAt: r.created_at || '',
  }),
};

const FIELD_LABELS: Record<string, { label1: string; label2: string; scoreLabel: string; scores: string[] }> = {
  TAHSIN: { label1: 'Surah', label2: 'Ayat', scoreLabel: 'Nilai', scores: ['Tajwid', 'Makhraj', 'Kelancaran'] },
  BTQ_PEMULA: { label1: 'Jilid', label2: 'Halaman', scoreLabel: 'Nilai', scores: ['Nilai'] },
  BTQ_LANJUTAN: { label1: 'Juz/Surah', label2: 'Level', scoreLabel: 'Nilai', scores: ['Nilai'] },
  TAHFIDZ: { label1: 'Surah', label2: 'Ayat', scoreLabel: 'Nilai', scores: ['Nilai'] },
  MUROJAAH: { label1: 'Surah', label2: 'Ayat', scoreLabel: 'Nilai', scores: ['Nilai'] },
};

export default function SetoranSantriPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [records, setRecords] = useState<SetoranRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, rataRata: 0 });

  const level = user?.levelProgram || 'TAHSIN';
  const apiPath = LEVEL_API[level] || LEVEL_API['TAHSIN'];
  const mapper = LEVEL_MAP[level] || LEVEL_MAP['TAHSIN'];
  const labels = FIELD_LABELS[level] || FIELD_LABELS['TAHSIN'];

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const res = await fetch(`${apiPath}?santuario_id=${user.id}`);
        const data = await res.json();
        const mapped = (data.data || []).map(mapper);
        setRecords(mapped);

        if (mapped.length > 0) {
          const sum = mapped.reduce((acc: number, r: SetoranRecord) => acc + r.rata, 0);
          setStats({ total: mapped.length, rataRata: parseFloat((sum / mapped.length).toFixed(1)) });
        }
      } catch (e) {
        console.error('Error loading data', e);
      }
    };

    loadData();
  }, [user, apiPath, mapper]);

  const avatarInitials = user
    ? user.fullName.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')
    : '';

  return (<>
    {stats.total > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-5">
              <p className="text-xs font-semibold text-tosca-500 uppercase tracking-wider">Total Setoran</p>
              <p className="text-3xl font-black text-tosca-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-5">
              <p className="text-xs font-semibold text-tosca-500 uppercase tracking-wider">Rata-rata Nilai</p>
              <p className="text-3xl font-black text-tosca-900 mt-1">{stats.rataRata}</p>
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-tosca-200 mb-4" />
            <p className="text-tosca-400 font-semibold">Belum ada setoran</p>
            <p className="text-tosca-300 text-sm mt-1">Setoran akan muncul setelah guru mencatatnya</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => {
              const showScoreGrid = level === 'TAHSIN';
              return (
                <div key={rec.id} className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-tosca-500" />
                        <span className="font-bold text-tosca-900">{rec.detail1}</span>
                        {rec.detail2 && <span className="text-tosca-400 text-sm">{labels.label2} {rec.detail2}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-tosca-400">
                        {rec.status && (
                          <span className={`px-2 py-0.5 rounded-full border font-semibold ${
                            rec.status === 'Lanjut' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            rec.status === 'Ulang' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''
                          }`}>
                            {rec.status === 'Lanjut' ? <CheckCircle2 className="h-3 w-3 inline mr-0.5" /> :
                             rec.status === 'Ulang' ? <AlertCircle className="h-3 w-3 inline mr-0.5" /> : null}
                            {rec.status}
                          </span>
                        )}
                        <span>{rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-tosca-700">{rec.rata}</p>
                      <p className="text-[10px] text-tosca-400 font-semibold">NILAI</p>
                    </div>
                  </div>
                  {showScoreGrid && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-tosca-50 rounded-xl py-2">
                        <p className="text-xs text-tosca-400 font-medium">Tajwid</p>
                        <p className="text-sm font-bold text-tosca-700">{rec.score1}</p>
                      </div>
                      <div className="bg-tosca-50 rounded-xl py-2">
                        <p className="text-xs text-tosca-400 font-medium">Makhraj</p>
                        <p className="text-sm font-bold text-tosca-700">{rec.score2}</p>
                      </div>
                      <div className="bg-tosca-50 rounded-xl py-2">
                        <p className="text-xs text-tosca-400 font-medium">Kelancaran</p>
                        <p className="text-sm font-bold text-tosca-700">{rec.score3}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
  </>
  );
}