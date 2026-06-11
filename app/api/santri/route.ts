import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersByRole, createUser } from '@/lib/services/user.service';

export async function GET() {
  try {
    const santri = await getAllUsersByRole('SANTRI');
    return NextResponse.json({ data: santri });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data santri' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser({
      email: body.email,
      password: body.password || 'santri123',
      full_name: body.full_name,
      role: 'SANTRI',
      nis: body.nis,
      kelas_id: body.kelas_id,
      target_hafalan: body.target_hafalan ?? 30,
      username: body.username,
      no_wa: body.no_wa,
      nisn: body.nisn,
      nama_ayah: body.nama_ayah,
      nama_ibu: body.nama_ibu,
      pekerjaan_ayah: body.pekerjaan_ayah,
      pekerjaan_ibu: body.pekerjaan_ibu,
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menambahkan santri' },
      { status: 500 }
    );
  }
}
