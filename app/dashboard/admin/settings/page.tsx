'use client';

import React, { useState, useEffect, useRef } from 'react';

import { useSettings } from '@/lib/hooks/useSettings';
import { 
  Save, 
  Camera, 
  CheckCircle2,
  Settings,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function Pengaturan() {
  const [showToast, setShowToast] = useState(false);
  const { settings, saveSettings } = useSettings();

  // Form states
  const [appName, setAppName] = useState('');
  const [systemInfo, setSystemInfo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [pwaIconUrl, setPwaIconUrl] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const pwaInputRef = useRef<HTMLInputElement>(null);

  // Sync state with settings hook on load/change
  useEffect(() => {
    if (settings) {
      setAppName(settings.appName);
      setSystemInfo(settings.systemInfo);
      setLogoUrl(settings.logoUrl);
      setPwaIconUrl(settings.pwaIconUrl);
      setTahunAjaran(settings.tahunAjaran);
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePwaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPwaIconUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      appName,
      systemInfo,
      logoUrl,
      pwaIconUrl,
      tahunAjaran,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Header Card with White Background */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900">Pengaturan Aplikasi</h1>
              <p className="text-tosca-600 font-medium">Ubah nama aplikasi, informasi sistem, logo, dan ikon PWA secara reaktif.</p>
            </div>
            {showToast && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-2xl shadow-lg animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={20} />
                <span className="text-sm font-bold">Pengaturan Tersimpan!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity Settings */}
            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                <Settings className="text-tosca-600 w-6 h-6" />
                <h2 className="text-xl font-bold text-tosca-900">Identitas Aplikasi</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-tosca-900 ml-1">Nama Aplikasi (Manajemen Al-Quran)</label>
                  <input 
                    type="text" 
                    value={appName} 
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Manajemen Al-Quran"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-surface-100 focus:border-tosca-600 focus:ring-0 text-sm font-bold text-black transition-all bg-tosca-50/20" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-tosca-900 ml-1">Informasi Sistem</label>
                  <input 
                    type="text" 
                    value={systemInfo} 
                    onChange={(e) => setSystemInfo(e.target.value)}
                    placeholder="Sistem Manajemen Tahsin"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-surface-100 focus:border-tosca-600 focus:ring-0 text-sm font-bold text-black transition-all bg-tosca-50/20" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-tosca-900 ml-1">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    value={tahunAjaran} 
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    placeholder="2024/2025"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-surface-100 focus:border-tosca-600 focus:ring-0 text-sm font-bold text-black transition-all bg-tosca-50/20" 
                  />
                </div>
              </div>
            </div>

            {/* Assets Settings (Logo and PWA) */}
            <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
                <Sparkles className="text-tosca-600 w-6 h-6" />
                <h2 className="text-xl font-bold text-tosca-900">Aset Visual Aplikasi</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Section */}
                <div className="flex flex-col items-center p-6 bg-tosca-50/10 rounded-3xl border border-dashed border-tosca-200">
                  <span className="text-sm font-bold text-tosca-900 mb-4">Logo Aplikasi</span>
                  
                  <div className="relative group mb-6">
                    {logoUrl ? (
                      <div className="h-28 w-28 rounded-3xl bg-white border border-tosca-100 flex items-center justify-center p-4 shadow-md transition-transform group-hover:scale-105">
                        <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-28 w-28 rounded-3xl bg-tosca-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-tosca-100 transition-transform group-hover:scale-105">
                        {appName ? appName.charAt(0) : 'B'}
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-xl border border-tosca-100 text-tosca-600 hover:bg-tosca-900 hover:text-white transition-all cursor-pointer"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-tosca-500 font-medium text-center max-w-[200px]">
                    Klik ikon kamera untuk mengunggah logo kustom (.png, .jpg, .svg).
                  </p>
                </div>

                {/* PWA Icon Section */}
                <div className="flex flex-col items-center p-6 bg-tosca-50/10 rounded-3xl border border-dashed border-tosca-200">
                  <span className="text-sm font-bold text-tosca-900 mb-4">Ikon PWA</span>
                  
                  <div className="relative group mb-6">
                    {pwaIconUrl ? (
                      <div className="h-28 w-28 rounded-3xl bg-white border border-tosca-100 flex items-center justify-center p-4 shadow-md transition-transform group-hover:scale-105">
                        <img src={pwaIconUrl} alt="PWA Icon" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-28 w-28 rounded-3xl bg-tosca-600 flex items-center justify-center text-white shadow-lg shadow-tosca-100 transition-transform group-hover:scale-105">
                        <Smartphone size={44} className="stroke-[2.2]" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={pwaInputRef} 
                      onChange={handlePwaUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <button 
                      type="button"
                      onClick={() => pwaInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-xl border border-tosca-100 text-tosca-600 hover:bg-tosca-900 hover:text-white transition-all cursor-pointer"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-tosca-500 font-medium text-center max-w-[200px]">
                    Unggah ikon PWA untuk pintasan mobile browser dan shortcut aplikasi.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-tosca-900 text-white py-5 rounded-3xl font-bold text-lg shadow-xl shadow-tosca-100 hover:bg-black transition-all active:scale-[0.98] cursor-pointer"
            >
              <Save size={24} />
              Simpan Semua Perubahan
            </button>
          </form>
        </main>
    </>
  );
}
