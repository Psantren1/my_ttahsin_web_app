'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, BookMarked, ScrollText, Star, Layers, ArrowLeft } from 'lucide-react';

interface Tab {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const TABS: Tab[] = [
  { key: 'TAHSIN', label: 'Tahsin', href: '/dashboard/admin/hafalan', icon: <BookOpen size={18} />, color: 'from-tosca-900 to-tosca-800' },
  { key: 'BTQ_PEMULA', label: 'BTQ Pemula', href: '/dashboard/admin/btq-pemula', icon: <BookMarked size={18} />, color: 'from-emerald-700 to-emerald-600' },
  { key: 'BTQ_LANJUTAN', label: 'BTQ Lanjutan', href: '/dashboard/admin/btq-lanjutan', icon: <Layers size={18} />, color: 'from-blue-700 to-blue-600' },
  { key: 'TAHFIDZ', label: 'Tahfidz', href: '/dashboard/admin/tahfidz', icon: <ScrollText size={18} />, color: 'from-purple-700 to-purple-600' },
  { key: 'MUROJAAH', label: 'Murojaah', href: '/dashboard/admin/murojaah', icon: <Star size={18} />, color: 'from-amber-700 to-amber-600' },
];

export default function ManajemenNilai() {
  const [activeTab, setActiveTab] = useState('TAHSIN');
  const active = TABS.find(t => t.key === activeTab) || TABS[0];

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900">Manajemen Nilai</h1>
            <p className="text-tosca-600 font-medium">Pantau dan kelola nilai santri per level program.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${active.color} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{active.label}</h2>
                <p className="text-sm opacity-80">Kelola data nilai {active.label.toLowerCase()}</p>
              </div>
              <div className="opacity-30">
                {active.icon}
              </div>
            </div>
          </div>

          <div className="p-8 text-center">
            <div className="p-4 bg-tosca-50 rounded-2xl inline-flex mb-4">
              {active.icon}
            </div>
            <h3 className="text-lg font-bold text-tosca-900 mb-2">Halaman Manajemen {active.label}</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Klik tombol di bawah untuk membuka halaman manajemen {active.label.toLowerCase()} secara lengkap.
            </p>
            <Link
              href={active.href}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-tosca-600 text-white rounded-2xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-100"
            >
              <ArrowLeft size={18} className="rotate-180" />
              Buka Manajemen {active.label}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
