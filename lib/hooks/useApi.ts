import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

async function fetcher<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url);
}

async function poster<T = any>(url: string, body: any): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function putter<T = any>(url: string, body: any): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function deleter<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'DELETE' });
}

// ─── Query Key Factory ────────────────────────────────────────────

export const apiKeys = {
  santri: {
    all: ['santri'] as const,
  },
  musyrif: {
    all: ['musyrif'] as const,
  },
  kelas: {
    all: ['kelas'] as const,
  },
  setoran: {
    all: ['setoran'] as const,
    bySantri: (id: string) => ['setoran', 'santri', id] as const,
    byMusyrif: (id: string) => ['setoran', 'musyrif', id] as const,
  },
  jadwal: {
    all: ['jadwal'] as const,
  },
  sertifikat: {
    all: ['sertifikat'] as const,
  },
  target: {
    all: ['target'] as const,
  },
  absensi: {
    all: ['absensi'] as const,
  },
  evaluasi: {
    all: ['evaluasi'] as const,
  },
  informasi: {
    byRole: (role: string) => ['informasi', role] as const,
  },
  zoom: {
    all: ['zoom-meetings'] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  btqPemula: {
    all: ['btq-pemula'] as const,
    byKelas: (id: string) => ['btq-pemula', 'kelas', id] as const,
  },
  btqLanjutan: {
    all: ['btq-lanjutan'] as const,
    byKelas: (id: string) => ['btq-lanjutan', 'kelas', id] as const,
  },
  tahfidz: {
    all: ['tahfidz'] as const,
    byKelas: (id: string) => ['tahfidz', 'kelas', id] as const,
  },
  murojaah: {
    all: ['murojaah'] as const,
    byKelas: (id: string) => ['murojaah', 'kelas', id] as const,
  },
};

// ─── Query Hooks ───────────────────────────────────────────────────

export function useSantriList() {
  return useQuery({
    queryKey: apiKeys.santri.all,
    queryFn: () => fetcher<any>('/api/santri'),
  });
}

export function useMusyrifList() {
  return useQuery({
    queryKey: apiKeys.musyrif.all,
    queryFn: () => fetcher<any>('/api/musyrif'),
  });
}

export function useKelasList() {
  return useQuery({
    queryKey: apiKeys.kelas.all,
    queryFn: () => fetcher<any>('/api/kelas'),
  });
}

export function useSetoranList(params?: { santuario_id?: string; musyrif_id?: string }) {
  let url = '/api/setoran';
  if (params?.santuario_id) url += `?santuario_id=${params.santuario_id}`;
  else if (params?.musyrif_id) url += `?musyrif_id=${params.musyrif_id}`;
  return useQuery({
    queryKey: params?.santuario_id
      ? apiKeys.setoran.bySantri(params.santuario_id)
      : params?.musyrif_id
      ? apiKeys.setoran.byMusyrif(params.musyrif_id)
      : apiKeys.setoran.all,
    queryFn: () => fetcher<any>(url),
  });
}

export function useJadwalList() {
  return useQuery({
    queryKey: apiKeys.jadwal.all,
    queryFn: () => fetcher<any>('/api/jadwal'),
  });
}

export function useSertifikatList() {
  return useQuery({
    queryKey: apiKeys.sertifikat.all,
    queryFn: () => fetcher<any>('/api/sertifikat'),
  });
}

export function useTargetList() {
  return useQuery({
    queryKey: apiKeys.target.all,
    queryFn: () => fetcher<any>('/api/target'),
  });
}

export function useAbsensiList() {
  return useQuery({
    queryKey: apiKeys.absensi.all,
    queryFn: () => fetcher<any>('/api/absensi'),
  });
}

export function useEvaluasiList() {
  return useQuery({
    queryKey: apiKeys.evaluasi.all,
    queryFn: () => fetcher<any>('/api/evaluasi'),
  });
}

export function useInformasiList(role?: string) {
  const url = role ? `/api/informasi?target_role=${role}` : '/api/informasi';
  return useQuery({
    queryKey: role ? apiKeys.informasi.byRole(role) : ['informasi'],
    queryFn: () => fetcher<any>(url),
  });
}

export function useZoomMeetingsList() {
  return useQuery({
    queryKey: apiKeys.zoom.all,
    queryFn: () => fetcher<any>('/api/zoom-meetings'),
  });
}

export function useSettingsData() {
  return useQuery({
    queryKey: apiKeys.settings.all,
    queryFn: () => fetcher<any>('/api/settings'),
  });
}

// ─── Mutation Hooks ────────────────────────────────────────────────

export function useCreateSantri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/santri', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.santri.all }),
  });
}

