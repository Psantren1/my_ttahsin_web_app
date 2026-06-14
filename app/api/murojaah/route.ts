import { NextRequest, NextResponse } from 'next/server';
import { getAllMurojaah, getMurojaahByKelas, getMurojaahBySantri, getMurojaahByMusyrif, upsertMurojaah } from '@/lib/services/murojaah.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const musyrif_id = searchParams.get('musyrif_id');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (santuario_id) {
      const record = await getMurojaahBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getMurojaahByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getMurojaahByKelas(kelas_id);
    } else {
      data = await getAllMurojaah();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data Murojaah' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await upsertMurojaah(body);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data Murojaah' }, { status: 500 });
  }
}
