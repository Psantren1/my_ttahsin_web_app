import React from 'react';
import { Megaphone, Clock } from 'lucide-react';
import { getAllInformasi } from '@/lib/services/informasi.service';

export default async function InformasiMusyrifPage() {
  const infoList = await getAllInformasi('MUSYRIF');

  return (
    <>
      {infoList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-tosca-50 flex items-center justify-center">
            <Megaphone className="text-tosca-300" size={36} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-black text-slate-700">Belum Ada Informasi</p>
            <p className="text-xs text-slate-400 font-semibold max-w-xs">
              Belum ada informasi atau pengumuman dari Admin.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            {infoList.length} Informasi
          </p>

          {infoList.map(info => (
            <div
              key={info.id}
              className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              <div className="bg-gradient-to-r from-tosca-800 to-tosca-700 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Megaphone className="text-amber-300" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-black text-white">{info.judul}</h2>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-tosca-200 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(info.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{info.created_by_name}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line">{info.isi}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
