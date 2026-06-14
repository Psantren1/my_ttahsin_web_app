import { NextRequest, NextResponse } from 'next/server';
import { deleteMurojaah } from '@/lib/services/murojaah.service';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteMurojaah(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data Murojaah' }, { status: 500 });
  }
}
