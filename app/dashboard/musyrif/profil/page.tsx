import React from 'react';
import Link from 'next/link';
import { User, Mail, Phone, BookOpen, Calendar, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth/auth';
import { getUserById } from '@/lib/services/user.service';
import { redirect } from 'next/navigation';

export default async function ProfilPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'MUSYRIF') {
    redirect('/login');
  }

  const user = await getUserById(session.userId);
  
  if (!user) {
    redirect('/login');
  }

  const musyrifData = {
    id: user.id,
    nama: user.full_name,
    username: user.username || '—',
    email: user.email,
    nip: user.nip || '—',
    nohp: user.no_wa || '—',
    kelas: user.kelas_nama || 'Halaqah Binaan',
    tanggalLahir: '—', // Not in UserRow, but could be added if needed
    alamat: '—', // Not in UserRow, but could be added if needed
    foto: null
  };

  const avatarInitials = musyrifData.nama
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-tr from-tosca-600 to-tosca-500 relative">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-tosca-600 font-black text-3xl">
              {avatarInitials}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-6 px-6 text-center">
          <h2 className="text-xl font-black text-slate-900">{musyrifData.nama}</h2>
          <p className="text-sm text-tosca-600 font-medium mt-1">{musyrifData.kelas}</p>
          <span className="inline-block mt-2 px-4 py-1 bg-tosca-100 text-tosca-700 rounded-full text-xs font-bold">Guru</span>
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
    </>
  );
}
