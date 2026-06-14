'use client';

import React, { useState } from 'react';
import { AdminCard, CardHeader } from '@/components/ui/admin-card';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Users,
  UserSquare2,
  GraduationCap,
  TrendingUp,
  Calendar as CalendarIcon,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CheckCircle2,
  X,
  ChevronRight,
  BookOpen,
  MessageSquare,
  FileText,
  School,
  Activity,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  useSantriList,
  useMusyrifList,
  useKelasList,
  useSetoranList,
  useJadwalList,
  useCreateKelas,
  useCreateSantri,
  useCreateMusyrif,
} from '@/lib/hooks/useApi';

const DetailAktivitasModal = dynamic(() => import('@/components/dashboard/admin/DetailAktivitasModal'), { ssr: false });
const QuickAddModal = dynamic(() => import('@/components/dashboard/admin/QuickAddModal'), { ssr: false });

const DAY_NAMES = ['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];

function formatJam(t: string) {
  if (!t) return '—';
  return t.slice(0, 5);
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'hafalan': return <BookOpen size={20} className="text-tosca-600" />;
    case 'sertifikat': return <GraduationCap size={20} className="text-orange-600" />;
    case 'jadwal': return <CalendarIcon size={20} className="text-blue-600" />;
    default: return <Activity size={20} className="text-tosca-600" />;
  }
};

