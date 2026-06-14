'use client';

import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { useSettings } from '@/lib/hooks/useSettings';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { settings } = useSettings();
  
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-surface-100">
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-tosca-600 hover:bg-surface-50 rounded-lg lg:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 bg-surface-50 px-3 py-1.5 rounded-xl border border-surface-200">
            <Search size={18} className="text-surface-400" />
            <input 
              type="text" 
              placeholder="Cari sesuatu..." 
              className="bg-transparent border-none focus:ring-0 text-sm text-tosca-900 placeholder:text-surface-400 w-48 md:w-64"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 bg-tosca-50 text-tosca-700 px-3.5 py-1.5 rounded-xl border border-tosca-100 font-semibold text-xs">
            <span>Tahun Ajaran: {settings.tahunAjaran}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative p-2 text-surface-500 hover:bg-surface-50 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-surface-200 hidden sm:block mx-1"></div>
          
          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-tosca-900">Admin Utama</p>
              <p className="text-xs text-surface-500">Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-tosca-100 flex items-center justify-center text-tosca-600 border border-tosca-200 group-hover:bg-tosca-600 group-hover:text-white transition-all">
              <User size={24} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
