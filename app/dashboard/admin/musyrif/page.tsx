'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useMusyrifList, useCreateMusyrif } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  Users,
  FileDown,
  Upload,
  ExternalLink
} from 'lucide-react';

// Types
interface Musyrif {
  id: string;
  nip: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  email: string;
  no_wa: string;
  username: string;
  password?: string;
  is_active: boolean;
  created_at: string;
}

export default function ManajemenMusyrif() {

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMusyrif, setEditingMusyrif] = useState<Musyrif | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    email: '',
    no_wa: '',
    username: '',
    password: '',
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});

  const qc = useQueryClient();
  const { data: musyrifData } = useMusyrifList();
  const createMusyrif = useCreateMusyrif();

  const musyrifList: Musyrif[] = useMemo(() => {
    if (!musyrifData?.data) return [];
    return musyrifData.data.map((m: any) => ({
      id: m.id,
      nip: m.nip || '',
      nama_lengkap: m.full_name || '',
      kelas_id: m.kelas_id || '',
      kelas_nama: m.kelas_nama || '',
      email: m.email || '',
      no_wa: m.no_wa || '',
      username: m.username || '',
      password: undefined,
      is_active: m.is_active,
      created_at: m.created_at || '',
    }));
  }, [musyrifData]);

  // Generate NIP
  const generateNIP = () => {
    const num = Math.floor(100 + Math.random() * 900);
    return `MSR-${num}`;
  };

  // Generate username
  const generateUsername = (nama: string) => {
    return nama.toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z.]/g, '')
      .replace(/^(ust|ustadh|ustadz|ustaz|dr|drg)\.?/i, 'ust.');
  };

  // Generate password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const resetForm = () => {
    setFormData({
      nip: '',
      nama_lengkap: '',
      email: '',
      no_wa: '',
      username: '',
      password: '',
    });
    setShowPassword(false);
    setEditingMusyrif(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      nip: generateNIP(),
      password: generatePassword(),
    }));
    setIsModalOpen(true);
  };

  const openEditModal = (musyrif: Musyrif) => {
    setEditingMusyrif(musyrif);
    setIsEditMode(true);
    setFormData({
      nip: musyrif.nip,
      nama_lengkap: musyrif.nama_lengkap,
      email: musyrif.email,
      no_wa: musyrif.no_wa,
      username: musyrif.username,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'nama_lengkap' && !isEditMode) {
        newData.username = generateUsername(value);
      }
      return newData;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
        if (isEditMode && editingMusyrif) {
        const res = await fetch(`/api/musyrif/${editingMusyrif.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.nama_lengkap,
            no_wa: formData.no_wa,
            username: formData.username,
            ...(formData.email ? { email: formData.email } : {}),
            ...(formData.password ? { password: formData.password } : {}),
          }),
        });
        if (!res.ok) throw new Error('Failed to update');
        triggerToast('Data Guru Berhasil Diperbarui!');
        qc.invalidateQueries({ queryKey: ['musyrif'] } as any);
      } else {
        const resp: any = await createMusyrif.mutateAsync({
          email: formData.email,
          password: formData.password,
          full_name: formData.nama_lengkap,
          nip: formData.nip,
          username: formData.username,
          no_wa: formData.no_wa,
        });
        if (resp?.data?.id) {
          setVisiblePasswords(prev => ({ ...prev, [resp.data.id]: formData.password }));
        }
        triggerToast(`Guru "${formData.nama_lengkap}" berhasil ditambahkan!`);
      }
    } catch (err: any) {
      console.error('Save failed', err);
      triggerToast(err.message || 'Gagal menyimpan data guru.');
    }

    setIsLoading(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Guru "${nama}"?\nAkun login juga akan dihapus.`)) {
      try {
        const res = await fetch(`/api/musyrif/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        triggerToast('Data Guru Berhasil Dihapus!');
        qc.invalidateQueries({ queryKey: ['musyrif'] } as any);
      } catch (err) {
        console.error('Delete failed', err);
        triggerToast('Gagal menghapus data guru.');
      }
    }
  };

  // Filter
  const filteredMusyrif = musyrifList.filter(m =>
    (m.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.nip || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Download template
  const downloadTemplate = () => {
    const headers = ['NIP', 'Nama Lengkap', 'Kelas ID', 'Email', 'No WA', 'Username'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_musyrif_baitul_huffaz.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      triggerToast(`File "${file.name}" berhasil diupload.`);
      setTimeout(() => {
        triggerToast('Data Guru Berhasil Diimpor!');
      }, 1500);
    }
  };

  return (
    <>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Users size={28} className="text-purple-600" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-tosca-900">Manajemen Guru</h1>
                <p className="text-tosca-600 font-medium">Kelola data & akun login Guru Manajemen Al-Quran.</p>
              </div>
            </div>
            {showToast && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">{toastMessage}</span>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <UserPlus size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-800">Informasi Penting</p>
              <p className="text-xs text-purple-600 mt-1">
                Guru yang didaftarkan akan otomatis memiliki akun login. Username dan password default bisa diubah kemudian.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-3xl border border-surface-100 shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-tosca-50 text-tosca-700 rounded-xl font-semibold text-sm hover:bg-tosca-100 transition-colors border border-tosca-100"
                >
                  <FileDown size={18} />
                  Template
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-tosca-50 text-tosca-700 rounded-xl font-semibold text-sm hover:bg-tosca-100 transition-colors border border-tosca-100"
                >
                  <Upload size={18} />
                  Upload Massal
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".csv,.xls,.xlsx"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari NIP, Nama, Username..."
                    className="pl-10 pr-4 py-2 bg-tosca-50/50 border border-tosca-100 rounded-xl text-sm text-[#0B7D72] focus:ring-2 focus:ring-tosca-500 focus:border-surface-1000 transition-all w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-tosca-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-all shadow-md"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Tambah Guru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-3xl border border-surface-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-tosca-50/50 border-b border-tosca-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">NIP</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Kontak</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Password</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tosca-50">
                  {filteredMusyrif.length > 0 ? (
                    filteredMusyrif.map((m, index) => (
                      <tr key={m.id} className="hover:bg-surface-50 transition-colors group">
                        <td className="px-4 py-3 text-sm font-medium text-tosca-500">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-tosca-800">{m.nip}</td>
                        <td className="px-4 py-3 text-sm font-bold text-tosca-900">{m.nama_lengkap}</td>
                        <td className="px-4 py-3 space-y-1">
                          <a
                            href={`mailto:${m.email}`}
                            className="flex items-center gap-1.5 text-xs text-tosca-600 hover:text-tosca-900 transition-colors"
                          >
                            <Mail size={12} />
                            {m.email}
                          </a>
                          <a
                            href={`https://wa.me/${(m.no_wa || '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-tosca-600 hover:text-tosca-900 transition-colors"
                          >
                            <Phone size={12} />
                            {m.no_wa || '-'}
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-tosca-700 bg-tosca-50/50 rounded">{m.username || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          {visiblePasswords[m.id] ? (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded text-[12px] font-mono font-bold">
                              {visiblePasswords[m.id]}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(m)}
                              className="p-1.5 text-tosca-500 hover:bg-tosca-100 hover:text-tosca-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.nama_lengkap)}
                              className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button className="p-1.5 text-surface-400 hover:bg-tosca-50 rounded-lg">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-tosca-500 font-medium italic">
                        Tidak ada guru yang ditemukan dengan kata kunci &quot;{searchTerm}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-tosca-50/20 border-t border-surface-100 flex items-center justify-between text-sm text-tosca-500 font-medium">
              <p>Menampilkan {filteredMusyrif.length} dari {filteredMusyrif.length} guru</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled>Sebelumnya</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors bg-tosca-50">1</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors">2</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors">Selanjutnya</button>
              </div>
            </div>
          </div>
        </main>

      {/* Modal Tambah/Edit Musyrif */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-surface-100 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-xl text-white">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-900">
                  {isEditMode ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                </h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-surface-400 hover:text-tosca-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form className="p-6 space-y-5 max-h-[70vh] overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Baris 1: NIP */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-tosca-700 ml-1">NIP</label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] bg-tosca-50/50"
                  placeholder="MSR-XXX"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-tosca-700 ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                  placeholder="Nama lengkap guru"
                />
              </div>

              {/* Kontak */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="email@baitulhuffaz.sch.id"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    name="no_wa"
                    value={formData.no_wa}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="6281234567890"
                  />
                </div>
              </div>

              {/* Level Program removed per request */}

              {/* Info Akun Login */}
              <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
                <p className="text-xs font-bold text-purple-700 mb-3">AKUN LOGIN GURU</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-tosca-700 ml-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-tosca-200 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-mono bg-white"
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-tosca-700 ml-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!isEditMode}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-tosca-200 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] font-mono bg-white"
                        placeholder={isEditMode ? 'Kosongkan jika tidak diubah' : 'Password default'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-tosca-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                    className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                  >
                    Generate Password Baru
                  </button>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-3 border-2 border-tosca-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {isEditMode ? 'Simpan Perubahan' : 'Simpan Guru'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
