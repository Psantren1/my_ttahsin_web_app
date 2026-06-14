'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  Calendar,
  GraduationCap,
  FileText,
  Award,
  Settings,
  LogOut,
  X,
  School,
  BookOpen,
  BookMarked,
  ClipboardList,
  RefreshCw,
  Megaphone,
  ArrowUpDown
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin' },
  { icon: Users, label: 'Manajemen Siswa', href: '/dashboard/admin/santri' },
  { icon: UserSquare2, label: 'Manajemen Guru', href: '/dashboard/admin/musyrif' },
  { icon: School, label: 'Manajemen Kelas', href: '/dashboard/admin/kelas' },
  { icon: Calendar, label: 'Manajemen Jadwal', href: '/dashboard/admin/jadwal' },
  { icon: BookOpen, label: 'Manajemen BTQ Pemula', href: '/dashboard/admin/btq-pemula' },
  { icon: BookOpen, label: 'Manajemen BTQ Lanjutan', href: '/dashboard/admin/btq-lanjutan' },
  { icon: BookOpen, label: 'Manajemen Tahsin', href: '/dashboard/admin/hafalan' },
  { icon: BookMarked, label: 'Manajemen Tahfidz', href: '/dashboard/admin/tahfidz' },
  { icon: RefreshCw, label: 'Manajemen Murojaah', href: '/dashboard/admin/murojaah' },
  { icon: ClipboardList, label: 'Manajemen Kehadiran', href: '/dashboard/admin/kehadiran' },
  { icon: GraduationCap, label: 'Manajemen Nilai', href: '/dashboard/admin/nilai' },
  { icon: ArrowUpDown, label: 'Manajemen Naik Kelas', href: '/dashboard/admin/naik-kelas' },
  { icon: Award, label: 'Sertifikat', href: '/dashboard/admin/sertifikat' },
  { icon: Megaphone, label: 'Informasi & Pengumuman', href: '/dashboard/admin/informasi' },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-surface-200 transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl overflow-hidden flex items-center justify-center ${settings.logoUrl ? 'h-10 w-10 bg-white border border-surface-200' : 'bg-tosca-600 h-10 w-10'}`}>
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <GraduationCap className="text-white h-6 w-6" />
                )}
              </div>
              <span className="text-lg font-bold text-tosca-900">{settings.appName}</span>
            </div>
            <button 
              className="lg:hidden p-2 text-surface-500 hover:bg-surface-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                    ${isActive 
                      ? 'bg-tosca-600 text-white shadow-md shadow-tosca-200' 
                      : 'text-surface-600 hover:bg-surface-50 hover:text-tosca-600'}
                  `}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-surface-400 group-hover:text-tosca-600'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-surface-100 space-y-1">
            <Link
              href="/dashboard/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 hover:bg-surface-50 transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Pengaturan</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
