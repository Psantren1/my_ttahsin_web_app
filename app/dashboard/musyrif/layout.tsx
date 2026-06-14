'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';
import MusyrifSidebar from '@/components/musyrif/MusyrifSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BottomNav from '@/components/ui/bottom-nav';
import {
  ArrowLeft, GraduationCap, LayoutDashboard, BookOpen, Star,
  CheckSquare, Calendar, User, Menu
} from 'lucide-react';

const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Utama', href: '/dashboard/musyrif' },
  { icon: BookOpen, label: 'Setoran', href: '/dashboard/musyrif/setoran' },
  { icon: Star, label: 'Nilai', href: '/dashboard/musyrif/nilai' },
  { icon: CheckSquare, label: 'Presensi', href: '/dashboard/musyrif/presensi' },
  { icon: User, label: 'Profil', href: '/dashboard/musyrif/profil' },
];

export default function MusyrifLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMainPage = pathname === '/dashboard/musyrif';

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:pb-0">
      <MusyrifSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-72 transition-all duration-300 flex flex-col min-h-screen">
        <DashboardHeader
          isMainPage={isMainPage}
          setSidebarOpen={setSidebarOpen}
          appName={settings.appName}
          panelName="Guru Panel"
          userInitials={user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'M'}
          profileHref="/dashboard/musyrif/profil"
          dashboardHref="/dashboard/musyrif"
        />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom Nav (mobile only) */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
}
