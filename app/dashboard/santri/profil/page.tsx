'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, User, Mail, BookOpen, Calendar, Phone, Home, Star, Video, Award, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfilSantriPage() {
  const { user } = useAuth();

  // Find additional details from santri_list stored in localStorage
  let matchedSantri: any = null;
  if (typeof window !== 'undefined' && user) {
    const stored = localStorage.getItem('santri_list');
    if (stored) {
      try {
        const santriList = JSON.parse(stored);
        matchedSantri = santriList.find((s: any) => s.id === user.id || s.nis === user.nis);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const profileData = {
    id: user?.id || '',
    nama: user?.fullName || 'Santri',
    nis: user?.nis || '—',
    email: user?.email || '—',
    kelas: matchedSantri?.kelas_nama || 'Halaqah Tahfizh',
    alamat: matchedSantri?.alamat || '—',
    nohp: matchedSantri?.no_wa || '—',
    tanggalLahir: matchedSantri?.tanggalLahir || '—',
    foto: null,
  };
  return (
    <div className="min-h-screen bg-tosca-50/30 flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tosca-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/santri" className="h-10 w-10 rounded-2xl bg-tosca-50 border border-tosca-100 flex items-center justify-center text-tosca-600 hover:bg-tosca-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-base font-black text-tosca-900 block">Profil Santri</span>
              <span className="text-[10px] text-tosca-500 font-medium">Informasi akun</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-tr from-tosca-600 to-teal-500 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-tosca-600 font-black text-3xl">
                AF
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-6 px-6 text-center">
            <h2 className="text-xl font-black text-tosca-900">{profileData.nama}</h2>
            <p className="text-sm text-tosca-600 font-medium mt-1">{profileData.kelas}</p>
            <span className="inline-block mt-2 px-4 py-1 bg-tosca-100 text-tosca-700 rounded-full text-xs font-bold">Santri</span>
          </div>

          {/* Data List */}
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">NIS</p>
                <p className="text-sm font-black text-slate-900">{profileData.nis}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                <p className="text-sm font-black text-slate-900">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Kelas</p>
                <p className="text-sm font-black text-slate-900">{profileData.kelas}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Tanggal Lahir</p>
                <p className="text-sm font-black text-slate-900">{profileData.tanggalLahir}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-tosca-100 text-tosca-600 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">No. HP</p>
                <p className="text-sm font-black text-slate-900">{profileData.nohp}</p>
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-tosca-100 px-3 sm:px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link href="/dashboard/santri" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Home size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Beranda</span>
        </Link>
        <Link href="/dashboard/santri/nilai" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Star size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Nilai</span>
        </Link>
        <Link href="/dashboard/santri/virtual-class" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Video size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Kelas Virtual</span>
        </Link>
        <Link href="/dashboard/santri/sertifikat" className="flex flex-col items-center gap-1 flex-1 text-tosca-400 hover:text-tosca-600 transition-colors">
          <Award size={20} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Sertifikat</span>
        </Link>
        <Link href="/dashboard/santri/profil" className="flex flex-col items-center gap-1 flex-1 text-tosca-600">
          <User size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold hidden sm:inline">Profil</span>
        </Link>
      </nav>
    </div>
  );
}