export default function AdminDashboard() {

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Data Berhasil Ditambah!');
  const [quickType, setQuickType] = useState('Siswa');
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickKeterangan, setQuickKeterangan] = useState('');

  const { data: santriRes, isLoading: santriLoading } = useSantriList();
  const { data: musyrifRes, isLoading: musyrifLoading } = useMusyrifList();
  const { data: kelasRes, isLoading: kelasLoading } = useKelasList();
  const { data: setoranRes, isLoading: setoranLoading } = useSetoranList();
  const { data: jadwalRes, isLoading: jadwalLoading } = useJadwalList();

  const isLoading = santriLoading || musyrifLoading || kelasLoading || setoranLoading || jadwalLoading;

  const createKelas = useCreateKelas();
  const createSantri = useCreateSantri();
  const createMusyrif = useCreateMusyrif();

  const isSubmitting = createKelas.isPending || createSantri.isPending || createMusyrif.isPending;

  const santriList = santriRes?.data || [];
  const musyrifList = musyrifRes?.data || [];
  const kelasList = kelasRes?.data || [];

  const totalSantri = santriList.length;
  const totalMusyrif = musyrifList.length;
  const totalKelas = kelasList.length;
  const setoranData = setoranRes?.data || [];
  const totalRata = setoranData.reduce((sum: number, r: any) => sum + (Number(r.rata_rata) || 0), 0);
  const avgRata = setoranData.length > 0 ? (totalRata / setoranData.length).toFixed(1) : '0';

  const changes = { santri: '+0', musyrif: '+0', kelas: '+0', nilai: '+0.0' };

  const todayName = DAY_NAMES[new Date().getDay()];
  const todayJadwal = (jadwalRes?.data || [])
    .filter((j: any) => j.hari === todayName)
    .slice(0, 3);

  const activitiesList = setoranData.slice(0, 5).map((r: any, idx: number) => ({
    id: r.id || idx.toString(),
    type: 'Tahsin',
    user: 'Guru',
    action: 'menilai setoran',
    target: r.santri_name || '-',
    time: r.created_at || 'Baru saja',
    status: r.status === 'LANJUT' ? 'Lancar' : 'Ulang',
    detail: `Siswa ${r.santri_name || '-'} menyetorkan ${r.surah || '—'} dengan rata-rata ${(r.rata_rata || 0).toFixed(1)}.`
  }));

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    try {
      let mutation;
      let payload: any;
      if (quickType === 'Kelas') {
        mutation = createKelas;
        payload = { nama: quickName.trim(), level: parseInt(quickKeterangan) || 7 };
      } else if (quickType === 'Siswa') {
        mutation = createSantri;
        const email = quickEmail.trim() || `${quickName.trim().toLowerCase().replace(/\s+/g, '.')}@baitulhuffaz.sch.id`;
        payload = { full_name: quickName.trim(), email, nis: quickKeterangan.trim() };
      } else {
        mutation = createMusyrif;
        const email = quickEmail.trim() || `${quickName.trim().toLowerCase().replace(/\s+/g, '.')}@baitulhuffaz.sch.id`;
        payload = { full_name: quickName.trim(), email, nip: quickKeterangan.trim() };
      }
      await mutation.mutateAsync(payload);
      setToastMsg('Data Berhasil Ditambah!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsQuickAddOpen(false);
      setQuickName(''); setQuickEmail(''); setQuickKeterangan('');
    } catch (e) {
      console.error(e);
      setToastMsg('Gagal menambah data. Cek kembali input.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const dashboardStats = [
    {
      label: 'Total Siswa',
      value: totalSantri.toString(),
      icon: Users,
      change: changes.santri,
      isPositive: !changes.santri.startsWith('-'),
      color: 'bg-tosca-100 text-tosca-600',
      href: '/dashboard/admin/santri',
      description: 'Siswa aktif terdaftar',
      progress: Math.min((totalSantri / 200) * 100, 100),
    },
    {
      label: 'Total Guru',
      value: totalMusyrif.toString(),
      icon: UserSquare2,
      change: changes.musyrif,
      isPositive: !changes.musyrif.startsWith('-'),
      color: 'bg-tosca-50 text-tosca-600',
      href: '/dashboard/admin/musyrif',
      description: 'Guru & pengajar aktif',
      progress: Math.min((totalMusyrif / 50) * 100, 100),
    },
    {
      label: 'Total Kelas',
      value: totalKelas.toString(),
      icon: School,
      change: changes.kelas,
      isPositive: !changes.kelas.startsWith('-'),
      color: 'bg-surface-100 text-surface-600',
      href: '/dashboard/admin/kelas',
      description: 'Kelas/halaqah aktif',
      progress: Math.min((totalKelas / 30) * 100, 100),
    },
    {
      label: 'Rata-rata Nilai',
      value: avgRata,
      icon: BookOpen,
      change: changes.nilai,
      isPositive: !changes.nilai.startsWith('-'),
      color: 'bg-tosca-100 text-tosca-600',
      href: '/dashboard/admin/nilai',
      description: 'Rata-rata nilai setoran Tahsin',
      progress: (Number(avgRata) / 100) * 100,
    },
  ];

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Toast */}
          {showToast && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-tosca-600 text-white px-5 py-3 rounded-2xl shadow-xl animate-fade-in-up">
              <CheckCircle2 size={18} />
              <span className="text-sm font-semibold">{toastMsg}</span>
            </div>
          )}

          <CardHeader
            icon={<Activity size={28} className="text-tosca-600" />}
            title="Dashboard Admin"
            description="Ringkasan aktivitas hari ini"
            action={
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-tosca-600 text-white rounded-2xl font-semibold text-sm hover:bg-tosca-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={18} />
                Tambah Cepat
              </button>
            }
          />

          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat) => (
                <Link key={stat.label} href={stat.href}>
                  <AdminCard padding="md" className="hover:border-tosca-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon size={22} />
                      </div>
                      <div className={`flex items-center gap-0.5 text-xs font-semibold ${stat.isPositive ? 'text-tosca-600' : 'text-red-500'}`}>
                        {stat.change}
                        {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      </div>
                    </div>
                    <h3 className="text-surface-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</h3>
                    <p className="text-2xl font-bold text-tosca-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-surface-400 mt-1">{stat.description}</p>
                    <div className="mt-3 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tosca-500 rounded-full transition-all duration-700"
                        style={{ width: `${stat.progress}%` }}
                      />
                    </div>
                  </AdminCard>
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <AdminCard padding="none" variant="default" className="overflow-hidden">
                <div className="p-6 border-b border-surface-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-tosca-900">Aktivitas Terbaru</h2>
                  <Link href="/dashboard/admin/nilai" className="text-tosca-600 text-sm font-medium hover:text-tosca-800 transition-colors">
                    Lihat Semua
                  </Link>
                </div>
                {isLoading ? (
                  <TableSkeleton rows={3} cols={3} />
                ) : activitiesList.length === 0 ? (
                  <EmptyState
                    title="Belum ada aktivitas Tahsin"
                    description="Data setoran akan muncul di sini setelah guru mulai menilai."
                  />
                ) : (
                    <div className="divide-y divide-surface-100">
                      {activitiesList.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedActivity(item)}
                        className="p-5 flex items-start gap-4 hover:bg-surface-50 transition-all cursor-pointer group"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-white border border-surface-200 shadow-sm flex items-center justify-center group-hover:scale-110 transition-all">
                          {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-tosca-900 group-hover:text-tosca-600 transition-colors">
                            <span className="text-surface-700">{item.user}</span>{' '}
                            <span className="text-surface-500 font-normal">{item.action}</span>{' '}
                            {item.target}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-surface-400 font-medium flex items-center gap-1">
                              <Clock size={10} />
                              {item.time}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              item.status === 'Lancar' ? 'bg-tosca-100 text-tosca-700' :
                              'bg-surface-100 text-surface-600'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-surface-300 group-hover:text-tosca-500 transition-colors mt-2 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Quick Access */}
              <AdminCard variant="highlight" padding="lg" className="relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap size={160} />
                </div>
                <h3 className="text-lg font-bold text-tosca-900 mb-2 relative">Manajemen Siswa</h3>
                <p className="text-sm text-surface-500 mb-6 relative leading-relaxed">
                  Daftar & kelola data lengkap siswa dengan mudah.
                </p>
                <Link href="/dashboard/admin/santri" className="block w-full text-center bg-tosca-600 text-white py-3 rounded-2xl font-semibold text-sm relative hover:bg-tosca-700 transition-colors shadow-md">
                  Kelola Siswa
                </Link>
              </AdminCard>

              {/* Quick Navigation */}
              <AdminCard padding="md">
                <h3 className="text-base font-bold text-tosca-900 mb-4">Menu Cepat</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/admin/kelas" className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl hover:bg-tosca-50 transition-colors group">
                    <div className="p-2 bg-tosca-100 text-tosca-600 rounded-lg group-hover:scale-110 transition-transform">
                      <School size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-tosca-900">Manajemen Kelas</p>
                      <p className="text-xs text-surface-400">{totalKelas} kelas aktif</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/admin/musyrif" className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl hover:bg-tosca-50 transition-colors group">
                    <div className="p-2 bg-tosca-100 text-tosca-600 rounded-lg group-hover:scale-110 transition-transform">
                      <UserSquare2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-tosca-900">Manajemen Guru</p>
                      <p className="text-xs text-surface-400">{totalMusyrif} guru aktif</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/admin/nilai" className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl hover:bg-tosca-50 transition-colors group">
                    <div className="p-2 bg-tosca-100 text-tosca-600 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-tosca-900">Input & Review Nilai</p>
                      <p className="text-xs text-surface-400">Setoran Tahsin harian</p>
                    </div>
                  </Link>
                </div>
              </AdminCard>

              {/* Jadwal Hari Ini */}
              <AdminCard padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-tosca-900">Jadwal Hari Ini</h3>
                  <Link href="/dashboard/admin/jadwal" className="text-xs text-tosca-600 font-medium hover:underline">Lihat Semua</Link>
                </div>
                {todayJadwal.length === 0 ? (
                  <p className="text-xs text-surface-400 text-center py-4">Tidak ada jadwal untuk hari ini.</p>
                ) : (
                  <div className="space-y-3">
                    {todayJadwal.map((j: any) => (
                      <div key={j.id} className="flex items-center gap-4 p-3 bg-surface-50 rounded-xl border border-transparent hover:border-tosca-200 transition-all cursor-pointer group">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-tosca-600 shadow-sm group-hover:bg-tosca-600 group-hover:text-white transition-all">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-tosca-900">{j.sesi || j.jenis || '-'}</p>
                          <p className="text-xs text-surface-500">
                            {formatJam(j.jam_mulai)} - {formatJam(j.jam_selesai)}{j.musyrif_name ? ` • ${j.musyrif_name}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            </div>
          </div>
        </main>

      {/* Modal Detail Aktivitas */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <AdminCard padding="none" className="w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-surface-200">
                  {getActivityIcon(selectedActivity.type)}
                </div>
                <h2 className="text-lg font-bold text-tosca-900">Detail Aktivitas</h2>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-surface-400 hover:text-surface-600 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-tosca-600 text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold shadow-md">
                  {selectedActivity.user.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-tosca-900">{selectedActivity.user}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedActivity.status === 'Lancar' ? 'bg-tosca-100 text-tosca-700' : 'bg-surface-100 text-surface-600'
                }`}>
                  {selectedActivity.status}
                </span>
              </div>
              <div className="space-y-3 bg-surface-50 p-5 rounded-2xl border border-surface-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-400 font-medium text-xs uppercase">Tindakan</span>
                  <span className="text-tosca-900 font-semibold">{selectedActivity.action}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-400 font-medium text-xs uppercase">Target</span>
                  <span className="text-tosca-900 font-semibold">{selectedActivity.target}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-400 font-medium text-xs uppercase">Waktu</span>
                  <span className="text-tosca-900 font-semibold">{selectedActivity.time}</span>
                </div>
              </div>
              <div className="p-4 bg-white border border-surface-200 rounded-2xl">
                <p className="text-xs font-semibold text-surface-400 uppercase mb-1.5">Keterangan:</p>
                <p className="text-sm text-surface-700 leading-relaxed">{selectedActivity.detail}</p>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="w-full py-3.5 bg-tosca-900 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all">
                Tutup
              </button>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <AdminCard padding="none" className="w-full max-w-lg shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-tosca-900 flex items-center gap-2">
                <Plus size={22} className="text-tosca-600" /> Tambah Data Cepat
              </h2>
              <button onClick={() => setIsQuickAddOpen(false)} className="text-surface-400 hover:text-surface-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-surface-700 ml-1">Nama Lengkap</label>
                <input type="text" required value={quickName} onChange={e => setQuickName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000 transition-all" placeholder="Nama Siswa / Guru / Kelas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-surface-700 ml-1">Tipe Data</label>
                  <select value={quickType} onChange={e => setQuickType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000">
                    <option>Siswa</option>
                    <option>Guru</option>
                    <option>Kelas</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-surface-700 ml-1">
                    {quickType === 'Kelas' ? 'Level (7-12)' : quickType === 'Siswa' ? 'NIS' : 'NIP'}
                  </label>
                  <input type="text" value={quickKeterangan} onChange={e => setQuickKeterangan(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000 transition-all" placeholder={quickType === 'Kelas' ? '7' : quickType === 'Siswa' ? 'NIS' : 'NIP'} />
                </div>
              </div>
              {quickType !== 'Kelas' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-surface-700 ml-1">Email</label>
                  <input type="email" value={quickEmail} onChange={e => setQuickEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-surface-200 font-medium text-sm focus:ring-2 focus:ring-tosca-500/40 focus:border-surface-1000 transition-all" placeholder="email@baitulhuffaz.sch.id" />
                  <p className="text-[10px] text-surface-400 ml-1">*Kosongi untuk generate otomatis.</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-tosca-600 text-white rounded-2xl font-semibold shadow-lg hover:bg-tosca-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                Simpan Data
              </button>
            </form>
          </AdminCard>
        </div>
      )}
    </>
  );
}
