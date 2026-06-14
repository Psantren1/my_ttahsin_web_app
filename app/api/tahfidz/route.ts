import { NextRequest, NextResponse } from 'next/server';
import { getAllTahfidz, getTahfidzByKelas, getTahfidzBySantri, getTahfidzByMusyrif, upsertTahfidz } from '@/lib/services/tahfidz.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const musyrif_id = searchParams.get('musyrif_id');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (santuario_id) {
      const record = await getTahfidzBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getTahfidzByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getTahfidzByKelas(kelas_id);
    } else {
      data = await getAllTahfidz();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data Tahfidz' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await upsertTahfidz(body);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data Tahfidz' }, { status: 500 });
  }
}
