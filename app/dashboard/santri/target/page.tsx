'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Award, Home, Star, Video, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface TargetRecord {
  id: string;
  santriId: string;
  santriName: string;
  kelasNama: string;
  juzTarget: string; // Target Juz (1-30)
  progres: number;   // Progress (0-100)
  updatedAt: string;
}

const defaultProfile = {
  juzTarget: '',
  juzSelesai: [] as string[],
  progres: 0,
};

export default function TargetSantriPage() {
  const { user } = useAuth();
  const [targetRecord, setTargetRecord] = useState<TargetRecord | null>(null);

  const loadTarget = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/target?santuario_id=${user.id}`);
      const data = await res.json();
      const allRecords: TargetRecord[] = (data.data || []).map((r: any) => ({
        id: r.id,
        santriId: r.santuario_id,
        santriName: r.santri_name || '',
        kelasNama: r.kelas_nama || '',
        juzTarget: r.juz || '',
        progres: r.progres || 0,
        updatedAt: r.created_at || '',
      }));
      const matched = allRecords.find(r => 
        r.santriId === user.id || 
        r.santriName.toLowerCase() === user.fullName.toLowerCase()
      );
      if (matched) {
        setTargetRecord(matched);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTarget();

    const interval = setInterval(loadTarget, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // Determine display values
  const displayTarget = targetRecord ? `Juz ${targetRecord.juzTarget}` : defaultProfile.juzTarget;
  const displayProgres = targetRecord ? targetRecord.progres : defaultProfile.progres;

  // Derive completed juz list
  const juzSelesai = defaultProfile.juzSelesai;

  // Generate initials for avatar
  const avatarInitials = user 
    ? user.fullName.split(' ').map(n => n.charAt(0)).slice(0, 2).join('') 
    : 'AF';

  return (<>

        <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2">
            <Target className="text-fuchsia-500" size={18} /> Target Aktif
          </h3>
          <p className="text-3xl font-black text-tosca-900">{displayTarget}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-tosca-600">
              <span>Progres</span>
              <span>{displayProgres}%</span>
            </div>
            <div className="h-4 bg-slate-100 border border-slate-200 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-tosca-600 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${displayProgres}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Juz Selesai */}
        <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-6">
          <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2 mb-4">
            <Award className="text-yellow-500" size={18} /> Juz yang Telah Diselesaikan
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {juzSelesai.length === 0 ? (
              <p className="text-sm text-slate-400 font-semibold col-span-2">Belum ada juz yang diselesaikan.</p>
            ) : juzSelesai.map(jz => (
              <div key={jz} className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center gap-2">
                <Award className="text-yellow-500" size={18} />
                <span className="text-sm font-black text-tosca-900">Juz {jz}</span>
              </div>
            ))}
          </div>
        </div>
  </>
  );
}