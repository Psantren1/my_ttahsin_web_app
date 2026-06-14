import React from 'react';
import { Calendar } from 'lucide-react';
import { getSession } from '@/lib/auth/auth';
import { getUserById } from '@/lib/services/user.service';
import { getJadwalByKelas } from '@/lib/services/jadwal.service';
import { redirect } from 'next/navigation';

interface JadwalData {
  id: string;
  sesi: string;
  jam: string;
  lokasi: string;
  musyrif: string;
  hari: string;
}

export default async function JadwalSantriPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  const user = await getUserById(session.userId);
  if (!user || !user.kelas_id) {
    return (
      <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm p-12 text-center">
        <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
        <p className="text-slate-500 font-medium">Anda belum terdaftar di kelas manapun.</p>
      </div>
    );
  }

  const rawJadwal = await getJadwalByKelas(user.kelas_id);
  
  const jadwalList: JadwalData[] = rawJadwal.map((j: any) => ({
    id: String(j.id),
    sesi: j.sesi || '',
    jam: j.jam_mulai ? j.jam_mulai.slice(0, 5) : '',
    lokasi: j.lokasi || '',
    musyrif: j.musyrif_name || '',
    hari: j.hari || ''
  }));

  const getHariLabel = (hari: string) => {
    const hariLabels: Record<string, string> = {
      'SENIN': 'Senin', 'SELASA': 'Selasa', 'RABU': 'Rabu', 'KAMIS': 'Kamis',
      'JUMAT': 'Jumat', 'SABTU': 'Sabtu', 'MINGGU': 'Minggu'
    };
    return hariLabels[hari] || hari;
  };

  const jadwalByHari = jadwalList.reduce((acc: Record<string, JadwalData[]>, jadwal) => {
    const hari = jadwal.hari || 'SENIN';
    if (!acc[hari]) acc[hari] = [];
    acc[hari].push(jadwal);
    return acc;
  }, {} as Record<string, JadwalData[]>);

  const hariOrder = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];
  const sortedHari = Object.keys(jadwalByHari).sort((a, b) => hariOrder.indexOf(a) - hariOrder.indexOf(b));

  return (
    <>
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 flex items-center gap-3">
        <Calendar className="text-indigo-500" size={20} />
        <p className="text-sm text-indigo-700 font-medium">Jadwal dari admin. Sinkron dengan database.</p>
      </div>

      <div className="bg-white rounded-2xl border border-tosca-50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-tosca-50">
          <h3 className="text-sm font-black text-tosca-900 flex items-center gap-2">
            <Calendar className="text-indigo-500" size={18} /> Jadwal Mingguan Halaqah
          </h3>
        </div>

        {sortedHari.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 font-medium">Belum ada jadwal</p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {sortedHari.map(hari => (
              <div key={hari} className="space-y-3">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  {getHariLabel(hari)}
                </h4>
                <div className="space-y-2">
                  {jadwalByHari[hari].map((j) => (
                    <div key={j.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-800">{j.sesi}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{j.lokasi}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg block">{j.jam}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
