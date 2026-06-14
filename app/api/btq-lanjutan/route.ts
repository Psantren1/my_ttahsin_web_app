import { NextRequest, NextResponse } from 'next/server';
import { getAllBtqLanjutan, getBtqLanjutanByKelas, getBtqLanjutanBySantri, getBtqLanjutanByMusyrif, upsertBtqLanjutan } from '@/lib/services/btq-lanjutan.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const musyrif_id = searchParams.get('musyrif_id');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (santuario_id) {
      const record = await getBtqLanjutanBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getBtqLanjutanByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getBtqLanjutanByKelas(kelas_id);
    } else {
      data = await getAllBtqLanjutan();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data BTQ Lanjutan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await upsertBtqLanjutan(body);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data BTQ Lanjutan' }, { status: 500 });
  }
}
