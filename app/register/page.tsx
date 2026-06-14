'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, UserPlus, ArrowLeft, CheckCircle2, X, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  // Form state
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

  // Options for dropdown
  const kelasOptions = [
    { id: 'kelas-7a', nama: '7A - Tahfizh Dasar' },
    { id: 'kelas-7b', nama: '7B - Tahfizh Dasar' },
    { id: 'kelas-8a', nama: '8A - Tahfizh Menengah' },
    { id: 'kelas-8b', nama: '8B - Tahfizh Menengah' },
    { id: 'kelas-9a', nama: '9A - Tahfizh Lanjutan' },
    { id: 'kelas-9b', nama: '9B - Tahfizh Lanjutan' },
  ];

  // Generate username from name
  const generateUsername = (nama: string) => {
    return nama.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'nama_lengkap') {
        newData.username = generateUsername(value);
        newData.password = generatePassword();
      }
      return newData;
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/santri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.nama_lengkap,
          nis: formData.nis || undefined,
          nisn: formData.nisn || undefined,
          kelas_id: formData.kelas_id || undefined,
          nama_ayah: formData.nama_ayah,
          nama_ibu: formData.nama_ibu,
          pekerjaan_ayah: formData.pekerjaan_ayah,
          pekerjaan_ibu: formData.pekerjaan_ibu,
          no_wa: formData.no_wa,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal mendaftarkan siswa');
        setIsLoading(false);
        return;
      }

      const kelas_nama = kelasOptions.find(k => k.id === formData.kelas_id)?.nama || '';
      setRegisteredData({
        nama: formData.nama_lengkap,
        username: formData.username,
        password: formData.password,
        kelas: kelas_nama,
      });

      setIsLoading(false);
      setShowSuccess(true);
    } catch {
      alert('Gagal mendaftarkan siswa. Periksa koneksi.');
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
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
    setShowSuccess(false);
    setRegisteredData(null);
  };

  // Copy credentials to clipboard
  const copyCredentials = () => {
    if (registeredData) {
      const text = `Username: ${registeredData.username}\nPassword: ${registeredData.password}`;
      navigator.clipboard.writeText(text);
      alert('Credential berhasil disalin!');
    }
  };

  if (showSuccess && registeredData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tosca-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-tosca-100/50 blur-3xl"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-tosca-200/30 blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-tosca-100">
          <div className="text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-tosca-900 mb-2">Pendaftaran Berhasil!</h1>
            <p className="text-tosca-600">Siswa baru telah berhasil didaftarkan.</p>
          </div>

          <div className="bg-tosca-50/50 rounded-2xl p-6 border border-tosca-100 space-y-4">
            <div className="text-center mb-4">
              <div className="h-16 w-16 bg-tosca-600 text-white rounded-full mx-auto flex items-center justify-center text-2xl font-black">
                {registeredData.nama.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-tosca-900 mt-2">{registeredData.nama}</h3>
              <span className="px-3 py-1 bg-tosca-100 text-tosca-700 rounded-full text-xs font-bold">
                {registeredData.kelas}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                <span className="text-xs font-bold text-tosca-400 uppercase">Username</span>
                <span className="text-sm font-mono font-bold text-tosca-900">{registeredData.username}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                <span className="text-xs font-bold text-tosca-400 uppercase">Password</span>
                <span className="text-sm font-mono font-bold text-tosca-900">{registeredData.password}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
              <p className="text-xs text-yellow-700 font-medium text-center">
                Simpan credentials di atas! Siswa bisa login dengan username dan password tersebut.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={copyCredentials}
              className="w-full py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-100"
            >
              Salin Credentials
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white border-2 border-tosca-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-all"
            >
              Daftar Siswa Baru
            </button>
            <Link
              href="/dashboard/admin/santri"
              className="w-full py-3 text-center text-tosca-600 font-bold hover:text-tosca-800 transition-colors"
            >
              Kembali ke Manajemen Siswa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tosca-50/30">
      {/* Header */}
      <div className="bg-white border-b border-tosca-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin" className="p-2 hover:bg-tosca-50 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-tosca-600" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tosca-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-tosca-900">Pendaftaran Siswa Baru</h1>
                <p className="text-xs text-tosca-500">Manajemen Al-Quran Management System</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-tosca-50 shadow-sm overflow-hidden">
          <div className="p-6 bg-tosca-50/30 border-b border-tosca-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-tosca-100 rounded-xl">
                <UserPlus size={24} className="text-tosca-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-tosca-900">Form Pendaftaran Siswa</h2>
                <p className="text-sm text-tosca-600">Lengkapi data di bawah untuk mendaftarkan santri baru.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Data Pribadi */}
            <div className="bg-tosca-50/30 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-tosca-700 mb-4 flex items-center gap-2">
                <GraduationCap size={16} />
                Data Pribadi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">NIS</label>
                  <input
                    type="text"
                    name="nis"
                    value={formData.nis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                    placeholder="001"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">NISN</label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm bg-tosca-50/50"
                    placeholder="Auto-generate"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Kelas/Level</label>
                  <select
                    name="kelas_id"
                    value={formData.kelas_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {kelasOptions.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-tosca-700">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                  placeholder="Nama lengkap sesuai KK"
                />
              </div>
            </div>

            {/* Data Orang Tua */}
            <div className="bg-tosca-50/30 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-tosca-700 mb-4">Data Orang Tua/Wali</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Nama Ayah</label>
                  <input
                    type="text"
                    name="nama_ayah"
                    value={formData.nama_ayah}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                    placeholder="Nama ayah kandung"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Pekerjaan Ayah</label>
                  <input
                    type="text"
                    name="pekerjaan_ayah"
                    value={formData.pekerjaan_ayah}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                    placeholder="Contoh: Wiraswasta"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Nama Ibu</label>
                  <input
                    type="text"
                    name="nama_ibu"
                    value={formData.nama_ibu}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                    placeholder="Nama ibu kandung"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Pekerjaan Ibu</label>
                  <input
                    type="text"
                    name="pekerjaan_ibu"
                    value={formData.pekerjaan_ibu}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                    placeholder="Contoh: Ibu Rumah Tangga"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-tosca-700">Nomor WhatsApp</label>
                <input
                  type="text"
                  name="no_wa"
                  value={formData.no_wa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-tosca-100 focus:ring-2 focus:ring-tosca-500 text-sm"
                  placeholder="6281234567890"
                />
              </div>
            </div>

            {/* Info Akun */}
            <div className="bg-gradient-to-r from-tosca-50 to-blue-50 rounded-2xl p-4 border border-tosca-100">
              <h3 className="text-sm font-bold text-tosca-700 mb-4">Akun Login Siswa</h3>
              <p className="text-xs text-tosca-500 mb-4">Username dan password akan digenerate otomatis. Password bisa diubah kemudian.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-200 focus:ring-2 focus:ring-tosca-500 text-sm font-mono bg-white"
                    placeholder="username"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-tosca-700">Password Default</label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-tosca-200 focus:ring-2 focus:ring-tosca-500 text-sm font-mono bg-white"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin')}
                className="flex-1 px-4 py-3 border-2 border-tosca-100 text-tosca-600 rounded-xl font-bold hover:bg-tosca-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.nama_lengkap || !formData.kelas_id}
                className="flex-1 px-4 py-3 bg-tosca-600 text-white rounded-xl font-bold hover:bg-tosca-700 transition-all shadow-lg shadow-tosca-100 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Daftarkan Siswa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-blue-800 mb-2">Informasi Penting:</p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Siswa yang didaftarkan akan otomatis memiliki akun login.</li>
            <li>Username dan password default bisa dilihat setelah pendaftaran berhasil.</li>
            <li>Siswa bisa login menggunakan username atau email dengan password yang sama.</li>
            <li>Untuk mengedit atau menghapus data, silakan ke halaman Manajemen Siswa.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}