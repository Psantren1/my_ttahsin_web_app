import { NextRequest, NextResponse } from 'next/server';
import { getAllKelas, createKelas } from '@/lib/services/kelas.service';
import { getSession } from '@/lib/auth/auth';

export async function GET() {
  try {
    const data = await getAllKelas();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat menambah kelas' }, { status: 403 });
    }

    const body = await request.json();
    const musyrif_ids: string[] = body.musyrif_id
      ? [body.musyrif_id]
      : body.musyrif_ids ?? [];

    const data = await createKelas({
      nama: body.nama,
      level: body.level ?? 7,
      deskripsi: body.deskripsi ?? null,
      musyrif_ids,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan kelas' }, { status: 500 });
  }
}
