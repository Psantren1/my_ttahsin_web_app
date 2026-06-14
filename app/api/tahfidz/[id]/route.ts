import { NextRequest, NextResponse } from 'next/server';
import { deleteTahfidz } from '@/lib/services/tahfidz.service';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteTahfidz(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data Tahfidz' }, { status: 500 });
  }
}
