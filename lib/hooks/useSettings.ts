'use client';

import { useSettingsData } from './useApi';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

export interface AppSettings {
  appName: string;
  systemInfo: string;
  logoUrl: string;
  pwaIconUrl: string;
  tahunAjaran: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Manajemen Al-Quran',
  systemInfo: 'Sistem Manajemen Tahsin',
  logoUrl: '',
  pwaIconUrl: '',
  tahunAjaran: '2024/2025',
};

export function useSettings() {
  const qc = useQueryClient();
  const { data: raw } = useSettingsData();

  const settings: AppSettings = { ...DEFAULT_SETTINGS, ...raw?.data };

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    await apiFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    qc.invalidateQueries({ queryKey: ['settings'] });
  };

  return { settings, saveSettings };
}