export function useCreateMusyrif() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/musyrif', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.musyrif.all }),
  });
}

export function useCreateKelas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/kelas', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.kelas.all }),
  });
}

export function useKelasDetail(id: string) {
  return useQuery({
    queryKey: ['kelas', id] as const,
    queryFn: () => fetcher<any>(`/api/kelas/${id}`),
  });
}

export function useUpdateKelas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => putter(`/api/kelas/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.kelas.all }),
  });
}

export function useDeleteKelas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleter(`/api/kelas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.kelas.all }),
  });
}

export function useBulkReassign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { santri_ids: string[]; to_kelas_id: string }) =>
      poster('/api/kelas/bulk-reassign', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeys.kelas.all });
      qc.invalidateQueries({ queryKey: apiKeys.santri.all });
    },
  });
}

export function useCreateSetoran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/setoran', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.setoran.all }),
  });
}

export function useCreateSertifikat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/sertifikat', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.sertifikat.all }),
  });
}

export function useUpdateSertifikat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => putter(`/api/sertifikat/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.sertifikat.all }),
  });
}

export function useCreateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/target', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.target.all }),
  });
}

export function useCreateAbsensi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/absensi', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.absensi.all }),
  });
}

export function useCreateEvaluasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/evaluasi', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.evaluasi.all }),
  });
}

export function useCreateJadwal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/jadwal', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.jadwal.all }),
  });
}

export function useCreateInformasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/informasi', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['informasi'] }),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => putter('/api/settings', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.settings.all }),
  });
}

export function useCreateZoomMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/zoom-meetings', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.zoom.all }),
  });
}

// ─── BTQ Pemula ─────────────────────────────────────────────────────

export function useBtqPemulaList(params?: { kelas_id?: string; musyrif_id?: string }) {
  let url = '/api/btq-pemula';
  if (params?.musyrif_id) url += `?musyrif_id=${params.musyrif_id}`;
  else if (params?.kelas_id) url += `?kelas_id=${params.kelas_id}`;
  return useQuery({
    queryKey: params?.kelas_id ? apiKeys.btqPemula.byKelas(params.kelas_id) : apiKeys.btqPemula.all,
    queryFn: () => fetcher<any>(url),
  });
}

export function useCreateBtqPemula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/btq-pemula', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.btqPemula.all }),
  });
}

// ─── BTQ Lanjutan ───────────────────────────────────────────────────

export function useBtqLanjutanList(params?: { kelas_id?: string; musyrif_id?: string }) {
  let url = '/api/btq-lanjutan';
  if (params?.musyrif_id) url += `?musyrif_id=${params.musyrif_id}`;
  else if (params?.kelas_id) url += `?kelas_id=${params.kelas_id}`;
  return useQuery({
    queryKey: params?.kelas_id ? apiKeys.btqLanjutan.byKelas(params.kelas_id) : apiKeys.btqLanjutan.all,
    queryFn: () => fetcher<any>(url),
  });
}

export function useCreateBtqLanjutan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/btq-lanjutan', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.btqLanjutan.all }),
  });
}

// ─── Tahfidz ─────────────────────────────────────────────────────

export function useTahfidzList(params?: { kelas_id?: string; musyrif_id?: string }) {
  let url = '/api/tahfidz';
  if (params?.musyrif_id) url += `?musyrif_id=${params.musyrif_id}`;
  else if (params?.kelas_id) url += `?kelas_id=${params.kelas_id}`;
  return useQuery({
    queryKey: params?.kelas_id ? apiKeys.tahfidz.byKelas(params.kelas_id) : apiKeys.tahfidz.all,
    queryFn: () => fetcher<any>(url),
  });
}

export function useCreateTahfidz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/tahfidz', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.tahfidz.all }),
  });
}

// ─── Murojaah ────────────────────────────────────────────────────

export function useMurojaahList(params?: { kelas_id?: string; musyrif_id?: string }) {
  let url = '/api/murojaah';
  if (params?.musyrif_id) url += `?musyrif_id=${params.musyrif_id}`;
  else if (params?.kelas_id) url += `?kelas_id=${params.kelas_id}`;
  return useQuery({
    queryKey: params?.kelas_id ? apiKeys.murojaah.byKelas(params.kelas_id) : apiKeys.murojaah.all,
    queryFn: () => fetcher<any>(url),
  });
}

export function useCreateMurojaah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => poster('/api/murojaah', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.murojaah.all }),
  });
}
