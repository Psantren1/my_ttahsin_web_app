'use client';

import React, { useState } from 'react';
import { BookOpen, User, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings } from '@/lib/hooks/useSettings';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success && result.user) {
      switch (result.user.role) {
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'MUSYRIF':
          router.push('/dashboard/musyrif');
          break;
        case 'SANTRI':
          router.push('/dashboard/santri');
          break;
        default:
          router.push('/');
      }
    } else {
      setError(result.error || 'Login gagal');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ─── Left: Form Side ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-tosca-50 via-white to-tosca-100 px-5 py-8 sm:py-12 relative">
        {/* subtle bg decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[30%] w-[60%] h-[60%] rounded-full bg-tosca-100/30 blur-3xl" />
          <div className="absolute -bottom-[30%] -right-[30%] w-[60%] h-[60%] rounded-full bg-tosca-200/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm sm:max-w-md">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl shadow-lg shadow-tosca-200/50 mb-5 overflow-hidden ${settings.logoUrl ? 'bg-white p-3 border border-tosca-100' : 'bg-gradient-to-br from-tosca-500 to-tosca-700'}`}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <BookOpen className="w-8 h-8 sm:w-11 sm:h-11 text-white" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tosca-900 text-center">
              {settings.appName}
            </h1>
            <p className="text-sm sm:text-base text-tosca-500 font-medium text-center mt-1">
              {settings.systemInfo}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium border border-red-100 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="relative group">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-tosca-700 mb-1.5 ml-1">
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-tosca-400 group-focus-within:text-tosca-600 transition-colors">
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-tosca-200 py-3 sm:py-3.5 pl-10 sm:pl-11 pr-4 text-sm sm:text-base text-tosca-900 placeholder:text-tosca-300 focus:outline-none focus:ring-2 focus:ring-tosca-500/40 focus:border-tosca-500 bg-white transition-all"
                  placeholder="Masukkan email atau username"
                />
              </div>
            </div>

            <div className="relative group">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-tosca-700">
                  Password
                </label>
                <button type="button" className="text-[11px] text-tosca-500 hover:text-tosca-700 font-medium transition-colors">
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-tosca-400 group-focus-within:text-tosca-600 transition-colors">
                  <Lock size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-tosca-200 py-3 sm:py-3.5 pl-10 sm:pl-11 pr-10 sm:pr-11 text-sm sm:text-base text-tosca-900 placeholder:text-tosca-300 focus:outline-none focus:ring-2 focus:ring-tosca-500/40 focus:border-tosca-500 bg-white transition-all"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-tosca-400 hover:text-tosca-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-[20px] sm:h-[20px]" /> : <Eye size={18} className="sm:w-[20px] sm:h-[20px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-tosca-600 hover:bg-tosca-700 text-white py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-tosca-200/50 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] sm:text-xs text-tosca-400 mt-6 leading-relaxed">
            {settings.appName} v1.0 &copy; 2026
          </p>
        </div>
      </div>

      {/* ─── Right: Visual Side ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-tosca-700 via-tosca-800 to-tosca-900 items-center justify-center p-12 relative overflow-hidden">
        {/* geometric patterns */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <polygon points="60,0 120,60 60,120 0,60" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="60" cy="60" r="30" fill="none" stroke="white" strokeWidth="0.5" />
                <line x1="30" y1="30" x2="90" y2="90" stroke="white" strokeWidth="0.3" />
                <line x1="90" y1="30" x2="30" y2="90" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#islamic)" />
          </svg>
        </div>

        {/* large decorative blobs */}
        <div className="absolute top-[15%] right-[10%] w-80 h-80 rounded-full bg-tosca-500/20 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[5%] w-64 h-64 rounded-full bg-tosca-400/15 blur-[80px]" />

        {/* center content */}
        <div className="relative text-center max-w-md">
          <div className="mb-8">
            <svg className="w-20 h-20 mx-auto text-tosca-200/60" viewBox="0 0 100 100" fill="none">
              <path d="M50 5C50 5 25 25 10 50C5 60 5 75 15 85C25 95 40 95 50 85C60 95 75 95 85 85C95 75 95 60 90 50C75 25 50 5 50 5Z" stroke="currentColor" strokeWidth="3" />
              <path d="M50 20C50 20 35 35 28 50C25 57 25 65 30 70C35 75 43 75 50 70C57 75 65 75 70 70C75 65 75 57 72 50C65 35 50 20 50 20Z" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="5" x2="50" y2="20" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-relaxed">
            Selamat Datang
          </h2>

          <p className="text-tosca-200/80 text-base leading-relaxed mb-10">
            &ldquo;Sebaik-baik kamu adalah orang yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
          </p>

          <div className="flex justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-tosca-400/60" />
            <span className="w-2 h-2 rounded-full bg-tosca-200/80" />
            <span className="w-2 h-2 rounded-full bg-tosca-400/60" />
          </div>
        </div>
      </div>
    </div>
  );
}