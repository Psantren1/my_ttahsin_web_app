'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ArrowLeft, GraduationCap } from 'lucide-react';

interface DashboardHeaderProps {
  isMainPage: boolean;
  setSidebarOpen: (open: boolean) => void;
  appName: string;
  panelName: string;
  userInitials: string;
  profileHref: string;
  dashboardHref: string;
}

const DashboardHeader = React.memo(({
  isMainPage,
  setSidebarOpen,
  appName,
  panelName,
  userInitials,
  profileHref,
  dashboardHref
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-surface-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 sm:h-16">
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger (mobile) + Back (sub-pages) */}
          {isMainPage ? (
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-surface-500 hover:bg-surface-50 rounded-xl"
            >
              <Menu size={22} />
            </button>
          ) : (
            <Link
              href={dashboardHref}
              className="lg:hidden h-9 w-9 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
          )}

          {/* Logo on main page */}
          {isMainPage ? (
            <div className="flex items-center gap-2.5">
              <div className="bg-tosca-600 p-1.5 rounded-xl shadow-sm shrink-0">
                <GraduationCap className="text-white h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-tosca-900 block leading-tight">{appName}</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-semibold text-surface-400 uppercase tracking-wider">{panelName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href={dashboardHref}
                className="h-9 w-9 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors shrink-0"
              >
                <ArrowLeft size={18} />
              </Link>
              <span className="text-sm font-semibold text-surface-500">Kembali</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isMainPage && (
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-semibold text-surface-400 uppercase tracking-wider">{panelName}</span>
            </div>
          )}
          <Link href={profileHref}>
            <div className="h-9 w-9 rounded-xl bg-tosca-100 flex items-center justify-center text-tosca-600 font-bold text-sm shadow-sm hover:bg-tosca-200 transition-colors cursor-pointer">
              {userInitials}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
