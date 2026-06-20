'use client';

let isRedirecting = false;

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (isRedirecting) return;
  isRedirecting = true;

  try { localStorage.removeItem('baitul_user'); } catch {}

  const currentPath = window.location.pathname + window.location.search;

  if (currentPath.startsWith('/login')) {
    isRedirecting = false;
    return;
  }

  const redirectParam = encodeURIComponent(currentPath.slice(0, 200));
  window.location.href = `/login?redirect=${redirectParam}`;
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
