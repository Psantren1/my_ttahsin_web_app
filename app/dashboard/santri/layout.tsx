'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';
import SantriSidebar from '@/components/santri/SantriSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BottomNav from '@/components/ui/bottom-nav';
import {
  ArrowLeft, GraduationCap, Home, BookOpen, Star,
  CheckSquare, Video, User, Menu
} from 'lucide-react';

const bottomNavItems = [
  { icon: Home, label: 'Beranda', href: '/dashboard/santri' },
  { icon: Star, label: 'Nilai', href: '/dashboard/santri/nilai' },
  { icon: CheckSquare, label: 'Presensi', href: '/dashboard/santri/presensi' },
  { icon: Video, label: 'Kelas Virtual', href: '/dashboard/santri/virtual-class' },
  { icon: User, label: 'Profil', href: '/dashboard/santri/profil' },
];

export default function SantriLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMainPage = pathname === '/dashboard/santri';

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:pb-0">
      <SantriSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-72 transition-all duration-300 flex flex-col min-h-screen">
        <DashboardHeader
          isMainPage={isMainPage}
          setSidebarOpen={setSidebarOpen}
          appName={settings.appName}
          panelName="Portal Siswa"
          userInitials={user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'S'}
          profileHref="/dashboard/santri/profil"
          dashboardHref="/dashboard/santri"
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      <BottomNav items={bottomNavItems} />
    </div>
  );
}
