'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, User, Mail, Phone, BookOpen, Calendar, Home, BookOpen as BookOpenIcon, Star, CheckSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfilPage() {
  const { user } = useAuth();

  // Find additional details from musyrif_list stored in localStorage
  let matchedMusyrif: any = null;
  if (typeof window !== 'undefined' && user) {
    const stored = localStorage.getItem('musyrif_list');
    if (stored) {
      try {
        const musyrifList = JSON.parse(stored);
        matchedMusyrif = musyrifList.find((m: any) => m.id === user.id || m.nip === user.nip);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const musyrifData = {
    id: user?.id || '',
    nama: user?.fullName || 'Musyrif',
    username: user?.username || '—',
    email: user?.email || '—',
    nip: user?.nip || '—',
    nohp: matchedMusyrif?.no_wa || '—',
    kelas: matchedMusyrif?.kelas_nama || 'Halaqah Binaan',
    tanggalLahir: matchedMusyrif?.tanggalLahir || '—',
    alamat: matchedMusyrif?.alamat || '—',
    foto: null
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-tosca-100/50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/musyrif" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-950 block tracking-tight">Profil Musyrif</span>
              <span className="text-[10px] text-tosca-500 font-medium">Informasi akun</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-tr from-tosca-600 to-teal-500 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-tosca-600 font-black text-3xl">
                UM
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-6 px-6 text-center">
            <h2 className="text-xl font-black text-slate-900">{musyrifData.nama}</h2>
            <p className="text-sm text-tosca-600 font-medium mt-1">{musyrifData.kelas}</p>
            <span className="inline-block mt-2 px-4 py-1 bg-tosca-100 text-tosca-700 rounded-full text-xs font-bold">Musyrif</span>
          </div>

          {/* Data List */}
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Username</p>
                <p className="text-sm font-black text-slate-900">{musyrifData.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                <p className="text-sm font-black text-slate-900">{musyrifData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">NIP</p>
                <p className="text-sm font-black text-slate-900">{musyrifData.nip}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Kelas</p>
                <p className="text-sm font-black text-slate-900">{musyrifData.kelas}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">No. HP</p>
                <p className="text-sm font-black text-slate-900">{musyrifData.nohp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Link href="/login" className="block">
          <button className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </Link>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 sm:px-6 py-2.5 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/musyrif" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Utama</span>
        </Link>
        <Link href="/dashboard/musyrif/setoran" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <BookOpenIcon size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Setoran</span>
        </Link>
        <Link href="/dashboard/musyrif/nilai" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <Star size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/musyrif/presensi" className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 hover:text-tosca-600 transition-colors">
          <CheckSquare size={20} />
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Presensi</span>
        </Link>
        <Link href="/dashboard/musyrif/profil" className="flex flex-col items-center justify-center gap-1 flex-1 text-tosca-600">
          <span className="text-base">👤</span>
          <span className="text-[9px] font-extrabold tracking-tight hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}