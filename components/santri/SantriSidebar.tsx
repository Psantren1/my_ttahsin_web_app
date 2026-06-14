'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/helper';
import {
  Home, BookOpen, Star, ClipboardList, Target, CheckSquare,
  Video, Award, Megaphone, User, LogOut, X, GraduationCap, Calendar,
  BookOpenCheck, BookMarked, RefreshCw
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LEVEL_MENU_SANTRI: Record<string, { icon: any; label: string; href: string }> = {
  BTQ_PEMULA: { icon: BookOpen, label: 'BTQ1', href: '/dashboard/santri/setoran' },
  BTQ_LANJUTAN: { icon: BookOpenCheck, label: 'BTQ2', href: '/dashboard/santri/setoran' },
  TAHSIN: { icon: BookOpen, label: 'Tahsin', href: '/dashboard/santri/setoran' },
  TAHFIDZ: { icon: BookMarked, label: 'Tahfidz', href: '/dashboard/santri/setoran' },
  MUROJAAH: { icon: RefreshCw, label: 'Murojaah', href: '/dashboard/santri/setoran' },
};

export default function SantriSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const level = user?.levelProgram || 'TAHSIN';
  const programItem = LEVEL_MENU_SANTRI[level] || LEVEL_MENU_SANTRI['TAHSIN'];
  const menuItems = [
    { icon: Home, label: 'Beranda', href: '/dashboard/santri' },
    { icon: programItem.icon, label: programItem.label, href: programItem.href },
    { icon: Calendar, label: 'Jadwal', href: '/dashboard/santri/jadwal' },
    { icon: Star, label: 'Nilai', href: '/dashboard/santri/nilai' },
    { icon: ClipboardList, label: 'Evaluasi', href: '/dashboard/santri/evaluasi' },
    { icon: Target, label: 'Target', href: '/dashboard/santri/target' },
    { icon: CheckSquare, label: 'Presensi', href: '/dashboard/santri/presensi' },
    { icon: Video, label: 'Kelas Virtual', href: '/dashboard/santri/virtual-class' },
    { icon: Award, label: 'Sertifikat', href: '/dashboard/santri/sertifikat' },
    { icon: Megaphone, label: 'Informasi', href: '/dashboard/santri/informasi' },
    { icon: User, label: 'Profil', href: '/dashboard/santri/profil' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-surface-200 transition-transform duration-300 ease-in-out flex flex-col',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="bg-tosca-600 p-2 rounded-xl shadow-md">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-tosca-900 block leading-tight">my_ttahsin</span>
              <span className="text-[9px] font-semibold text-surface-400 uppercase tracking-widest">Portal Siswa</span>
            </div>
          </div>
          <button className="lg:hidden p-1.5 text-surface-400 hover:bg-surface-50 rounded-lg" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="mx-3 mt-3 p-3 bg-tosca-50 rounded-2xl border border-tosca-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-tosca-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-tosca-900 text-sm truncate">{user?.fullName || 'Siswa'}</p>
              <p className="text-[10px] text-surface-500 font-medium">Siswa</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all group',
                  isActive
                    ? 'bg-tosca-600 text-white shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-tosca-600'
                )}
              >
                <item.icon size={18} className={cn(isActive ? 'text-white' : 'text-surface-400 group-hover:text-tosca-600')} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-surface-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
