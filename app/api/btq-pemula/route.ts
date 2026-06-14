import { NextRequest, NextResponse } from 'next/server';
import { getAllBtqPemula, getBtqPemulaByKelas, getBtqPemulaBySantri, getBtqPemulaByMusyrif, upsertBtqPemula } from '@/lib/services/btq-pemula.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santuario_id = searchParams.get('santuario_id');
    const musyrif_id = searchParams.get('musyrif_id');
    const kelas_id = searchParams.get('kelas_id');

    let data;
    if (santuario_id) {
      const record = await getBtqPemulaBySantri(santuario_id);
      data = record ? [record] : [];
    } else if (musyrif_id) {
      data = await getBtqPemulaByMusyrif(musyrif_id);
    } else if (kelas_id) {
      data = await getBtqPemulaByKelas(kelas_id);
    } else {
      data = await getAllBtqPemula();
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data BTQ Pemula' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await upsertBtqPemula(body);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data BTQ Pemula' }, { status: 500 });
  }
}
