'use client';

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem('baitul_user'); } catch {}
  const currentPath = window.location.pathname + window.location.search;
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}

export async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    redirectToLogin();
    throw new Error('Sesi telah berakhir. Silakan login ulang.');
  }
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed: ${res.status}`);
  }
  return res.json();
}
