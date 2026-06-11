import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersByRole, createUser } from '@/lib/services/user.service';

export async function GET() {
  try {
    const musyrif = await getAllUsersByRole('MUSYRIF');
    return NextResponse.json({ data: musyrif });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data musyrif' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser({
      email: body.email,
      password: body.password || 'musyrif123',
      full_name: body.full_name,
      role: 'MUSYRIF',
      nip: body.nip,
      username: body.username,
      no_wa: body.no_wa,
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menambahkan musyrif' },
      { status: 500 }
    );
  }
}
