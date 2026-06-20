/**
 * SertifikatTemplate.tsx
 * Template PDF 2 halaman untuk Sertifikat Tahfizh Al-Quran
 * Halaman 1: Sertifikat Utama (Kop + Isi + Identitas Santri)
 * Halaman 2: Lampiran Nilai Tahsin (Tabel + TTD)
 *
 * PENTING: Komponen ini wajib di-import secara dynamic dengan { ssr: false }
 * karena @react-pdf/renderer hanya berjalan di sisi client (browser).
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// ─── Tipe Data Sertifikat ────────────────────────────────────────────────────

export interface SertifikatData {
  // Identitas Santri
  nomorSertifikat: string;
  santriName: string;
  nis: string;
  kelasNama: string;

  // Data Tahsin (dari baitul_target_records)
  namaSurat: string;
  juzKe: string;
  statusKelulusan: string;
  catatan?: string;

  // Nilai (dari baitul_Tahsin_records)
  nilaiTajwid: number;
  nilaiMakhraj: number;
  nilaiKelancaran: number;
  nilaiRata: number;

  // Input Manual Admin
  paragrafTeks: string;          // Paragraf isi sertifikat
  namaSekolah: string;           // dari settings.appName
  logoUrl?: string;              // dari settings.logoUrl (base64)
  alamatSekolah: string;         // input manual
  akreditasi: string;            // input manual
  kotaPenandatangan: string;     // input manual
  tanggalTerbit: string;         // "03 Juni 2026"
  namaPenanggungJawab: string;   // input manual
  jabatan: string;               // input manual
}

// ─── Warna & Gaya ───────────────────────────────────────────────────────────

const TOSCA   = '#006a4e'; // bottle-green-600
const TOSCA_D = '#00553e'; // bottle-green-700
const GOLD    = '#b45309'; // amber-700
const DARK    = '#1e293b'; // slate-800
const GRAY    = '#64748b'; // slate-500
const LIGHT   = '#f1f5f9'; // slate-100
const WHITE   = '#ffffff';
const BORDER  = '#e2e8f0'; // slate-200

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Halaman ──
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 48,
  },

  // ── KOP ──
  kopWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: TOSCA,
    paddingBottom: 10,
    marginBottom: 4,
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: TOSCA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  kopText: {
    flex: 1,
  },
  kopNamaSekolah: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 0.5,
  },
  kopAkreditasi: {
    fontSize: 9,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    marginTop: 1,
  },
  kopAlamat: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
    lineHeight: 1.4,
  },
  stripBawahKop: {
    height: 3,
    backgroundColor: GOLD,
    marginBottom: 18,
    borderRadius: 2,
  },

  // ── Judul Sertifikat ──
  judulWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  judulHiasan: {
    fontSize: 9,
    color: TOSCA,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  judulUtama: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 1,
    textAlign: 'center',
  },
  judulSub: {
    fontSize: 10,
    color: GRAY,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  nomorSertifikat: {
    fontSize: 8,
    color: GRAY,
    marginTop: 6,
    backgroundColor: LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    border: `1px solid ${BORDER}`,
  },

  // ── Garis Dekoratif ──
  garisDekor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 6,
  },
  garisThin: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  garisThick: {
    width: 40,
    height: 2,
    backgroundColor: TOSCA,
    borderRadius: 1,
  },
  titikDekor: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
  },

  // ── Paragraf Pembuka ──
  paragrafPembuka: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.6,
    textAlign: 'center',
    marginBottom: 14,
  },

  // ── Identitas Santri ──
  identitasBox: {
    backgroundColor: LIGHT,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: TOSCA,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  identitasRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  identitasLabel: {
    width: 80,
    fontSize: 9,
    color: GRAY,
    fontFamily: 'Helvetica-Bold',
  },
  identitasSep: {
    width: 12,
    fontSize: 9,
    color: GRAY,
  },
  identitasValue: {
    flex: 1,
    fontSize: 10,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.4,
  },

  // ── Paragraf Teks Sertifikat ──
  paragrafSertifikat: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginBottom: 14,
  },

  // ── Detail Tahsin ──
  TahsinRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  TahsinItem: {
    flex: 1,
    backgroundColor: `${TOSCA}12`,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: `${TOSCA}30`,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  TahsinLabel: {
    fontSize: 8,
    color: TOSCA_D,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  TahsinValue: {
    fontSize: 12,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Footer Halaman 1 ──
  footerH1: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    alignItems: 'center',
  },
  footerH1Text: {
    fontSize: 8,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 1.5,
  },

  // ═══════════════════════════════════════════════════════════
  // ── HALAMAN 2: LAMPIRAN NILAI ──
  // ═══════════════════════════════════════════════════════════

  lampiranHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  lampiranJudul: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 0.5,
  },
  lampiranSub: {
    fontSize: 9,
    color: GRAY,
    marginTop: 3,
  },

  // ── Info Santri (Lampiran) ──
  infoSantriRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  infoSantriBox: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderLeftWidth: 2,
    borderLeftColor: TOSCA,
  },
  infoSantriLabel: {
    fontSize: 7,
    color: GRAY,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoSantriValue: {
    fontSize: 10,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Tabel Nilai ──
  tabel: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tabelHeader: {
    flexDirection: 'row',
    backgroundColor: TOSCA,
  },
  tabelHeaderCellNo: {
    width: 36,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: `${WHITE}30`,
    alignItems: 'center',
  },
  tabelHeaderCellKomponen: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: `${WHITE}30`,
  },
  tabelHeaderCellNilai: {
    width: 70,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: `${WHITE}30`,
    alignItems: 'center',
  },
  tabelHeaderCellPredikat: {
    width: 80,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabelHeaderText: {
    fontSize: 8,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tabelRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tabelRowAlt: {
    backgroundColor: LIGHT,
  },
  tabelRowFoot: {
    backgroundColor: `${TOSCA}15`,
    borderTopWidth: 2,
    borderTopColor: TOSCA,
  },
  tabelCellNo: {
    width: 36,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabelCellKomponen: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    justifyContent: 'center',
  },
  tabelCellNilai: {
    width: 70,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabelCellPredikat: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabelTextNo: {
    fontSize: 9,
    color: GRAY,
  },
  tabelTextKomponen: {
    fontSize: 10,
    color: DARK,
  },
  tabelTextNilai: {
    fontSize: 11,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
  },
  tabelTextPredikat: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  tabelTextFootLabel: {
    fontSize: 10,
    color: TOSCA_D,
    fontFamily: 'Helvetica-Bold',
  },
  tabelTextFootNilai: {
    fontSize: 12,
    color: TOSCA_D,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Status Kelulusan ──
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 10,
    alignSelf: 'center',
  },
  statusLulus: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  statusProses: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  statusBelumLulus: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  statusTextLulus:      { color: '#065f46' },
  statusTextProses:     { color: '#78350f' },
  statusTextBelumLulus: { color: '#7f1d1d' },

  // ── Catatan ──
  catatanBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  catatanLabel: {
    fontSize: 8,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  catatanText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },

  // ── Tanda Tangan ──
  ttdWrapper: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ttdBox: {
    alignItems: 'center',
    minWidth: 180,
  },
  ttdKota: {
    fontSize: 10,
    color: DARK,
    marginBottom: 48,
    textAlign: 'center',
  },
  ttdGaris: {
    width: 160,
    height: 1,
    backgroundColor: DARK,
    marginBottom: 4,
  },
  ttdNama: {
    fontSize: 10,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  ttdJabatan: {
    fontSize: 8,
    color: GRAY,
    textAlign: 'center',
    marginTop: 2,
  },
});

// ─── Helper: Predikat dari Nilai ────────────────────────────────────────────

function getPredikat(nilai: number): { label: string; color: string } {
  if (nilai >= 90) return { label: 'Mumtaz',        color: '#065f46' };
  if (nilai >= 80) return { label: 'Jayyid Jiddan', color: '#1e40af' };
  if (nilai >= 70) return { label: 'Jayyid',        color: '#92400e' };
  if (nilai >= 60) return { label: 'Maqbul',        color: '#7c3aed' };
  return             { label: 'Dhoif',          color: '#9f1239' };
}

// ─── Komponen Garis Dekoratif ────────────────────────────────────────────────

function GarisDekoratif() {
  return (
    <View style={styles.garisDekor}>
      <View style={styles.garisThin} />
      <View style={styles.titikDekor} />
      <View style={styles.garisThick} />
      <View style={styles.titikDekor} />
      <View style={styles.garisThin} />
    </View>
  );
}

// ─── Komponen Baris Tabel ────────────────────────────────────────────────────

interface TabelRowProps {
  no?: string;
  komponen: string;
  nilai: number;
  isAlt?: boolean;
  isFoot?: boolean;
}

function TabelRow({ no, komponen, nilai, isAlt, isFoot }: TabelRowProps) {
  const predikat = getPredikat(nilai);
  const rowStyle = isFoot
    ? [styles.tabelRow, styles.tabelRowFoot]
    : isAlt
    ? [styles.tabelRow, styles.tabelRowAlt]
    : [styles.tabelRow];

  return (
    <View style={rowStyle}>
      <View style={styles.tabelCellNo}>
        <Text style={isFoot ? styles.tabelTextFootLabel : styles.tabelTextNo}>
          {no || ''}
        </Text>
      </View>
      <View style={styles.tabelCellKomponen}>
        <Text style={isFoot ? styles.tabelTextFootLabel : styles.tabelTextKomponen}>
          {komponen}
        </Text>
      </View>
      <View style={styles.tabelCellNilai}>
        <Text style={isFoot ? styles.tabelTextFootNilai : styles.tabelTextNilai}>
          {nilai}
        </Text>
      </View>
      <View style={styles.tabelCellPredikat}>
        {!isFoot && (
          <Text style={[styles.tabelTextPredikat, { color: predikat.color }]}>
            {predikat.label}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Komponen Utama: SertifikatPDF ──────────────────────────────────────────

export function SertifikatPDF({ data }: { data: SertifikatData }) {
  const {
    nomorSertifikat, santriName, nis, kelasNama,
    namaSurat, juzKe, statusKelulusan, catatan,
    nilaiTajwid, nilaiMakhraj, nilaiKelancaran, nilaiRata,
    paragrafTeks, namaSekolah, logoUrl, alamatSekolah,
    akreditasi, kotaPenandatangan, tanggalTerbit,
    namaPenanggungJawab, jabatan,
  } = data;

  const predikatRata = getPredikat(nilaiRata);

  // Status style
  const statusStyle =
    statusKelulusan === 'Lulus'
      ? styles.statusLulus
      : statusKelulusan === 'Proses'
      ? styles.statusProses
      : styles.statusBelumLulus;

  const statusTextStyle =
    statusKelulusan === 'Lulus'
      ? styles.statusTextLulus
      : statusKelulusan === 'Proses'
      ? styles.statusTextProses
      : styles.statusTextBelumLulus;

  const statusEmoji =
    statusKelulusan === 'Lulus' ? '✓ LULUS' :
    statusKelulusan === 'Proses' ? '⟳ SEDANG PROSES' : '✗ BELUM LULUS';

  return (
    <Document
      title={`Sertifikat Tahfizh - ${santriName}`}
      author={namaSekolah}
      subject="Sertifikat Tahsin Al-Quran"
      creator="Manajemen Al-Quran System"
    >
      {/* ═══════════════════════════════════════════════════════
          HALAMAN 1 — SERTIFIKAT UTAMA
      ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>

        {/* ── KOP ── */}
        <View style={styles.kopWrapper}>
          {/* Logo */}
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                {namaSekolah.charAt(0)}
              </Text>
            </View>
          )}

          {/* Teks Kop */}
          <View style={styles.kopText}>
            <Text style={styles.kopNamaSekolah}>{namaSekolah.toUpperCase()}</Text>
            <Text style={styles.kopAkreditasi}>Terakreditasi: {akreditasi}</Text>
            <Text style={styles.kopAlamat}>{alamatSekolah}</Text>
          </View>
        </View>

        {/* Strip emas bawah kop */}
        <View style={styles.stripBawahKop} />

        {/* ── Judul Sertifikat ── */}
        <View style={styles.judulWrapper}>
          <Text style={styles.judulHiasan}>✦  Manajemen Al-Quran  ✦</Text>
          <Text style={styles.judulUtama}>SERTIFIKAT TAHFIZH AL-QURAN</Text>
          <Text style={styles.judulSub}>Tahfizh Al-Quran Bil Hifdz Wal Itqan</Text>
          <Text style={styles.nomorSertifikat}>No. {nomorSertifikat}</Text>
        </View>

        <GarisDekoratif />

        {/* ── Paragraf Pembuka ── */}
        <Text style={styles.paragrafPembuka}>
          Yang bertanda tangan di bawah ini menerangkan bahwa:
        </Text>

        {/* ── Identitas Santri ── */}
        <View style={styles.identitasBox}>
          <View style={styles.identitasRow}>
            <Text style={styles.identitasLabel}>Nama Lengkap</Text>
            <Text style={styles.identitasSep}>:</Text>
            <Text style={styles.identitasValue}>{santriName}</Text>
          </View>
          <View style={styles.identitasRow}>
            <Text style={styles.identitasLabel}>NIS</Text>
            <Text style={styles.identitasSep}>:</Text>
            <Text style={styles.identitasValue}>{nis}</Text>
          </View>
          <View style={[styles.identitasRow, { marginBottom: 0 }]}>
            <Text style={styles.identitasLabel}>Kelas</Text>
            <Text style={styles.identitasSep}>:</Text>
            <Text style={styles.identitasValue}>{kelasNama}</Text>
          </View>
        </View>

        {/* ── Paragraf Teks Sertifikat ── */}
        <Text style={styles.paragrafSertifikat}>
          {paragrafTeks ||
            `Telah berhasil menyelesaikan dan menghafalkan Al-Quran dengan baik ` +
            `sesuai dengan kaidah Tajwid yang benar di ${namaSekolah}. ` +
            `Sertifikat ini diberikan sebagai bentuk penghargaan atas dedikasi ` +
            `dan ketekunan dalam menghafal Kitabullah.`}
        </Text>

        {/* ── Detail Tahsin ── */}
        <View style={styles.TahsinRow}>
          <View style={styles.TahsinItem}>
            <Text style={styles.TahsinLabel}>Nama Surat</Text>
            <Text style={styles.TahsinValue}>{namaSurat}</Text>
          </View>
          <View style={styles.TahsinItem}>
            <Text style={styles.TahsinLabel}>Juz ke-</Text>
            <Text style={styles.TahsinValue}>{juzKe}</Text>
          </View>
          <View style={styles.TahsinItem}>
            <Text style={styles.TahsinLabel}>Status</Text>
            <Text style={[styles.TahsinValue, {
              fontSize: 10,
              color: statusKelulusan === 'Lulus' ? '#065f46'
                   : statusKelulusan === 'Proses' ? '#92400e'
                   : '#9f1239'
            }]}>
              {statusKelulusan}
            </Text>
          </View>
        </View>

        <GarisDekoratif />

        {/* ── Footer H1 ── */}
        <View style={styles.footerH1}>
          <Text style={styles.footerH1Text}>
            Sertifikat ini diterbitkan oleh {namaSekolah} dan dapat diverifikasi melalui sistem informasi resmi.{'\n'}
            Nomor: {nomorSertifikat}  •  Diterbitkan: {tanggalTerbit}
          </Text>
        </View>
      </Page>

      {/* ═══════════════════════════════════════════════════════
          HALAMAN 2 — LAMPIRAN NILAI Tahsin
      ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>

        {/* ── Header Lampiran ── */}
        <View style={styles.lampiranHeader}>
          <Text style={styles.lampiranJudul}>LAMPIRAN NILAI Tahsin</Text>
          <Text style={styles.lampiranSub}>
            Merupakan bagian tidak terpisahkan dari Sertifikat No. {nomorSertifikat}
          </Text>
        </View>

        <GarisDekoratif />

        {/* ── Info Santri ── */}
        <View style={styles.infoSantriRow}>
          <View style={styles.infoSantriBox}>
            <Text style={styles.infoSantriLabel}>Nama Lengkap</Text>
            <Text style={styles.infoSantriValue}>{santriName}</Text>
          </View>
          <View style={styles.infoSantriBox}>
            <Text style={styles.infoSantriLabel}>NIS</Text>
            <Text style={styles.infoSantriValue}>{nis}</Text>
          </View>
          <View style={styles.infoSantriBox}>
            <Text style={styles.infoSantriLabel}>Kelas</Text>
            <Text style={styles.infoSantriValue}>{kelasNama}</Text>
          </View>
          <View style={styles.infoSantriBox}>
            <Text style={styles.infoSantriLabel}>Surat / Juz</Text>
            <Text style={styles.infoSantriValue}>{namaSurat} / Juz {juzKe}</Text>
          </View>
        </View>

        {/* ── Tabel Nilai ── */}
        <View style={styles.tabel}>
          {/* Header tabel */}
          <View style={styles.tabelHeader}>
            <View style={styles.tabelHeaderCellNo}>
              <Text style={styles.tabelHeaderText}>No</Text>
            </View>
            <View style={styles.tabelHeaderCellKomponen}>
              <Text style={styles.tabelHeaderText}>Komponen Penilaian</Text>
            </View>
            <View style={styles.tabelHeaderCellNilai}>
              <Text style={styles.tabelHeaderText}>Nilai</Text>
            </View>
            <View style={styles.tabelHeaderCellPredikat}>
              <Text style={styles.tabelHeaderText}>Predikat</Text>
            </View>
          </View>

          {/* Baris data */}
          <TabelRow no="1" komponen="Tajwid"     nilai={nilaiTajwid}    isAlt={false} />
          <TabelRow no="2" komponen="Makhraj"    nilai={nilaiMakhraj}   isAlt={true}  />
          <TabelRow no="3" komponen="Kelancaran" nilai={nilaiKelancaran} isAlt={false} />

          {/* Baris rata-rata */}
          <TabelRow komponen="Rata-rata" nilai={nilaiRata} isFoot />
        </View>

        {/* ── Status Kelulusan ── */}
        <View style={[styles.statusBox, statusStyle]}>
          <Text style={[styles.statusText, statusTextStyle]}>
            Status Kelulusan: {statusEmoji}
          </Text>
          <Text style={[styles.statusText, statusTextStyle, { fontSize: 10 }]}>
            ({predikatRata.label})
          </Text>
        </View>

        {/* ── Catatan Guru (jika ada) ── */}
        {catatan ? (
          <View style={styles.catatanBox}>
            <Text style={styles.catatanLabel}>Catatan Guru</Text>
            <Text style={styles.catatanText}>&ldquo;{catatan}&rdquo;</Text>
          </View>
        ) : null}

        {/* ── Tanda Tangan ── */}
        <View style={styles.ttdWrapper}>
          <View style={styles.ttdBox}>
            <Text style={styles.ttdKota}>
              {kotaPenandatangan}, {tanggalTerbit}
            </Text>
            {/* Ruang tanda tangan */}
            <View style={styles.ttdGaris} />
            <Text style={styles.ttdNama}>{namaPenanggungJawab}</Text>
            <Text style={styles.ttdJabatan}>{jabatan}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
