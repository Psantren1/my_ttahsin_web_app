'use client';

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/ui/sidebar';
import Navbar from '@/components/ui/navbar';
import {
  FileDown,
  Upload,
  Save,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  Users
} from 'lucide-react';

// Types
interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  kelas_id: string;
  kelas_nama: string;
  nama_ayah: string;
  nama_ibu: string;
  pekerjaan_ayah: string;
  pekerjaan_ibu: string;
  no_wa: string;
  username: string;
  password: string;
  is_active: boolean;
  created_at: string;
}

// Dummy data untuk Kelas (seharusnya dari database)
const kelasList = [
  { id: 'kelas-7a', nama: '7A - Tahfizh Dasar' },
  { id: 'kelas-7b', nama: '7B - Tahfizh Dasar' },
  { id: 'kelas-8a', nama: '8A - Tahfizh Menengah' },
  { id: 'kelas-8b', nama: '8B - Tahfizh Menengah' },
  { id: 'kelas-9a', nama: '9A - Tahfizh Lanjutan' },
  { id: 'kelas-9b', nama: '9B - Tahfizh Lanjutan' },
];

// Initial dummy data
const initialSantri: Santri[] = [];

// Initial accounts for login (separate from display data)
const initialAccounts: any[] = [];

// Simple hash function for demo
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export default function ManajemenSantri() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk form
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama_lengkap: '',
    kelas_id: '',
    nama_ayah: '',
    nama_ibu: '',
    pekerjaan_ayah: '',
    pekerjaan_ibu: '',
    no_wa: '',
    username: '',
    password: '',
  });

  const [santriList, setSantriList] = useState<Santri[]>([]);

  const loadSantri = async () => {
    try {
      const res = await fetch('/api/santri');
      const json = await res.json();
      if (json.data) setSantriList(json.data);
    } catch (err) {
      console.error('Failed to load santri', err);
    }
  };

  useEffect(() => {
    loadSantri();
  }, []);

  // Generate NISN unik
  const generateNISN = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  // Generate username dari nama
  const generateUsername = (nama: string) => {
    return nama.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  };

  // Generate password default
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
      nis: '',
      nisn: '',
      nama_lengkap: '',
      kelas_id: '',
      nama_ayah: '',
      nama_ibu: '',
      pekerjaan_ayah: '',
      pekerjaan_ibu: '',
      no_wa: '',
      username: '',
      password: '',
    });
    setShowPassword(false);
    setEditingSantri(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    // Auto-generate NISN
    setFormData(prev => ({
      ...prev,
      nisn: generateNISN(),
      password: generatePassword(),
    }));
    setIsModalOpen(true);
  };

  const openEditModal = (santri: Santri) => {
    setEditingSantri(santri);
    setIsEditMode(true);
    setFormData({
      nis: santri.nis,
      nisn: santri.nisn,
      nama_lengkap: santri.nama_lengkap,
      kelas_id: santri.kelas_id,
      nama_ayah: santri.nama_ayah,
      nama_ibu: santri.nama_ibu,
      pekerjaan_ayah: santri.pekerjaan_ayah,
      pekerjaan_ibu: santri.pekerjaan_ibu,
      no_wa: santri.no_wa,
      username: santri.username,
      password: '', // Tidak tampilkan password lama
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate username saat nama berubah (hanya saat menambah baru)
      if (name === 'nama_lengkap' && !isEditMode) {
        newData.username = generateUsername(value);
      }
      return newData;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      if (isEditMode && editingSantri) {
        const res = await fetch(`/api/santri/${editingSantri.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.nama_lengkap,
            nis: formData.nis,
            kelas_id: formData.kelas_id,
            ...(formData.password ? { password: formData.password } : {}),
          }),
        });
        if (!res.ok) throw new Error('Failed to update');
        triggerToast('Data Santri Berhasil Diperbarui!');
      } else {
        const res = await fetch('/api/santri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `${formData.username}@baitulhuffaz.sch.id`,
            password: formData.password,
            full_name: formData.nama_lengkap,
            nis: formData.nis,
            kelas_id: formData.kelas_id,
          }),
        });
        if (!res.ok) throw new Error('Failed to create');
        triggerToast(`Santri "${formData.nama_lengkap}" berhasil ditambahkan!`);
      }

      await loadSantri();
    } catch (err) {
      console.error('Save failed', err);
      triggerToast('Gagal menyimpan data santri.');
    }

    setIsLoading(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data santri ini?')) {
      try {
        const res = await fetch(`/api/santri/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        triggerToast('Data Santri Berhasil Dihapus!');
        await loadSantri();
      } catch (err) {
        console.error('Delete failed', err);
        triggerToast('Gagal menghapus data santri.');
      }
    }
  };

  // Filter berdasarkan search
  const filteredSantri = santriList.filter((s: any) =>
    s.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nisn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Download template CSV
  const downloadTemplate = () => {
    const headers = ['NIS', 'NISN', 'Nama Lengkap', 'Kelas ID', 'Nama Ayah', 'Nama Ibu', 'Pekerjaan Ayah', 'Pekerjaan Ibu', 'No WA', 'Username'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_santri_baitul_huffaz.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      triggerToast(`File "${file.name}" berhasil diupload. Data sedang diproses...`);
      setTimeout(() => {
        triggerToast('Data Santri Berhasil Diimpor!');
      }, 1500);
    }
  };

  // Handle generate password baru
  const handleGeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generatePassword() }));
  };

  return (
    <div className="min-h-screen bg-tosca-50/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-72 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-tosca-50 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-tosca-100 rounded-2xl">
                <Users size={28} className="text-tosca-600" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-tosca-900">Manajemen Santri</h1>
                <p className="text-tosca-600 font-medium">Kelola data & akun login santri Baitul Huffaz.</p>
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
          <div className="bg-tosca-50/50 border border-tosca-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="p-2 bg-tosca-100 rounded-xl">
              <UserPlus size={20} className="text-tosca-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-tosca-800">Informasi Penting</p>
              <p className="text-xs text-tosca-600 mt-1">
                Santri yang didaftarkan akan otomatis memiliki akun login. Username dan password default akan digenerate secara otomatis dan bisa diubah kemudian.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-3xl border border-tosca-50 shadow-sm mb-6">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tosca-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari NIS, Nama, Username..."
                    className="pl-10 pr-4 py-2 bg-tosca-50/50 border border-tosca-100 rounded-xl text-sm text-[#0B7D72] focus:ring-2 focus:ring-tosca-500 focus:border-tosca-500 transition-all w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-tosca-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-all shadow-md"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Tambah Santri</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-tosca-50/50 border-b border-tosca-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">NIS</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">NISN</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Kelas/Level</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Nama Ayah</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Nama Ibu</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Pekerjaan Ayah</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Pekerjaan Ibu</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">No. WA</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider">Password</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-tosca-700 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tosca-50">
                  {santriList.map((santri, index) => (
                    <tr key={santri.id} className="hover:bg-tosca-50/30 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-tosca-500">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-tosca-800">{santri.nis}</td>
                      <td className="px-4 py-3 text-sm text-tosca-600">{santri.nisn}</td>
                      <td className="px-4 py-3 text-sm font-bold text-tosca-900">{santri.nama_lengkap}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-tosca-100 text-tosca-700 rounded-full text-[10px] font-bold">
                          {santri.kelas_nama}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-tosca-600">{santri.nama_ayah}</td>
                      <td className="px-4 py-3 text-sm text-tosca-600">{santri.nama_ibu}</td>
                      <td className="px-4 py-3 text-sm text-tosca-500">{santri.pekerjaan_ayah}</td>
                      <td className="px-4 py-3 text-sm text-tosca-500">{santri.pekerjaan_ibu}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${(santri.no_wa || '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-tosca-600 hover:text-tosca-900 transition-colors"
                        >
                          {santri.no_wa}
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-tosca-700 bg-tosca-50/50 rounded">{santri.username}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">
                          ********
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(santri)}
                            className="p-1.5 text-tosca-500 hover:bg-tosca-100 hover:text-tosca-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(santri.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="p-1.5 text-tosca-400 hover:bg-tosca-50 rounded-lg">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-tosca-50/20 border-t border-tosca-50 flex items-center justify-between text-sm text-tosca-500 font-medium">
              <p>Menampilkan {santriList.length} dari {santriList.length} santri</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled>Sebelumnya</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors bg-tosca-50">1</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors">2</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors">3</button>
                <button className="px-3 py-1.5 border border-tosca-100 rounded-lg hover:bg-white transition-colors">Selanjutnya</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah/Edit Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-tosca-50 bg-tosca-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tosca-600 rounded-xl text-white">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-xl font-bold text-tosca-900">
                  {isEditMode ? 'Edit Data Santri' : 'Tambah Santri Baru'}
                </h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-tosca-400 hover:text-tosca-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form className="p-6 space-y-5 max-h-[70vh] overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Baris 1: NIS & NISN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">NIS</label>
                  <input
                    type="text"
                    name="nis"
                    value={formData.nis}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="Contoh: 001"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">NISN</label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72] bg-tosca-50/50"
                    placeholder="Contoh: 1234567890"
                  />
                </div>
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
                  placeholder="Nama lengkap sesuai KK"
                />
              </div>

              {/* Kelas/Level - Sinkron dengan Manajemen Kelas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-tosca-700 ml-1">Kelas/Level</label>
                <select
                  name="kelas_id"
                  value={formData.kelas_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              {/* Nama Orang Tua */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">Nama Ayah</label>
                  <input
                    type="text"
                    name="nama_ayah"
                    value={formData.nama_ayah}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="Nama ayah kandung"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">Nama Ibu</label>
                  <input
                    type="text"
                    name="nama_ibu"
                    value={formData.nama_ibu}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="Nama ibu kandung"
                  />
                </div>
              </div>

              {/* Pekerjaan Orang Tua */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">Pekerjaan Ayah</label>
                  <input
                    type="text"
                    name="pekerjaan_ayah"
                    value={formData.pekerjaan_ayah}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="Contoh: Wiraswasta"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700 ml-1">Pekerjaan Ibu</label>
                  <input
                    type="text"
                    name="pekerjaan_ibu"
                    value={formData.pekerjaan_ibu}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                    placeholder="Contoh: Ibu Rumah Tangga"
                  />
                </div>
              </div>

              {/* Nomor WA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-tosca-700 ml-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  name="no_wa"
                  value={formData.no_wa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm text-[#0B7D72]"
                  placeholder="Contoh: 6281234567890"
                />
              </div>

              {/* Info Akun Login */}
              <div className="bg-tosca-50/50 rounded-2xl p-4 border border-tosca-100">
                <p className="text-xs font-bold text-tosca-700 mb-3">AKUN LOGIN SANTRI</p>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-tosca-400 hover:text-tosca-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="mt-2 text-xs font-bold text-tosca-600 hover:text-tosca-800 underline"
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
                  className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-100 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {isEditMode ? 'Simpan Perubahan' : 'Simpan Santri'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}