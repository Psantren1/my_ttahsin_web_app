'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MUSYRIF' | 'SANTRI';
  levelProgram?: string | null;
  username?: string;
  nip?: string;
  nis?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  getSantriList: () => Promise<User[]>;
  getMusyrifList: () => Promise<User[]>;
  addSantri: (santri: User & { password: string }) => Promise<{ success: boolean; error?: string }>;
  addMusyrif: (musyrif: User & { password: string }) => Promise<{ success: boolean; error?: string }>;
  deleteSantri: (id: string) => Promise<{ success: boolean }>;
  deleteMusyrif: (id: string) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        if (data?.data) {
          setUser(data.data);
          localStorage.setItem('baitul_user', JSON.stringify(data.data));
        }
      })
      .catch(() => {
        localStorage.removeItem('baitul_user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Login gagal', user: undefined };
      }
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role,
        levelProgram: data.user.levelProgram,
      };
      setUser(userData);
      try { localStorage.setItem('baitul_user', JSON.stringify(userData)); } catch {}
      setIsLoading(false);
      return { success: true, user: userData };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Terjadi kesalahan koneksi', user: undefined };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem('baitul_user');
      localStorage.removeItem('baitul_session');
    } catch {}
    window.location.href = '/login';
  };

  const getSantriList = async (): Promise<User[]> => {
    try {
      const res = await fetch('/api/santri');
      const data = await res.json();
      return (data.data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: 'SANTRI' as const,
        username: u.email,
        nis: u.nis,
      }));
    } catch {
      return [];
    }
  };

  const getMusyrifList = async (): Promise<User[]> => {
    try {
      const res = await fetch('/api/musyrif');
      const data = await res.json();
      return (data.data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: 'MUSYRIF' as const,
        username: u.email,
        nip: u.nip,
      }));
    } catch {
      return [];
    }
  };

  const addSantri = async (santri: User & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/santri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: santri.email,
          password: santri.password,
          full_name: santri.fullName,
          nis: santri.nis,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal menambahkan' };
      return { success: true };
    } catch {
      return { success: false, error: 'Gagal menambahkan akun' };
    }
  };

  const addMusyrif = async (musyrif: User & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/musyrif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: musyrif.email,
          password: musyrif.password,
          full_name: musyrif.fullName,
          nip: musyrif.nip,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal menambahkan' };
      return { success: true };
    } catch {
      return { success: false, error: 'Gagal menambahkan akun' };
    }
  };

  const deleteSantri = async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`/api/santri/${id}`, { method: 'DELETE' });
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  };

  const deleteMusyrif = async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`/api/musyrif/${id}`, { method: 'DELETE' });
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    getSantriList,
    getMusyrifList,
    addSantri,
    addMusyrif,
    deleteSantri,
    deleteMusyrif,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRole(allowedRoles: string[]) {
  const { user } = useAuth();
  return user ? allowedRoles.includes(user.role) : false;
}

export function useProtectedRoute(allowedRoles?: string[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        const roleRoutes: Record<string, string> = {
          ADMIN: '/dashboard/admin',
          MUSYRIF: '/dashboard/musyrif',
          SANTRI: '/dashboard/santri',
        };
        router.replace(roleRoutes[user.role] || '/login');
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  return { user, isLoading };
}
